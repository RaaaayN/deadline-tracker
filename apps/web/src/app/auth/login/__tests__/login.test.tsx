import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import LoginPage from '../page';

const mockLogin = vi.fn();

vi.mock('../../../providers/AuthProvider', () => ({
  useAuth: () => ({
    loginWithEmail: mockLogin,
    isAuthLoading: false,
  }),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('redirect=/deadlines'),
}));

describe('LoginPage', () => {
  it('soumet le formulaire et appelle loginWithEmail avec redirect', async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'user@test.dev' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@test.dev', 'password123', '/deadlines');
    });
  });
});
