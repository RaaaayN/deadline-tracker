"use client";

import Link from 'next/link';
import React from 'react';

import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';

import { useAuth } from './providers/AuthProvider';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main className="app-shell">
      <section className="card hero stack">
        <div className="stack">
          <span className="badge">Vue complète des échéances</span>
          <div className="stack-sm">
            <h1 className="section-title">Pilote tes dossiers sans rater une date</h1>
            <p className="muted">
              Centralise toutes tes échéances, coche les tâches, connecte Google et reçois des rappels J-30/J-7/J-1.
            </p>
          </div>
          <div className="cta-group">
            <Link href={user ? '/dashboard' : '/auth/signup'} className="btn btn-primary">
              {user ? 'Ouvrir le tableau de bord' : 'Créer un compte'}
            </Link>
            <Link href={user ? '/deadlines' : '/auth/login'} className="btn btn-ghost">
              {user ? 'Voir mes échéances' : 'Se connecter'}
            </Link>
          </div>
          <p className="subtle">Concours AST, écoles, documents et rappels au même endroit.</p>
        </div>
      </section>

      <section className="grid-3">
        <StatCard label="Échéances suivies" value="Toutes vos AST" trend="Concours + écoles" />
        <StatCard label="Rappels automatiques" value="J-30 · J-7 · J-1" trend="Email / Calendar" />
        <StatCard label="Suivi des tâches" value="Todo → Doing → Done" trend="Checklist importée" />
      </section>

      <section className="grid-3">
        <Card
          title="Compte et sécurité"
          description="Création en quelques secondes, profil et rôles alignés avec l’API."
        >
          <ul className="bullet-list">
            <li>Inscription / connexion par email</li>
            <li>Token stocké côté client et rafraîchissement du profil</li>
            <li>Redirections protégées vers dashboard</li>
          </ul>
        </Card>
        <Card
          title="Échéances détaillées"
          description="Filtres par concours, école, statut et date pour prioriser."
        >
          <ul className="bullet-list">
            <li>Vue liste avec tri et recherche rapide</li>
            <li>Mises à jour de statut en un clic</li>
            <li>Synchronisation des deadlines officielles</li>
          </ul>
        </Card>
        <Card title="Paramètres & intégrations" description="Connecte Google et ajuste tes préférences.">
          <ul className="bullet-list">
            <li>Connexion Gmail/Calendar</li>
            <li>Profil et préférences de rappel</li>
            <li>Import/export bientôt disponible</li>
          </ul>
        </Card>
      </section>
    </main>
  );
}
