import { describe, expect, it } from 'vitest';
import { deadlineSchema, taskSchema } from './schemas';

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
});

