import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import LeaderboardDetailPage from '../page';

const mockLeaderboard = {
  id: 'lb1',
  slug: 'ft-eu',
  name: 'FT European Business Schools',
  source: 'Financial Times',
  category: 'European Business Schools',
  region: 'Europe',
  year: 2025,
  url: 'https://rankings.ft.com',
  description: 'Top EU schools',
  entries: [
    { id: 'e1', rank: 1, schoolId: 's1', leaderboardId: 'lb1', school: { id: 's1', name: 'HEC Paris', contestId: 'c1' } },
  ],
};

describe('LeaderboardDetailPage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(mockLeaderboard), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders leaderboard detail', async () => {
    render(<LeaderboardDetailPage params={{ slug: 'ft-eu' }} />);
    await waitFor(() => expect(screen.getByText(/FT European Business Schools/i)).toBeInTheDocument());
    expect(screen.getByText(/2025/)).toBeInTheDocument();
    expect(screen.getByText(/HEC Paris/)).toBeInTheDocument();
    // Rank is now rendered as text inside a div
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});


