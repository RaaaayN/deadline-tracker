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

vi.mock('../../components/ui/Button', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Button: ({ children, iconRight: _ir, iconLeft: _il, ...props }: { children: React.ReactNode; iconRight?: React.ReactNode; iconLeft?: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
}));

describe('HomePage', () => {
  it('affiche le hero et les CTA', () => {
    render(<HomePage />);

    expect(screen.getByText(/Pilote tes dossiers/i)).toBeInTheDocument();
    // Links now wrap Buttons, check for button text
    expect(screen.getByText(/Créer un compte gratuit/i)).toBeInTheDocument();
    expect(screen.getByText(/Se connecter/i)).toBeInTheDocument();
  });
});
