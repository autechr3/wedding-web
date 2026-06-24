import { describe, it, expect } from 'vitest';
import { validateRsvp, type RsvpDraft } from './rsvp';

const base: RsvpDraft = {
  fullName: 'Sam Guest', email: 'sam@example.com', partySize: 1,
  guests: [{ name: 'Sam Guest', georgiaFirst: 'Caesar Salad', georgiaEntree: '8oz Filet', georgiaDessert: 'Chocolate Mousse' }],
  events: { georgia: true, turkey_rehearsal: false, turkey_wedding: false },
  dietary: '', songRequest: '', note: '',
};

describe('validateRsvp', () => {
  it('accepts a valid draft', () => {
    expect(validateRsvp(base).valid).toBe(true);
  });
  it('requires a name', () => {
    expect(validateRsvp({ ...base, fullName: '' }).errors.fullName).toBeDefined();
  });
  it('requires a valid email', () => {
    expect(validateRsvp({ ...base, email: 'nope' }).errors.email).toBeDefined();
  });
  it('requires at least one event answered yes', () => {
    const r = validateRsvp({ ...base, events: { georgia: false, turkey_rehearsal: false, turkey_wedding: false } });
    expect(r.errors.events).toBeDefined();
  });
  it('requires all three Georgia courses when attending Georgia', () => {
    const r = validateRsvp({ ...base, guests: [{ name: 'Sam Guest', georgiaFirst: '', georgiaEntree: '8oz Filet', georgiaDessert: 'Chocolate Mousse' }] });
    expect(r.errors.guests).toBeDefined();
  });
});
