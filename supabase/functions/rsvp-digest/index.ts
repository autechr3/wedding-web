// Supabase Edge Function: daily RSVP digest.
//
// Triggered on a schedule by Supabase Cron (pg_cron). Reads every RSVP (with its
// event selections) using the service role, then emails one summary to the
// couple via Resend. The email has two parts: detailed cards for RSVPs received
// in the last 24 hours, then a compact attendance table of everyone so far.
//
// Required secrets (Edge Functions -> Secrets, or `supabase secrets set`):
//   RESEND_API_KEY      - Resend API key
//   DIGEST_RECIPIENTS   - comma-separated recipient emails (e.g. "a@x.com,b@y.com")
// Optional:
//   FROM_EMAIL          - verified sender (default onboarding@resend.dev;
//                         set to rsvp@negarandmatt.com once the domain verifies)
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';
import {
  EVENT_NAMES, EVENT_SHORT, RSVP_SELECT, type Rsvp,
  esc, fmtDay, renderCard,
} from '../_shared/render.ts';

const NEW_WINDOW_MS = 24 * 60 * 60 * 1000;

// One <tr> in the compact attendance table: name, party, a check/dash per event,
// then the day it came in.
function tableRow(r: Rsvp, zebra: boolean): string {
  const attending = new Set((r.rsvp_events ?? []).filter((e) => e.attending).map((e) => e.event_key));
  const cells = Object.keys(EVENT_NAMES).map((k) => {
    const yes = attending.has(k);
    return `<td style="padding:6px 8px;text-align:center;color:${yes ? '#2b7a3f' : '#cfcabb'};">${yes ? '&#10003;' : '&middot;'}</td>`;
  }).join('');
  const bg = zebra ? 'background:#faf8f1;' : '';
  return `
    <tr style="${bg}">
      <td style="padding:6px 8px;color:#222;">${esc(r.full_name)}</td>
      <td style="padding:6px 8px;text-align:center;color:#444;">${esc(r.party_size)}</td>
      ${cells}
      <td style="padding:6px 8px;color:#999;white-space:nowrap;">${esc(fmtDay(r.created_at))}</td>
    </tr>`;
}

function renderTable(rsvps: Rsvp[]): string {
  const headCell = (label: string, center = false) =>
    `<th style="padding:8px;text-align:${center ? 'center' : 'left'};font-weight:600;">${esc(label)}</th>`;
  const eventHeads = Object.keys(EVENT_NAMES).map((k) => headCell(EVENT_SHORT[k] ?? k, true)).join('');
  const body = rsvps.map((r, i) => tableRow(r, i % 2 === 1)).join('');
  return `
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:8px;">
      <thead>
        <tr style="color:#2b3667;border-bottom:2px solid #c79a4b;">
          ${headCell('Name')}${headCell('Party', true)}${eventHeads}${headCell("RSVP'd")}
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>`;
}

Deno.serve(async () => {
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const recipients = (Deno.env.get('DIGEST_RECIPIENTS') ?? '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  const from = Deno.env.get('FROM_EMAIL') ?? 'onboarding@resend.dev';

  if (!resendKey || recipients.length === 0) {
    return Response.json({
      error: 'Missing config',
      RESEND_API_KEY_present: Boolean(resendKey),
      DIGEST_RECIPIENTS_count: recipients.length,
      FROM_EMAIL: from,
    }, { status: 500 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data, error } = await supabase
    .from('rsvps')
    .select(RSVP_SELECT)
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const rsvps = (data ?? []) as unknown as Rsvp[];
  if (rsvps.length === 0) {
    return Response.json({ ok: true, skipped: 'no RSVPs yet' });
  }

  const cutoff = Date.now() - NEW_WINDOW_MS;
  const fresh = rsvps.filter((r) => {
    const t = Date.parse(r.created_at);
    return Number.isFinite(t) && t >= cutoff;
  });

  const totalParties = rsvps.length;
  const totalGuests = rsvps.reduce((n, r) => n + (r.party_size ?? 0), 0);
  const eventCounts: Record<string, number> = {};
  for (const r of rsvps) {
    for (const e of r.rsvp_events ?? []) {
      if (e.attending) eventCounts[e.event_key] = (eventCounts[e.event_key] ?? 0) + 1;
    }
  }
  const eventSummary = Object.entries(EVENT_NAMES)
    .map(([k, name]) => `${esc(name)}: <strong>${eventCounts[k] ?? 0}</strong>`)
    .join(' &nbsp;&middot;&nbsp; ');

  const newSection = fresh.length
    ? `<h3 style="color:#2b3667;margin:18px 0 0;">New in the last 24 hours — ${fresh.length}</h3>
       ${fresh.map(renderCard).join('')}`
    : `<p style="color:#777;font-style:italic;margin:18px 0;">No new RSVPs in the last 24 hours.</p>`;

  const html = `
    <div style="font-family:Georgia,'Times New Roman',serif;max-width:680px;margin:0 auto;color:#222;">
      <h2 style="color:#2b3667;border-bottom:2px solid #c79a4b;padding-bottom:8px;">Wedding RSVPs — daily digest</h2>
      <p style="font-size:15px;">
        <strong>${totalParties}</strong> ${totalParties === 1 ? 'party' : 'parties'} &middot;
        <strong>${totalGuests}</strong> ${totalGuests === 1 ? 'guest' : 'guests'} total
      </p>
      <p style="font-size:14px;color:#444;">Attending by event — ${eventSummary}</p>
      ${newSection}
      <h3 style="color:#2b3667;margin:24px 0 0;border-top:1px solid #e2dcc9;padding-top:16px;">All RSVPs — ${totalParties}</h3>
      ${renderTable(rsvps)}
    </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `Negar & Matt RSVPs <${from}>`,
      to: recipients,
      subject: `Wedding RSVPs — ${totalParties} ${totalParties === 1 ? 'party' : 'parties'}, ${totalGuests} guests`,
      html,
    }),
  });

  if (!res.ok) {
    return Response.json({ error: `Resend error: ${await res.text()}` }, { status: 502 });
  }
  return Response.json({ ok: true, parties: totalParties, guests: totalGuests, new: fresh.length });
});
