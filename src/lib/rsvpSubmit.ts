import type { RsvpDraft, EventKey } from './rsvp';

export interface RsvpRow { full_name: string; email: string; party_size: number; locale: string; song_request: string; note: string; }
export interface EventRow { event_key: EventKey; attending: boolean; }

export function buildRsvpRows(d: RsvpDraft, locale: string): { rsvp: RsvpRow; events: EventRow[] } {
  return {
    rsvp: { full_name: d.fullName.trim(), email: d.email.trim(), party_size: d.partySize, locale, song_request: d.songRequest, note: d.note },
    events: (Object.keys(d.events) as EventKey[]).map((k) => ({ event_key: k, attending: d.events[k] })),
  };
}

export async function submitRsvp(d: RsvpDraft, locale: string): Promise<{ error: string | null }> {
  const rows = buildRsvpRows(d, locale);

  // Lazy-load the Supabase client so @supabase/supabase-js is not pulled into
  // the initial bundle — it is only needed when an RSVP is actually submitted.
  const { supabase, isSupabaseConfigured } = await import('./supabase');

  // Stub path: no Supabase configured (e.g. local dev before backend is wired up).
  if (!isSupabaseConfigured || !supabase) {
    console.info('[RSVP stub] Supabase not configured — RSVP captured locally only:', rows);
    return { error: null };
  }

  // Generate the id client-side rather than using INSERT ... RETURNING. The anon
  // RLS policy grants INSERT only (no SELECT) so guests can't read RSVPs back —
  // and a RETURNING clause (what `.select()` adds) is a read, so RLS rejects it.
  // Minting the uuid here lets us link the child rows without reading anything.
  const id = crypto.randomUUID();
  const { error } = await supabase.from('rsvps').insert({ ...rows.rsvp, id });
  if (error) return { error: error.message };
  const { error: eErr } = await supabase.from('rsvp_events').insert(rows.events.map((e) => ({ ...e, rsvp_id: id })));
  if (eErr) return { error: eErr.message };
  return { error: null };
}
