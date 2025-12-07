import { describe, expect, it } from 'vitest';

import { candidatureSchema, contestSchema, deadlineSchema, taskSchema } from './schemas';

describe('schemas', () => {
  it('validates deadline', () => {
    const parsed = deadlineSchema.parse({
      id: 'd1',
      title: 'Inscription',
      type: 'registration',
      dueAt: new Date().toISOString(),
      contestId: 'c1',
      createdByAdmin: true,
    });
    expect(parsed.id).toBe('d1');
  });

  it('rejects invalid task status', () => {
    const invalid = () =>
      taskSchema.parse({
        id: 't1',
        title: 'Faire la lettre',
        status: 'unknown',
        candidatureId: 'cand',
      });
    expect(invalid).toThrowError();
  });

  it('validates candidature type', () => {
    const parsed = candidatureSchema.parse({
      id: 'cand1',
      userId: 'user1',
      contestId: 'c1',
      type: 'concours',
      status: 'draft',
    });
    expect(parsed.type).toBe('concours');
  });

  it('validates enriched contest with test requirements', () => {
    const parsed = contestSchema.parse({
      id: 'c1',
      name: 'GMAT 2026',
      year: 2026,
      examFormat: 'Computer adaptive',
      currency: 'EUR',
      languages: ['English'],
      examLocations: ['Online'],
      testRequirements: [
        {
          id: 'ctr1',
          test: 'gmat',
          minimumScore: 600,
          recommendedScore: 680,
          sections: ['Quant', 'Verbal'],
        },
      ],
    });
    expect(parsed.name).toBe('GMAT 2026');
    expect(parsed.testRequirements?.[0]?.test).toBe('gmat');
  });
});

