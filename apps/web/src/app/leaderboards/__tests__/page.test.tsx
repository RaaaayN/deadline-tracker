import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import LeaderboardsPage from '../page';

const mockLeaderboards = [
  {
    id: 'lb1',
    slug: 'ft-eu',
    name: 'FT European Business Schools',
    source: 'Financial Times',
    category: 'European Business Schools',
    region: 'Europe',
    year: 2025,
    url: 'https://rankings.ft.com',
    description: 'Top EU schools',
    entries: [],
  },
];

describe('LeaderboardsPage', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(mockLeaderboards), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders leaderboards list', async () => {
    render(<LeaderboardsPage />);
    await waitFor(() => expect(screen.getByText(/FT European Business Schools/i)).toBeInTheDocument());
    expect(screen.getByText(/2025/)).toBeInTheDocument();
    expect(screen.getByText(/Voir le classement/i)).toBeInTheDocument();
  });
});


