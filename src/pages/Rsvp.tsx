import { useState } from 'react';
import { useLocale } from '../locale/useLocale';
import { validateRsvp, type RsvpDraft, type EventKey } from '../lib/rsvp';
import { submitRsvp } from '../lib/rsvpSubmit';
import { GEORGIA_MAINS } from '../content/georgiaMenu';
import { EVENTS } from '../content/events';

const EMPTY: RsvpDraft = {
  fullName: '', email: '', partySize: 1,
  guests: [{ name: '', georgiaMain: '' }],
  events: { georgia: false, turkey_rehearsal: false, turkey_wedding: false, boat: false },
  dietary: '', songRequest: '', note: '',
};

const INPUT =
  'mt-1 w-full bg-transparent border border-gold-soft/40 px-3 py-2 text-cream placeholder:text-cream/40 focus:outline-none focus:border-gold-soft transition-colors';

export default function Rsvp() {
  const { locale } = useLocale();
  const [draft, setDraft] = useState<RsvpDraft>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  function setEvent(k: EventKey, v: boolean) {
    setDraft((d) => ({ ...d, events: { ...d.events, [k]: v } }));
  }
  function setGuest(i: number, patch: Partial<RsvpDraft['guests'][number]>) {
    setDraft((d) => ({ ...d, guests: d.guests.map((g, idx) => (idx === i ? { ...g, ...patch } : g)) }));
  }
  function setPartySize(n: number) {
    setDraft((d) => {
      const guests = Array.from({ length: n }, (_, i) => d.guests[i] ?? { name: '', georgiaMain: '' });
      return { ...d, partySize: n, guests };
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = validateRsvp(draft);
    setErrors(res.errors);
    if (!res.valid) return;
    setStatus('sending');
    const { error } = await submitRsvp(draft, locale);
    setStatus(error ? 'error' : 'done');
  }

  if (status === 'done') {
    return (
      <div data-testid="page-rsvp" className="max-w-xl mx-auto px-5 py-16 text-center text-cream">
        <h2 className="font-serif text-3xl text-gold-soft">Thank you!</h2>
        <p className="text-cream/80 mt-4 leading-relaxed">
          Your RSVP has been received. We can&rsquo;t wait to celebrate with you.
        </p>
      </div>
    );
  }

  return (
    <form
      data-testid="page-rsvp"
      onSubmit={onSubmit}
      noValidate
      className="max-w-xl mx-auto px-5 py-12 space-y-6 text-cream text-start"
    >
      <h2 className="font-serif text-3xl text-center text-gold-soft">RSVP</h2>

      <label className="block text-sm tracking-wide">
        Full name
        <input
          className={INPUT}
          value={draft.fullName}
          onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
        />
      </label>
      {errors.fullName && <p className="text-gold-soft text-sm" role="alert">{errors.fullName}</p>}

      <label className="block text-sm tracking-wide">
        Email
        <input
          type="email"
          className={INPUT}
          value={draft.email}
          onChange={(e) => setDraft({ ...draft, email: e.target.value })}
        />
      </label>
      {errors.email && <p className="text-gold-soft text-sm" role="alert">{errors.email}</p>}

      <label className="block text-sm tracking-wide">
        Party size
        <input
          type="number"
          min={1}
          max={8}
          className={`${INPUT} w-24`}
          value={draft.partySize}
          onChange={(e) => setPartySize(Math.max(1, Math.min(8, Number(e.target.value) || 1)))}
        />
      </label>

      <fieldset className="border border-gold-soft/30 p-4">
        <legend className="px-2 font-serif text-gold-soft">Which events will you attend?</legend>
        {EVENTS.map((ev) => (
          <label key={ev.key} className="flex items-center gap-3 py-1.5 cursor-pointer">
            <input
              type="checkbox"
              className="accent-gold"
              checked={draft.events[ev.key]}
              onChange={(e) => setEvent(ev.key, e.target.checked)}
            />
            <span>{locale === 'fa' ? ev.titleFa : ev.titleEn}</span>
          </label>
        ))}
      </fieldset>
      {errors.events && <p className="text-gold-soft text-sm" role="alert">{errors.events}</p>}

      {draft.events.georgia && (
        <fieldset className="border border-gold-soft/30 p-4 space-y-3">
          <legend className="px-2 font-serif text-gold-soft">Georgia dinner — main course per guest</legend>
          {draft.guests.map((g, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-2">
              <input
                aria-label={`Guest ${i + 1} name`}
                placeholder={`Guest ${i + 1} name`}
                className={`${INPUT} mt-0 flex-1`}
                value={g.name}
                onChange={(e) => setGuest(i, { name: e.target.value })}
              />
              <select
                aria-label={`Guest ${i + 1} main course`}
                className="bg-cobalt-deep text-cream border border-gold-soft/40 px-3 py-2 focus:outline-none focus:border-gold-soft transition-colors"
                value={g.georgiaMain}
                onChange={(e) => setGuest(i, { georgiaMain: e.target.value })}
              >
                <option value="">Select…</option>
                {GEORGIA_MAINS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          ))}
        </fieldset>
      )}
      {errors.guests && <p className="text-gold-soft text-sm" role="alert">{errors.guests}</p>}

      <label className="block text-sm tracking-wide">
        Dietary restrictions
        <input
          className={INPUT}
          value={draft.dietary}
          onChange={(e) => setDraft({ ...draft, dietary: e.target.value })}
        />
      </label>

      <label className="block text-sm tracking-wide">
        Song request (optional)
        <input
          className={INPUT}
          value={draft.songRequest}
          onChange={(e) => setDraft({ ...draft, songRequest: e.target.value })}
        />
      </label>

      <label className="block text-sm tracking-wide">
        Note to the couple (optional)
        <textarea
          rows={3}
          className={`${INPUT} resize-y`}
          value={draft.note}
          onChange={(e) => setDraft({ ...draft, note: e.target.value })}
        />
      </label>

      {status === 'error' && (
        <p className="text-gold-soft" role="alert">Something went wrong — please try again.</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="border border-gold text-gold-soft px-8 py-3 text-xs uppercase tracking-[0.25em] hover:bg-gold/10 transition-colors disabled:opacity-50 focus-visible:outline focus-visible:outline-1 focus-visible:outline-gold-soft focus-visible:outline-offset-2"
      >
        {status === 'sending' ? 'Sending…' : 'Send RSVP'}
      </button>
    </form>
  );
}
