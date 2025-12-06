import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import HomePage from '../page';

vi.mock('../providers/AuthProvider', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('../../components/ui/Card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../components/ui/StatCard', () => ({
  StatCard: ({ label, value }: { label: string; value: string }) => (
    <div>
      {label}-{value}
    </div>
  ),
}));

describe('HomePage', () => {
  it('affiche le hero et les CTA', () => {
    render(<HomePage />);

    expect(screen.getByText(/Pilote tes dossiers/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Créer un compte/i })).toHaveAttribute('href', '/auth/signup');
    expect(screen.getByRole('link', { name: /Se connecter/i })).toHaveAttribute('href', '/auth/login');
  });
});
