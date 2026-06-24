// Supabase Edge Function: daily RSVP digest.
//
// Triggered on a schedule by Supabase Cron (pg_cron). Reads every RSVP (with
// each guest's meal choices and event selections) using the service role, then
// emails one summary to the couple via Resend.
//
// Required secrets (Edge Functions → Secrets, or `supabase secrets set`):
//   RESEND_API_KEY      - Resend API key
//   DIGEST_RECIPIENTS   - comma-separated recipient emails (e.g. "a@x.com,b@y.com")
// Optional:
//   FROM_EMAIL          - verified sender (default onboarding@resend.dev;
//                         set to rsvp@negarandmatt.com once the domain verifies)
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const EVENT_NAMES: Record<string, string> = {
  georgia: 'Georgia Celebration',
  turkey_rehearsal: 'Rehearsal Dinner',
  turkey_wedding: 'Wedding & Reception',
};

interface Guest { guest_name: string | null; georgia_first: string | null; georgia_entree: string | null; georgia_dessert: string | null; }
interface EventRow { event_key: string; attending: boolean; }
interface Rsvp {
  id: string; created_at: string; full_name: string; email: string;
  party_size: number; locale: string; dietary: string | null;
  song_request: string | null; note: string | null;
  rsvp_guests: Guest[]; rsvp_events: EventRow[];
}

function esc(v: unknown): string {
  return String(v ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', {
      timeZone: 'America/New_York', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  } catch { return iso; }
}

function row(label: string, value: string): string {
  if (!value) return '';
  return `<p style="margin:2px 0;"><strong style="color:#2b3667;">${esc(label)}:</strong> ${value}</p>`;
}

function renderRsvp(r: Rsvp): string {
  const attending = (r.rsvp_events ?? [])
    .filter((e) => e.attending)
    .map((e) => esc(EVENT_NAMES[e.event_key] ?? e.event_key));
  const goingToGeorgia = (r.rsvp_events ?? []).some((e) => e.event_key === 'georgia' && e.attending);

  const guests = (r.rsvp_guests ?? []).map((g, i) => {
    const courses = goingToGeorgia && (g.georgia_first || g.georgia_entree || g.georgia_dessert)
      ? `<div style="color:#555;font-size:13px;margin-left:12px;">Georgia courses: ${[g.georgia_first, g.georgia_entree, g.georgia_dessert].filter(Boolean).map(esc).join(' · ') || '—'}</div>`
      : '';
    return `<li style="margin:4px 0;">${esc(g.guest_name) || `Guest ${i + 1}`}${courses}</li>`;
  }).join('');

  return `
    <div style="border:1px solid #e2dcc9;border-radius:6px;padding:14px 16px;margin:14px 0;">
      <h3 style="margin:0 0 6px;color:#2b3667;font-size:17px;">
        ${esc(r.full_name)} <span style="font-weight:400;color:#888;font-size:14px;">· party of ${esc(r.party_size)} · ${esc(r.locale)}</span>
      </h3>
      ${row('Email', esc(r.email))}
      ${row('Attending', attending.length ? attending.join(', ') : '<em>none selected</em>')}
      ${guests ? `<p style="margin:8px 0 2px;"><strong style="color:#2b3667;">Guests:</strong></p><ul style="margin:0 0 6px;padding-left:20px;">${guests}</ul>` : ''}
      ${row('Dietary', esc(r.dietary))}
      ${row('Song request', esc(r.song_request))}
      ${row('Note', esc(r.note))}
      <p style="margin:6px 0 0;color:#aaa;font-size:12px;">Submitted ${esc(fmtDate(r.created_at))} ET</p>
    </div>`;
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
    .select('id, created_at, full_name, email, party_size, locale, dietary, song_request, note, rsvp_guests(guest_name, georgia_first, georgia_entree, georgia_dessert), rsvp_events(event_key, attending)')
    .order('created_at', { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const rsvps = (data ?? []) as unknown as Rsvp[];
  if (rsvps.length === 0) {
    return Response.json({ ok: true, skipped: 'no RSVPs yet' });
  }

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
    .join(' &nbsp;·&nbsp; ');

  const html = `
    <div style="font-family:Georgia,'Times New Roman',serif;max-width:640px;margin:0 auto;color:#222;">
      <h2 style="color:#2b3667;border-bottom:2px solid #c79a4b;padding-bottom:8px;">Wedding RSVPs — daily digest</h2>
      <p style="font-size:15px;">
        <strong>${totalParties}</strong> ${totalParties === 1 ? 'party' : 'parties'} ·
        <strong>${totalGuests}</strong> ${totalGuests === 1 ? 'guest' : 'guests'} total
      </p>
      <p style="font-size:14px;color:#444;">Attending by event — ${eventSummary}</p>
      ${rsvps.map(renderRsvp).join('')}
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
  return Response.json({ ok: true, parties: totalParties, guests: totalGuests });
});
