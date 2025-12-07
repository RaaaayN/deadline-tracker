"use client";

import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { Card } from '../../../components/ui/Card';
import { Loading } from '../../../components/ui/Loading';
import { exchangeGoogleCode } from '../../../lib/api';

type Status = 'loading' | 'success' | 'error';

/**
 * Google callback inner component.
 */
function GoogleCallback() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Connexion à Google en cours...');

  useEffect(() => {
    const code = params.get('code');
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('dossiertracker_token') : null;
    
    if (!code || !token) {
      setStatus('error');
      setMessage('Code Google ou session manquants. Reprends la connexion depuis le tableau de bord.');
      return;
    }

    (async () => {
      try {
        await exchangeGoogleCode(token, code);
        setStatus('success');
        setMessage('Compte Google connecté avec succès !');
        setTimeout(() => router.push('/settings'), 1500);
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Erreur lors de la connexion Google.');
      }
    })();
  }, [params, router]);

  return (
    <div className="app-main full-width">
      <div
        className="app-content"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <Card>
            <div className="stack-md" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {status === 'loading' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: 64,
                      height: 64,
                      margin: '0 auto',
                      color: 'var(--primary)',
                    }}
                  >
                    <Loader2 size={64} />
                  </motion.div>
                )}
                {status === 'success' && (
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      margin: '0 auto',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--success-soft)',
                      color: 'var(--success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle size={32} />
                  </div>
                )}
                {status === 'error' && (
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      margin: '0 auto',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--danger-soft)',
                      color: 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AlertCircle size={32} />
                  </div>
                )}
              </motion.div>

              <h2 style={{ marginTop: 'var(--space-4)' }}>Connexion Google</h2>
              <p className="text-secondary">{message}</p>

              {status === 'success' && (
                <p className="text-muted text-sm">Redirection vers les paramètres...</p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Google OAuth callback page.
 * Handles the code exchange and redirects to dashboard.
 */
export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div className="app-content"><Loading label="Chargement..." /></div>}>
      <GoogleCallback />
    </Suspense>
  );
}
