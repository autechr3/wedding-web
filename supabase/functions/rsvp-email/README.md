# rsvp-email Edge Function

Emails the couple a summary whenever a new row is inserted into `rsvps`, via Resend.

## Deploy
```bash
supabase functions deploy rsvp-email --project-ref <your-project-ref>
```

## Secrets
```bash
supabase secrets set RESEND_API_KEY=re_xxx COUPLE_EMAIL=you@example.com
# Optional once domain verified:
supabase secrets set FROM_EMAIL=rsvp@negarandmatt.com
```

## DB webhook (fires the function on new RSVP)
In Supabase Dashboard → Database → Webhooks → Create:
- Table: `rsvps`
- Events: `INSERT`
- Type: Supabase Edge Function → `rsvp-email`

## Resend domain
1. Create a Resend account, add `negarandmatt.com`, and add the DKIM/SPF DNS records it
   provides (these go in the same registrar DNS panel as the Vercel records).
2. Until verified, the function falls back to `onboarding@resend.dev` as the sender so you
   can test immediately.

## Test
Insert a test row into `rsvps` (or submit the live form) and confirm the email arrives.
The function returns 400 (bad JSON), 500 (missing secrets), 502 (Resend error), or 200 (ok).
