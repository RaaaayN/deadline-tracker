import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DiplomaDetailPage from '../page';

const mockProgram = {
  id: 'p1',
  slug: 'escp-msc-business-analytics-ai',
  name: 'MSc in Business Analytics & AI',
  type: 'msc',
  domain: 'Business Analytics & AI',
  description: 'Programme data/IA',
  objectives: 'Former des experts data',
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
  financing: 'Bourses',
  admissionPrerequisites: ['Bachelor 180 ECTS'],
  admissionTests: ['GMAT'],
  admissionDocuments: ['CV'],
  admissionProcess: 'Dossier + entretien',
  contactEmail: 'msc@escp.eu',
  contactPhone: '+33',
  website: 'https://escp.eu',
  schoolId: 's1',
  contestId: 'c1',
  school: { id: 's1', name: 'ESCP', city: 'Paris', country: 'France' },
  contest: { id: 'c1', name: 'Masters Sélectifs', year: 2026 },
  courses: [{ id: 'c1', title: 'Data Analytics', category: 'Core', description: 'Stats' }],
  careers: [{ id: 'cr1', title: 'Data Analyst', description: 'Analyse' }],
  leaderboardEntries: [
    {
      id: 'le1',
      rank: 4,
      leaderboard: { id: 'lb1', slug: 'ft-eu', name: 'FT EU', source: 'Financial Times', year: 2025 },
    },
  ],
  deadlines: [
    {
      id: 'd1',
      title: 'Online application',
      type: 'registration',
      dueAt: '2026-01-07T23:59:00Z',
      sessionLabel: 'R1',
      contestId: 'c1',
      schoolId: 's1',
      programId: 'p1',
      createdByAdmin: true,
    },
  ],
};

describe('DiplomaDetailPage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(mockProgram), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a detailed program page', async () => {
    render(<DiplomaDetailPage params={{ slug: 'escp-msc-business-analytics-ai' }} />);
    await waitFor(() => expect(screen.getByText(/MSc in Business Analytics & AI/i)).toBeInTheDocument());
    expect(screen.getByText(/Programme data\/IA/i)).toBeInTheDocument();
    expect(screen.getByText(/Dossier \+ entretien/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Financial Times/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Online application/i)).toBeInTheDocument();
  });
});


