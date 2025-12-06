"use client";

import React, { useEffect, useState, type FormEvent } from 'react';

import { Protected } from '../../components/Protected';
import { Banner } from '../../components/ui/Banner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Loading } from '../../components/ui/Loading';
import { fetchGoogleStatus, updateProfile } from '../../lib/api';
import { useAuth } from '../providers/AuthProvider';

export default function SettingsPage() {
  const { token, user, refreshSession, fetchGoogleUrl } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [banner, setBanner] = useState<{ tone: 'info' | 'success' | 'error'; message: string } | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [googleStatus, setGoogleStatus] = useState<{ connected: boolean; scopes?: string[]; expiryDate?: string } | null>(
    null,
  );
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  useEffect(() => {
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
  }, [user]);

  useEffect(() => {
    const loadGoogle = async () => {
      if (!token) return;
      setIsLoadingGoogle(true);
      try {
        const status = await fetchGoogleStatus(token);
        setGoogleStatus(status);
      } catch (err) {
        setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Erreur Google' });
      } finally {
        setIsLoadingGoogle(false);
      }
    };
    void loadGoogle();
  }, [token]);

  const handleProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setIsSavingProfile(true);
    try {
      await updateProfile(token, { firstName, lastName });
      await refreshSession();
      setBanner({ tone: 'success', message: 'Profil mis à jour.' });
    } catch (err) {
      setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Sauvegarde impossible.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const url = await fetchGoogleUrl();
      window.location.href = url;
    } catch (err) {
      setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Connexion Google impossible.' });
    }
  };

  return (
    <Protected>
      <main className="app-shell">
        <section className="card hero stack">
          <div className="stack">
            <span className="badge">Paramètres</span>
            <h1 className="section-title">Profil et intégrations</h1>
            <p className="muted">Met à jour ton identité et connecte Google pour les rappels.</p>
          </div>
        </section>

        {banner ? <Banner message={banner.message} tone={banner.tone} ariaLive="assertive" /> : null}

        <Card title="Profil" description="Ces informations s’appliquent à tes dossiers et rappels.">
          <form className="grid-2" onSubmit={handleProfile}>
            <Input label="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <Input label="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            <div className="grid-full">
              <Button type="submit" loading={isSavingProfile} disabled={!firstName || !lastName}>
                Sauvegarder
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Google" description="Connecte Gmail/Calendar pour les rappels et brouillons automatiques.">
          {isLoadingGoogle ? (
            <Loading label="Vérification de la connexion Google..." />
          ) : (
            <div className="stack">
              <div className="stack-sm">
                <p className="muted">
                  Statut : {googleStatus?.connected ? 'Connecté' : 'Non connecté'}
                  {googleStatus?.expiryDate ? ` (expire le ${new Date(googleStatus.expiryDate).toLocaleDateString('fr-FR')})` : ''}
                </p>
                {googleStatus?.scopes ? <p className="subtle">Scopes : {googleStatus.scopes.join(', ')}</p> : null}
              </div>
              <div className="cta-group">
                <Button type="button" onClick={handleConnectGoogle} variant="secondary">
                  {googleStatus?.connected ? 'Reconnecter Google' : 'Connecter Google'}
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card title="Notifications" description="Préférences locales (placeholder en attendant l’API dédiée).">
          <p className="muted">
            Les rappels J-30/J-7/J-1 sont générés automatiquement côté API. Les préférences fines (SMS/push) seront
            ajoutées ici lorsque les providers seront configurés.
          </p>
        </Card>
      </main>
    </Protected>
  );
}
