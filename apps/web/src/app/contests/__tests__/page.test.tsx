import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ContestsPage from '../page';

const mockContests = [
  {
    id: 'c1',
    name: 'GMAT 2026',
    year: 2026,
    examFormat: 'Computer adaptive',
    description: 'Test standardisé GMAT',
    feesCents: 22000,
    currency: 'EUR',
    registrationUrl: 'https://gmat.test/register',
    languages: ['English'],
    examLocations: ['Online'],
    durationMinutes: 120,
    scoreScale: '800 points',
    testRequirements: [
      {
        id: 'tr1',
        test: 'gmat',
        minimumScore: 600,
        recommendedScore: 680,
        sections: ['Quant', 'Verbal'],
      },
    ],
    deadlines: [
      {
        id: 'd1',
        title: 'Session Mars',
        type: 'registration',
        dueAt: '2026-02-20T23:59:00Z',
        sessionLabel: 'Mars 2026',
        contestId: 'c1',
        createdByAdmin: true,
      },
    ],
  },
];

describe('ContestsPage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(mockContests), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders contests with test requirements and deadlines', async () => {
    render(<ContestsPage />);
    await waitFor(() => expect(screen.getByText(/GMAT 2026/i)).toBeInTheDocument());
    expect(screen.getByText(/Computer adaptive/i)).toBeInTheDocument();
    expect(screen.getByText(/GMAT/i)).toBeInTheDocument();
    expect(screen.getByText(/English/i)).toBeInTheDocument();
    expect(screen.getByText(/Session Mars/i)).toBeInTheDocument();
  });
});


