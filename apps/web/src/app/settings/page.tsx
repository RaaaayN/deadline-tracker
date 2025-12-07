"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Link as LinkIcon, CheckCircle, Trash2 } from 'lucide-react';
import React, { useEffect, useState, type FormEvent } from 'react';

import { Protected } from '../../components/Protected';
import { Banner } from '../../components/ui/Banner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Loading } from '../../components/ui/Loading';
import { PageHeader } from '../../components/ui/PageHeader';
import { fetchGoogleStatus, purgeGoogleCalendar, updateProfile } from '../../lib/api';
import { useAuth } from '../providers/AuthProvider';

/**
 * Settings page for profile management and integrations.
 */
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
  const [isPurgingCalendar, setIsPurgingCalendar] = useState(false);

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
      setBanner({ tone: 'success', message: 'Profil mis à jour avec succès !' });
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

  const handlePurgeCalendar = async () => {
    if (!token) return;
    setIsPurgingCalendar(true);
    try {
      const res = await purgeGoogleCalendar(token);
      setBanner({
        tone: 'success',
        message: `${res.deleted} évènements DossierTracker supprimés de Google Calendar.`,
      });
    } catch (err) {
      setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Purge impossible.' });
    } finally {
      setIsPurgingCalendar(false);
    }
  };

  return (
    <Protected>
      <div className="app-content">
        <PageHeader
          badge="Paramètres"
          title="Profil et intégrations"
          description="Gère ton identité et connecte tes services externes."
        />

        <AnimatePresence>
          {banner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ marginBottom: 'var(--space-6)' }}
            >
              <Banner message={banner.message} tone={banner.tone} dismissible ariaLive="assertive" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="stack-lg">
          {/* Profile Section */}
          <Card
            title="Profil"
            description="Ces informations s'appliquent à tes dossiers et rappels."
            icon={<User size={20} />}
          >
            <form onSubmit={handleProfile}>
              <div className="grid grid-2" style={{ marginBottom: 'var(--space-4)' }}>
                <Input
                  label="Prénom"
                  name="firstName"
                  icon={<User size={18} />}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  label="Nom"
                  name="lastName"
                  icon={<User size={18} />}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <Input
                label="Email"
                name="email"
                type="email"
                value={user?.email ?? ''}
                disabled
                hint="L'email ne peut pas être modifié"
                style={{ marginBottom: 'var(--space-4)' }}
              />
              <Button type="submit" loading={isSavingProfile} disabled={!firstName || !lastName}>
                Sauvegarder
              </Button>
            </form>
          </Card>

          {/* Google Integration */}
          <Card
            title="Google"
            description="Connecte Gmail/Calendar pour les rappels et brouillons automatiques."
            icon={<LinkIcon size={20} />}
          >
            {isLoadingGoogle ? (
              <Loading label="Vérification de la connexion Google..." />
            ) : (
              <div className="stack-md">
                <div
                  className="list-item"
                  style={{
                    background: googleStatus?.connected ? 'var(--success-soft)' : 'var(--surface-muted)',
                    borderColor: googleStatus?.connected ? 'var(--success-light)' : 'var(--border)',
                  }}
                >
                  <div className="list-item-content">
                    <div className="list-item-title flex items-center gap-2">
                      {googleStatus?.connected && <CheckCircle size={16} className="text-success" />}
                      {googleStatus?.connected ? 'Compte Google connecté' : 'Non connecté'}
                    </div>
                    <div className="list-item-subtitle">
                      {googleStatus?.expiryDate
                        ? `Expire le ${new Date(googleStatus.expiryDate).toLocaleDateString('fr-FR')}`
                        : 'Connecte ton compte Google pour synchroniser les rappels'}
                    </div>
                  </div>
                </div>

                {googleStatus?.scopes && (
                  <div className="stack-sm">
                    <span className="text-sm font-semibold">Permissions accordées :</span>
                    <div className="flex flex-wrap gap-2">
                      {googleStatus.scopes.map((scope) => (
                        <span key={scope} className="badge">
                          {scope.split('/').pop()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handleConnectGoogle}
                  variant={googleStatus?.connected ? 'secondary' : 'primary'}
                >
                  {googleStatus?.connected ? 'Reconnecter Google' : 'Connecter Google'}
                </Button>

                {googleStatus?.connected && (
                  <div className="stack-sm">
                    <p className="text-sm text-muted">
                      Supprimer tous les événements DossierTracker déjà créés dans ton Google Calendar.
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      tone="danger"
                      iconLeft={<Trash2 size={16} />}
                      onClick={handlePurgeCalendar}
                      loading={isPurgingCalendar}
                    >
                      Purger les événements DossierTracker
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Notifications Section */}
          <Card
            title="Notifications"
            description="Préférences de rappels et alertes."
            icon={<Bell size={20} />}
          >
            <div className="list">
              <div className="list-item">
                <div className="list-item-content">
                  <div className="list-item-title">Rappels J-30</div>
                  <div className="list-item-subtitle">Reçois un email 30 jours avant chaque deadline</div>
                </div>
                <div className="badge success">Actif</div>
              </div>
              <div className="list-item">
                <div className="list-item-content">
                  <div className="list-item-title">Rappels J-7</div>
                  <div className="list-item-subtitle">Reçois un email 7 jours avant chaque deadline</div>
                </div>
                <div className="badge success">Actif</div>
              </div>
              <div className="list-item">
                <div className="list-item-content">
                  <div className="list-item-title">Rappels J-1</div>
                  <div className="list-item-subtitle">Reçois un email la veille de chaque deadline</div>
                </div>
                <div className="badge success">Actif</div>
              </div>
            </div>
            <p className="text-muted text-sm" style={{ marginTop: 'var(--space-4)' }}>
              Les préférences de notifications avancées (SMS/push) seront disponibles prochainement.
            </p>
          </Card>
        </div>
      </div>
    </Protected>
  );
}
