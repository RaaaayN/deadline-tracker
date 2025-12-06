"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useState, type FormEvent } from 'react';

import { Banner } from '../../../components/ui/Banner';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../../providers/AuthProvider';

export default function SignupPage() {
  const params = useSearchParams();
  const redirectTo = params.get('redirect') ?? '/dashboard';
  const { signupWithEmail, isAuthLoading } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signupWithEmail({ firstName, lastName, email, password }, redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création impossible.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-shell narrow">
      <Card title="Créer un compte" description="On prépare ton espace et ta checklist personnalisée.">
        <form className="stack" onSubmit={handleSubmit} noValidate>
          {error ? <Banner message={error} tone="error" ariaLive="assertive" /> : null}
          <div className="grid-2">
            <Input label="Prénom" name="firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label="Nom" name="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
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
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint="Au moins 8 caractères"
          />
          <Button
            type="submit"
            loading={isSubmitting || isAuthLoading}
            disabled={!email || !password || !firstName || !lastName}
          >
            Créer mon compte
          </Button>
        </form>
        <p className="muted">
          Déjà inscrit ? <Link href="/auth/login">Se connecter</Link>
        </p>
      </Card>
    </main>
  );
}
