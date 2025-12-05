import React from 'react';
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import HomePage from '../page';

const mockApi = vi.hoisted(() => ({
  createCandidature: vi.fn(),
  fetchCandidatures: vi.fn(),
  fetchContests: vi.fn(),
  fetchDeadlines: vi.fn(),
  fetchMe: vi.fn(),
  fetchSchools: vi.fn(),
  login: vi.fn(),
  signup: vi.fn(),
  syncCandidatureDeadlines: vi.fn(),
  updateProfile: vi.fn(),
  updateTaskStatus: vi.fn(),
}));

vi.mock('../../lib/api', () => mockApi);

const baseUser = {
  id: 'u1',
  email: 'user@test.dev',
  firstName: 'Test',
  lastName: 'User',
  role: 'candidate',
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mockApi.fetchContests.mockResolvedValue([{ id: 'c1', name: 'AST France', year: 2025 }]);
  mockApi.fetchSchools.mockResolvedValue([]);
  mockApi.fetchDeadlines.mockResolvedValue([]);
  mockApi.fetchMe.mockResolvedValue(baseUser);
  mockApi.fetchCandidatures.mockResolvedValue([]);
  mockApi.login.mockResolvedValue({ accessToken: 'token', role: 'candidate', userId: 'u1' });
  mockApi.signup.mockResolvedValue({ accessToken: 'token', role: 'candidate', userId: 'u1' });
  mockApi.createCandidature.mockResolvedValue({});
  mockApi.syncCandidatureDeadlines.mockResolvedValue({ created: 0 });
  mockApi.updateProfile.mockResolvedValue(baseUser);
  mockApi.updateTaskStatus.mockResolvedValue({});
});

afterEach(() => {
  cleanup();
});

describe('HomePage', () => {
  it('affiche le hero et les filtres concours', async () => {
    render(<HomePage />);

    await waitFor(() => expect(mockApi.fetchContests).toHaveBeenCalled());

    expect(screen.getByText(/DossierTracker/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Concours/)).toBeInTheDocument();
    expect(screen.getByLabelText(/École/)).toBeInTheDocument();
  });

  it('affiche les échéances après sélection d’un concours', async () => {
    mockApi.fetchDeadlines.mockResolvedValue([
      { id: 'd1', title: 'Dossier complet', type: 'dossier', dueAt: new Date().toISOString(), contestId: 'c1' },
    ]);
    render(<HomePage />);

    const contestSelect = await screen.findByLabelText(/Concours/);
    fireEvent.change(contestSelect, { target: { value: 'c1' } });

    await waitFor(() => expect(mockApi.fetchDeadlines).toHaveBeenCalledWith('c1', ''));
    expect(await screen.findByText(/Dossier complet/)).toBeInTheDocument();
  });

  it('met à jour le statut d’une tâche', async () => {
    const firstCandidature = {
      id: 'cand1',
      contest: { name: 'AST France', year: 2025 },
      school: { name: 'HEC' },
      tasks: [{ id: 't1', title: 'Rédiger la lettre', status: 'todo' as const }],
    };
    mockApi.fetchCandidatures.mockResolvedValueOnce([firstCandidature]).mockResolvedValueOnce([
      {
        ...firstCandidature,
        tasks: [{ ...firstCandidature.tasks[0], status: 'doing' as const }],
      },
    ]);
    localStorage.setItem('dossiertracker_token', 'token');

    render(<HomePage />);

    expect(await screen.findByText(/Rédiger la lettre/)).toBeInTheDocument();
    const select = screen.getByDisplayValue('todo');
    fireEvent.change(select, { target: { value: 'doing' } });

    await waitFor(() => expect(mockApi.updateTaskStatus).toHaveBeenCalledWith('token', 't1', 'doing'));
    expect(await screen.findByDisplayValue('doing')).toBeInTheDocument();
  });
});

