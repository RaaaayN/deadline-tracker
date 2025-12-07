import { CandidatureType } from '@dossiertracker/shared';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import CandidaturesPage from '../page';

const apiMocks = vi.hoisted(() => ({
  fetchContests: vi.fn(),
  fetchSchools: vi.fn(),
  fetchDeadlines: vi.fn(),
  createCandidature: vi.fn(),
  syncCandidatureDeadlines: vi.fn(),
  updateCandidature: vi.fn(),
  deleteCandidature: vi.fn(),
  updateTaskStatus: vi.fn(),
}));

const refreshSession = vi.fn();

vi.mock('../../../lib/api', () => apiMocks);

vi.mock('../../../components/Protected', () => ({
  Protected: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../providers/AuthProvider', () => ({
  useAuth: () => ({
    token: 'token123',
    refreshSession,
    candidatures: [
      {
        id: 'cand1',
        type: CandidatureType.Concours,
        contest: { id: 'c1', name: 'GRE General 2026', year: 2026 },
        diplomaName: 'MSc Finance',
        tasks: [],
      },
    ],
  }),
}));

describe('CandidaturesPage', () => {
  it('crée une candidature en imposant un diplôme et un type', async () => {
    apiMocks.fetchContests.mockResolvedValue([{ id: 'c1', name: 'GRE General 2026', year: 2026 }]);
    apiMocks.fetchSchools.mockResolvedValue([]);
    apiMocks.fetchDeadlines.mockResolvedValue([
      {
        id: 'd1',
        title: 'Session Mars',
        type: 'registration',
        dueAt: new Date().toISOString(),
        contestId: 'c1',
        schoolId: null,
        createdByAdmin: true,
        sessionLabel: 'Session Février 2026',
      },
    ]);
    apiMocks.createCandidature.mockResolvedValue({});
    render(<CandidaturesPage />);

    await screen.findByText(/GRE General 2026/);
    const contestSelect = screen.getByLabelText(/Concours/i, { selector: 'select[name="creation-contest"]' });
    fireEvent.change(contestSelect, { target: { value: 'c1' } });
    expect(contestSelect).toHaveValue('c1');

    await screen.findByText('Session Février 2026');
    const sessionSelect = await screen.findByLabelText(/^Session$/i);
    fireEvent.change(sessionSelect, { target: { value: 'Session Février 2026' } });
    expect(sessionSelect).toHaveValue('Session Février 2026');

    const createBtn = screen.getByText(/Créer la candidature/i);
    await waitFor(() => expect(createBtn).not.toBeDisabled());
    fireEvent.click(createBtn);
  });

  it('synchronise une candidature existante', async () => {
    apiMocks.fetchContests.mockResolvedValue([{ id: 'c1', name: 'GMAT 2026', year: 2026 }]);
    apiMocks.syncCandidatureDeadlines.mockResolvedValue({ created: 0 });
    render(<CandidaturesPage />);

    // In the new design, buttons are labeled "Sync" - find by text content
    const syncBtn = await screen.findByText('Sync');
    fireEvent.click(syncBtn);

    await waitFor(() => {
      expect(apiMocks.syncCandidatureDeadlines).toHaveBeenCalledWith('token123', 'cand1');
    });
  });
});


