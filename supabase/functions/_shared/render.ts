// Shared rendering helpers for the RSVP emails (daily digest + instant notify).
// Both functions render the same "detailed card" for an RSVP, so it lives here
// to avoid the two drifting apart when the RSVP shape changes.

export const EVENT_NAMES: Record<string, string> = {
  georgia: 'Georgia Celebration',
  turkey_rehearsal: 'Rehearsal Dinner',
  turkey_wedding: 'Wedding & Reception',
};

// Short labels for the compact attendance table columns.
export const EVENT_SHORT: Record<string, string> = {
  georgia: 'Georgia',
  turkey_rehearsal: 'Rehearsal',
  turkey_wedding: 'Wedding',
};

// The exact column projection used by every RSVP query. Keeping it here means a
// schema change is a one-line edit shared by both functions.
export const RSVP_SELECT =
  'id, created_at, full_name, email, party_size, locale, song_request, note, rsvp_events(event_key, attending)';

export interface EventRow { event_key: string; attending: boolean; }
export interface Rsvp {
  id: string; created_at: string; full_name: string; email: string;
  party_size: number; locale: string;
  song_request: string | null; note: string | null;
  rsvp_events: EventRow[];
}

export function esc(v: unknown): string {
  return String(v ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

// "Jun 24, 3:42 PM" in Eastern time — full timestamp for the detailed cards.
export function fmtDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', {
      timeZone: 'America/New_York', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  } catch { return iso; }
}

// "Jun 24" in Eastern time — date only, for the compact table.
export function fmtDay(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      timeZone: 'America/New_York', month: 'short', day: 'numeric',
    });
  } catch { return iso; }
}

// Names of the events this party is attending, in canonical order.
export function attendingNames(r: Rsvp): string[] {
  const yes = new Set((r.rsvp_events ?? []).filter((e) => e.attending).map((e) => e.event_key));
  return Object.keys(EVENT_NAMES).filter((k) => yes.has(k)).map((k) => EVENT_NAMES[k]);
}

function row(label: string, value: string): string {
  if (!value) return '';
  return `<p style="margin:2px 0;"><strong style="color:#2b3667;">${esc(label)}:</strong> ${value}</p>`;
}

// The detailed RSVP card, shared by the instant email and the digest's
// "new today" section.
export function renderCard(r: Rsvp): string {
  const attending = attendingNames(r).map(esc);
  return `
    <div style="border:1px solid #e2dcc9;border-radius:6px;padding:14px 16px;margin:14px 0;">
      <h3 style="margin:0 0 6px;color:#2b3667;font-size:17px;">
        ${esc(r.full_name)} <span style="font-weight:400;color:#888;font-size:14px;">· party of ${esc(r.party_size)} · ${esc(r.locale)}</span>
      </h3>
      ${row('Email', esc(r.email))}
      ${row('Attending', attending.length ? attending.join(', ') : '<em>none selected</em>')}
      ${row('Song request', esc(r.song_request))}
      ${row('Note', esc(r.note))}
      <p style="margin:6px 0 0;color:#aaa;font-size:12px;">Submitted ${esc(fmtDateTime(r.created_at))} ET</p>
    </div>`;
}
