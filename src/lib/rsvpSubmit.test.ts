import { describe, it, expect, vi, afterEach } from 'vitest';
import { buildRsvpRows } from './rsvpSubmit';
import type { RsvpDraft } from './rsvp';

const draft: RsvpDraft = {
  fullName: 'Sam Guest', email: 'sam@example.com', partySize: 2,
  events: { georgia: true, turkey_rehearsal: false, turkey_wedding: true },
  songRequest: 'Dancing Queen', note: 'Yay',
};

describe('buildRsvpRows', () => {
  const { rsvp, events } = buildRsvpRows(draft, 'en');
  it('maps the rsvp row', () => {
    expect(rsvp).toMatchObject({ full_name: 'Sam Guest', email: 'sam@example.com', party_size: 2, locale: 'en', song_request: 'Dancing Queen', note: 'Yay' });
  });
  it('maps one event row per event with attendance', () => {
    expect(events).toHaveLength(3);
    const wedding = events.find((e) => e.event_key === 'turkey_wedding');
    expect(wedding?.attending).toBe(true);
  });
});

describe('submitRsvp persistence', () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock('./supabase');
  });

  it('inserts the parent with a client-generated id and no RETURNING, linking events by that id', async () => {
    // Records every .from(table).insert(payload) call. insert() resolves to a
    // plain { error } — it deliberately has NO .select(), so if the code tries
    // an INSERT ... RETURNING (which anon RLS forbids on these tables) the test
    // throws "select is not a function".
    const calls: { table: string; payload: unknown }[] = [];
    vi.doMock('./supabase', () => ({
      isSupabaseConfigured: true,
      supabase: {
        from(table: string) {
          return {
            insert(payload: unknown) {
              calls.push({ table, payload });
              return Promise.resolve({ error: null });
            },
          };
        },
      },
    }));

    const { submitRsvp } = await import('./rsvpSubmit');
    const result = await submitRsvp(draft, 'en');

    expect(result.error).toBeNull();
    expect(calls.map((c) => c.table)).toEqual(['rsvps', 'rsvp_events']);

    const parent = calls[0].payload as { id: string };
    expect(parent.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    const events = calls[1].payload as Array<{ rsvp_id: string }>;
    expect(events.every((e) => e.rsvp_id === parent.id)).toBe(true);
  });
});
