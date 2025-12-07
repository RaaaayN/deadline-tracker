import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DiplomasPage from '../page';

const mockPrograms = [
  {
    id: 'p1',
    slug: 'escp-msc-business-analytics-ai',
    name: 'MSc in Business Analytics & AI',
    type: 'msc',
    domain: 'Business Analytics & AI',
    description: 'Programme data/IA',
    objectives: '',
    outcomes: ['Data Analyst'],
    durationMonths: 15,
    ects: 90,
    format: 'full_time',
    campuses: ['Paris', 'Berlin'],
    languages: ['English'],
    startPeriods: ['September'],
    tuitionCents: 2730000,
    applicationFeeCents: 13000,
    currency: 'EUR',
    financing: '',
    admissionPrerequisites: [],
    admissionTests: [],
    admissionDocuments: [],
    schoolId: 's1',
    contestId: 'c1',
    school: { id: 's1', name: 'ESCP', city: 'Paris', country: 'France' },
    contest: { id: 'c1', name: 'Masters Sélectifs', year: 2026 },
    courses: [],
    careers: [],
    leaderboardEntries: [
      {
        id: 'le1',
        rank: 4,
        leaderboard: { id: 'lb1', slug: 'ft-eu', name: 'FT EU', source: 'Financial Times', year: 2025 },
      },
    ],
    deadlines: [],
  },
];

describe('DiplomasPage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(mockPrograms), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders list of programs with key info', async () => {
    render(<DiplomasPage />);
    await waitFor(() => expect(screen.getByText(/MSc in Business Analytics & AI/i)).toBeInTheDocument());
    expect(screen.getAllByText(/ESCP/i).length).toBeGreaterThan(0);
    // In new design, campus shows only first campus (may appear multiple times)
    expect(screen.getAllByText(/Paris/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Financial Times/i)).toBeInTheDocument();
  });
});


