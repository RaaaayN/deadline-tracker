"use client";

import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useState, type FormEvent } from 'react';

import { Banner } from '../../../components/ui/Banner';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Loading } from '../../../components/ui/Loading';
import { useAuth } from '../../providers/AuthProvider';

/**
 * Signup form inner component.
 */
function SignupForm() {
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
    <div className="app-main full-width">
      <div
        className="app-content"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: 'var(--space-6)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', maxWidth: '480px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 'var(--text-xl)',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  D
                </div>
              </motion.div>
            </Link>
            <h1 style={{ marginBottom: 'var(--space-2)' }}>Créer ton compte</h1>
            <p className="text-secondary">On prépare ton espace et ta checklist personnalisée.</p>
          </div>

          <Card>
            <form className="stack-lg" onSubmit={handleSubmit} noValidate>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Banner message={error} tone="error" ariaLive="assertive" />
                </motion.div>
              )}

              <div className="stack-md">
                <div className="grid grid-2">
                  <Input
                    label="Prénom"
                    name="firstName"
                    required
                    placeholder="Jean"
                    icon={<User size={18} />}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <Input
                    label="Nom"
                    name="lastName"
                    required
                    placeholder="Dupont"
                    icon={<User size={18} />}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="ton@email.com"
                  icon={<Mail size={18} />}
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
                  placeholder="••••••••"
                  icon={<Lock size={18} />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  hint="Au moins 8 caractères"
                />
              </div>

              <Button
                type="submit"
                loading={isSubmitting || isAuthLoading}
                disabled={!email || !password || !firstName || !lastName}
                iconRight={<ArrowRight size={18} />}
              >
                Créer mon compte
              </Button>
            </form>

            <div
              style={{
                marginTop: 'var(--space-6)',
                paddingTop: 'var(--space-6)',
                borderTop: '1px solid var(--border-light)',
                textAlign: 'center',
              }}
            >
              <p className="text-secondary text-sm">
                Déjà inscrit ?{' '}
                <Link href="/auth/login" className="font-semibold">
                  Se connecter
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Signup page with animated form and validation.
 */
export default function SignupPage() {
  return (
    <Suspense fallback={<div className="app-content"><Loading label="Chargement..." /></div>}>
      <SignupForm />
    </Suspense>
  );
}
