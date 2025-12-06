import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import DeadlinesPage from '../page';

const apiMocks = vi.hoisted(() => ({
  fetchContests: vi.fn(),
  fetchSchools: vi.fn(),
  fetchDeadlines: vi.fn(),
  syncCandidatureDeadlines: vi.fn(),
  updateTaskStatus: vi.fn(),
}));

const mockRefresh = vi.fn();

vi.mock('../../../lib/api', () => apiMocks);

vi.mock('../../../components/Protected', () => ({
  Protected: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../providers/AuthProvider', () => ({
  useAuth: () => ({
    token: 'token123',
    refreshSession: mockRefresh,
    candidatures: [
      {
        id: 'cand1',
        contest: { id: 'c1', name: 'AST', year: 2025 },
        school: { id: 's1', name: 'HEC' },
        tasks: [
          {
            id: 't1',
            title: 'Dossier complet',
            status: 'todo',
            deadline: {
              id: 'd1',
              title: 'Dossier complet',
              type: 'registration',
              dueAt: new Date().toISOString(),
              contestId: 'c1',
              schoolId: 's1',
              createdByAdmin: true,
            },
          },
        ],
      },
    ],
  }),
}));

describe('DeadlinesPage', () => {
  it('affiche les tâches filtrées et met à jour le statut', async () => {
    apiMocks.fetchContests.mockResolvedValue([{ id: 'c1', name: 'AST', year: 2025 }]);
    apiMocks.fetchSchools.mockResolvedValue([{ id: 's1', name: 'HEC', contestId: 'c1' }]);
    apiMocks.fetchDeadlines.mockResolvedValue([]);

    render(<DeadlinesPage />);

    expect(await screen.findByText(/Toutes les dates/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Dossier complet/).length).toBeGreaterThan(0);

    const selects = screen.getAllByLabelText(/Statut Dossier complet/i);
    fireEvent.change(selects[0], { target: { value: 'doing' } });

    await waitFor(() => {
      expect(apiMocks.updateTaskStatus).toHaveBeenCalledWith('token123', 't1', 'doing');
    });
  });
});
