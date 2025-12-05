"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { exchangeGoogleCode } from '../../../lib/api';

export default function GoogleCallbackPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('Connexion à Google en cours...');

  useEffect(() => {
    const code = params.get('code');
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('dossiertracker_token') : null;
    if (!code || !token) {
      setMessage('Code Google ou session manquants. Reprends la connexion depuis le tableau de bord.');
      return;
    }

    (async () => {
      try {
        await exchangeGoogleCode(token, code);
        setMessage('Compte Google connecté. Redirection...');
        setTimeout(() => router.push('/'), 1200);
      } catch (err) {
        setMessage(err instanceof Error ? err.message : 'Erreur lors de la connexion Google.');
      }
    })();
  }, [params, router]);

  return (
    <main className="app-shell">
      <section className="card stack">
        <h1 className="section-title">Connexion Google</h1>
        <p>{message}</p>
      </section>
    </main>
  );
}

