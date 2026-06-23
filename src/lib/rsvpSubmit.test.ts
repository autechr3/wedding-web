import { describe, it, expect } from 'vitest';
import { buildRsvpRows } from './rsvpSubmit';
import type { RsvpDraft } from './rsvp';

const draft: RsvpDraft = {
  fullName: 'Sam Guest', email: 'sam@example.com', partySize: 2,
  guests: [{ name: 'Sam Guest', georgiaMain: 'Filet' }, { name: 'Pat Plus', georgiaMain: 'Salmon' }],
  events: { georgia: true, turkey_rehearsal: false, turkey_wedding: true, boat: false },
  dietary: 'none', songRequest: 'Dancing Queen', note: 'Yay',
};

describe('buildRsvpRows', () => {
  const { rsvp, guests, events } = buildRsvpRows(draft, 'en');
  it('maps the rsvp row', () => {
    expect(rsvp).toMatchObject({ full_name: 'Sam Guest', email: 'sam@example.com', party_size: 2, locale: 'en', dietary: 'none', song_request: 'Dancing Queen', note: 'Yay' });
  });
  it('maps one guest row per guest', () => {
    expect(guests).toHaveLength(2);
    expect(guests[1]).toMatchObject({ guest_name: 'Pat Plus', georgia_main: 'Salmon' });
  });
  it('maps one event row per event with attendance', () => {
    expect(events).toHaveLength(4);
    const wedding = events.find((e) => e.event_key === 'turkey_wedding');
    expect(wedding?.attending).toBe(true);
  });
});
