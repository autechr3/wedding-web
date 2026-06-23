import { supabase, isSupabaseConfigured } from './supabase';
import type { RsvpDraft, EventKey } from './rsvp';

export interface RsvpRow { full_name: string; email: string; party_size: number; locale: string; dietary: string; song_request: string; note: string; }
export interface GuestRow { guest_name: string; georgia_main: string; }
export interface EventRow { event_key: EventKey; attending: boolean; }

export function buildRsvpRows(d: RsvpDraft, locale: string): { rsvp: RsvpRow; guests: GuestRow[]; events: EventRow[] } {
  return {
    rsvp: { full_name: d.fullName.trim(), email: d.email.trim(), party_size: d.partySize, locale, dietary: d.dietary, song_request: d.songRequest, note: d.note },
    guests: d.guests.map((g) => ({ guest_name: g.name.trim(), georgia_main: g.georgiaMain })),
    events: (Object.keys(d.events) as EventKey[]).map((k) => ({ event_key: k, attending: d.events[k] })),
  };
}

export async function submitRsvp(d: RsvpDraft, locale: string): Promise<{ error: string | null }> {
  const rows = buildRsvpRows(d, locale);

  // Stub path: no Supabase configured (e.g. local dev before backend is wired up).
  if (!isSupabaseConfigured || !supabase) {
    console.info('[RSVP stub] Supabase not configured — RSVP captured locally only:', rows);
    return { error: null };
  }

  const { data, error } = await supabase.from('rsvps').insert(rows.rsvp).select('id').single();
  if (error || !data) return { error: error?.message ?? 'Insert failed' };
  const id = (data as { id: string }).id;
  const { error: gErr } = await supabase.from('rsvp_guests').insert(rows.guests.map((g) => ({ ...g, rsvp_id: id })));
  if (gErr) return { error: gErr.message };
  const { error: eErr } = await supabase.from('rsvp_events').insert(rows.events.map((e) => ({ ...e, rsvp_id: id })));
  if (eErr) return { error: eErr.message };
  return { error: null };
}
