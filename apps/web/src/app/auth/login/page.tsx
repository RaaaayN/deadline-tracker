"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useState, type FormEvent } from 'react';

import { Banner } from '../../../components/ui/Banner';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../../providers/AuthProvider';

export default function LoginPage() {
  const params = useSearchParams();
  const redirectTo = params.get('redirect') ?? '/dashboard';
  const { loginWithEmail, isAuthLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithEmail(email, password, redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-shell narrow">
      <Card title="Connexion" description="Reprends tes deadlines là où tu t’es arrêté.">
        <form className="stack" onSubmit={handleSubmit} noValidate>
          {error ? <Banner message={error} tone="error" ariaLive="assertive" /> : null}
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Mot de passe"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" loading={isSubmitting || isAuthLoading} disabled={!email || !password}>
            Se connecter
          </Button>
        </form>
        <p className="muted">
          Pas encore de compte ? <Link href="/auth/signup">Créer un compte</Link>
        </p>
      </Card>
    </main>
  );
}
