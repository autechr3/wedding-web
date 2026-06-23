export type EventKey = 'georgia' | 'turkey_rehearsal' | 'turkey_wedding' | 'boat';

export interface GuestDraft { name: string; georgiaMain: string; }
export interface RsvpDraft {
  fullName: string; email: string; partySize: number;
  guests: GuestDraft[];
  events: Record<EventKey, boolean>;
  dietary: string; songRequest: string; note: string;
}

export interface ValidationResult { valid: boolean; errors: Record<string, string>; }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRsvp(d: RsvpDraft): ValidationResult {
  const errors: Record<string, string> = {};
  if (!d.fullName.trim()) errors.fullName = 'Name is required';
  if (!EMAIL_RE.test(d.email)) errors.email = 'A valid email is required';
  if (!Object.values(d.events).some(Boolean)) errors.events = 'Please RSVP to at least one event';
  if (d.events.georgia && d.guests.some((g) => !g.georgiaMain.trim())) {
    errors.guests = 'Please choose a main course for each guest attending the Georgia dinner';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
