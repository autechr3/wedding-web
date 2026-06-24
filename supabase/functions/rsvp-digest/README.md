# rsvp-digest Edge Function

Sends the couple **one daily summary email** of all RSVPs (every party, each
guest's meal choices, and event selections) via Resend. Triggered by Supabase
Cron at **21:00 UTC = 5:00 PM US Eastern (EDT)**. There is no per-RSVP email.

Already done (via the Supabase connection):
- Function deployed (`rsvp-digest`, JWT-verified).
- `pg_cron` + `pg_net` enabled.
- Cron job `rsvp-daily-digest` scheduled `0 21 * * *`, calling the function.

## What's left — you (accounts + secrets)

### 1. Resend account + API key
- Create a free account at https://resend.com and copy an **API key** (`re_...`).

### 2. Verify negarandmatt.com in Resend (so it can send from your domain to both of you)
- Resend → **Domains** → **Add Domain** → `negarandmatt.com`.
- Resend shows ~3 DNS records (a DKIM `TXT`, an SPF/`MX` for a `send` subdomain,
  and a return-path). Add them in **Namecheap → Advanced DNS** alongside the
  Vercel records. These use a `send` subdomain / DKIM selector, so they do **not**
  disturb your apex Vercel records or the existing `eforward` MX.
- Wait for Resend to show the domain **Verified** (minutes to a couple hours).
- (You can skip this to start: leave `FROM_EMAIL` unset and Resend sends from
  `onboarding@resend.dev`, but that only reaches your Resend account email.)

### 3. Set the function secrets
Supabase Dashboard → **Edge Functions → Manage secrets** (or `supabase secrets set`):
- `RESEND_API_KEY` = `re_...`
- `DIGEST_RECIPIENTS` = `you@example.com,her@example.com`  *(comma-separated)*
- `FROM_EMAIL` = `rsvp@negarandmatt.com`  *(once the domain is Verified)*

### 4. Test it now (don't wait for 5 PM)
```bash
curl -X POST "https://sgmtpdpdozzltxqtnmpw.supabase.co/functions/v1/rsvp-digest" \
  -H "Authorization: Bearer <project anon key>" -H "Content-Type: application/json" -d '{}'
```
Expect `{"ok":true,"parties":N,"guests":M}` and the email to arrive. If there are
zero RSVPs it returns `{"ok":true,"skipped":"no RSVPs yet"}` and sends nothing.

## Notes
- Reads via the service role (sees through RLS); recipients are not exposed publicly.
- DST: `0 21 * * *` is 5 PM **EDT**. After ~Nov 2 2026 (EST) it would arrive at
  4 PM ET — irrelevant since RSVPs close before then. To change: re-run
  `cron.schedule('rsvp-daily-digest', '0 22 * * *', …)`.
- To pause: `select cron.unschedule('rsvp-daily-digest');`
