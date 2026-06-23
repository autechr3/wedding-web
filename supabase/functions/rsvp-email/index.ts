// Supabase Edge Function: on a new RSVP (DB webhook INSERT on `rsvps`),
// email the couple a summary via Resend.
//
// Required secrets (set with `supabase secrets set`):
//   RESEND_API_KEY  - Resend API key
//   COUPLE_EMAIL    - recipient (e.g. the couple's inbox)
// Optional:
//   FROM_EMAIL      - verified sender (default: onboarding@resend.dev for testing;
//                     set to rsvp@negarandmatt.com once the domain is verified)

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

interface RsvpRecord {
  id?: string;
  full_name?: string;
  email?: string;
  party_size?: number;
  locale?: string;
  dietary?: string;
  song_request?: string;
  note?: string;
  created_at?: string;
}

interface WebhookPayload {
  type?: string;
  table?: string;
  record?: RsvpRecord;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

serve(async (req) => {
  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (payload.type && payload.type !== 'INSERT') {
    return new Response('Ignored (not an insert)', { status: 200 });
  }

  const r = payload.record ?? {};
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const to = Deno.env.get('COUPLE_EMAIL');
  const from = Deno.env.get('FROM_EMAIL') ?? 'onboarding@resend.dev';

  if (!resendKey || !to) {
    return new Response('Missing RESEND_API_KEY or COUPLE_EMAIL', { status: 500 });
  }

  const html = `
    <h2>New RSVP — ${escapeHtml(r.full_name)}</h2>
    <p>
      <strong>Email:</strong> ${escapeHtml(r.email)}<br/>
      <strong>Party size:</strong> ${escapeHtml(r.party_size)}<br/>
      <strong>Language:</strong> ${escapeHtml(r.locale)}
    </p>
    <p>
      <strong>Dietary:</strong> ${escapeHtml(r.dietary) || '—'}<br/>
      <strong>Song request:</strong> ${escapeHtml(r.song_request) || '—'}
    </p>
    <p><strong>Note:</strong> ${escapeHtml(r.note) || '—'}</p>
    <p style="color:#888">See the Supabase dashboard for per-event answers and meal choices (rsvp_events, rsvp_guests).</p>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `RSVP <${from}>`,
      to: [to],
      subject: `RSVP: ${r.full_name ?? 'New guest'}`,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return new Response(`Resend error: ${detail}`, { status: 502 });
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
