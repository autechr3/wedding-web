import { describe, it, expect } from 'vitest';
import { validateRsvp, type RsvpDraft } from './rsvp';

const base: RsvpDraft = {
  fullName: 'Sam Guest', email: 'sam@example.com', partySize: 1,
  guests: [{ name: 'Sam Guest', georgiaMain: 'Filet' }],
  events: { georgia: true, turkey_rehearsal: false, turkey_wedding: false, boat: false },
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
    const r = validateRsvp({ ...base, events: { georgia: false, turkey_rehearsal: false, turkey_wedding: false, boat: false } });
    expect(r.errors.events).toBeDefined();
  });
  it('requires a Georgia main course when attending Georgia', () => {
    const r = validateRsvp({ ...base, guests: [{ name: 'Sam Guest', georgiaMain: '' }] });
    expect(r.errors.guests).toBeDefined();
  });
});
