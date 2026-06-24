export type EventKey = 'georgia' | 'turkey_rehearsal' | 'turkey_wedding';

export interface RsvpDraft {
  fullName: string; email: string; partySize: number;
  events: Record<EventKey, boolean>;
  songRequest: string; note: string;
}

export interface ValidationResult { valid: boolean; errors: Record<string, string>; }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRsvp(d: RsvpDraft): ValidationResult {
  const errors: Record<string, string> = {};
  if (!d.fullName.trim()) errors.fullName = 'Name is required';
  if (!EMAIL_RE.test(d.email)) errors.email = 'A valid email is required';
  if (!Object.values(d.events).some(Boolean)) errors.events = 'Please RSVP to at least one event';
  return { valid: Object.keys(errors).length === 0, errors };
}
