// Supabase Edge Function: instant RSVP notification.
//
// Fired by a Postgres trigger (AFTER INSERT on rsvp_events, statement-level) via
// pg_net, once per submitted RSVP. Reads that single RSVP (with its events) using
// the service role and emails a detailed card to the couple via Resend — so they
// get a heads-up the moment someone responds, in addition to the daily digest.
//
// The trigger fires on rsvp_events (the client's *second* write) rather than on
// rsvps, so by the time this runs both rows are committed and the card is complete.
//
// Required secrets (Edge Functions -> Secrets):
//   RESEND_API_KEY      - Resend API key (shared with the digest)
//   INSTANT_RECIPIENTS  - comma-separated emails for per-RSVP alerts. SEPARATE
//                         from DIGEST_RECIPIENTS. If unset, this function no-ops
//                         (returns ok) so the trigger never errors.
// Optional:
//   FROM_EMAIL          - verified sender (default onboarding@resend.dev)
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';
import { RSVP_SELECT, type Rsvp, attendingNames, renderCard } from '../_shared/render.ts';

Deno.serve(async (req) => {
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const recipients = (Deno.env.get('INSTANT_RECIPIENTS') ?? '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  const from = Deno.env.get('FROM_EMAIL') ?? 'onboarding@resend.dev';

  // No instant recipients configured -> feature is off. Succeed quietly so the
  // DB trigger's pg_net call gets a clean 200 instead of retrying/erroring.
  if (recipients.length === 0) {
    return Response.json({ ok: true, skipped: 'INSTANT_RECIPIENTS not set' });
  }
  if (!resendKey) {
    return Response.json({ error: 'Missing RESEND_API_KEY' }, { status: 500 });
  }

  let id: string | undefined;
  try {
    id = (await req.json())?.id;
  } catch { /* no/invalid body */ }
  if (!id) {
    return Response.json({ error: 'Missing rsvp id in body' }, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data, error } = await supabase
    .from('rsvps')
    .select(RSVP_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!data) return Response.json({ ok: true, skipped: `no rsvp ${id}` });

  const r = data as unknown as Rsvp;
  const attending = attendingNames(r);
  const html = `
    <div style="font-family:Georgia,'Times New Roman',serif;max-width:640px;margin:0 auto;color:#222;">
      <h2 style="color:#2b3667;border-bottom:2px solid #c79a4b;padding-bottom:8px;">New wedding RSVP</h2>
      ${renderCard(r)}
    </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `Negar & Matt RSVPs <${from}>`,
      to: recipients,
      subject: `New RSVP — ${r.full_name} (party of ${r.party_size}${attending.length ? `, ${attending.length} event${attending.length === 1 ? '' : 's'}` : ''})`,
      html,
    }),
  });

  if (!res.ok) {
    return Response.json({ error: `Resend error: ${await res.text()}` }, { status: 502 });
  }
  return Response.json({ ok: true, id, sent_to: recipients.length });
});
