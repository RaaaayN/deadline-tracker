"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import { Leaderboard } from '@dossiertracker/shared';

import { Banner } from '../../components/ui/Banner';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loading } from '../../components/ui/Loading';
import { fetchLeaderboards } from '../../lib/api';

export default function LeaderboardsPage() {
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchLeaderboards();
        setLeaderboards(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Impossible de charger les classements.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <main className="app-shell">
      <section className="card hero stack">
        <div className="stack">
          <span className="badge">Classements</span>
          <div className="stack-sm">
            <h1 className="section-title">Tous les classements écoles/programmes</h1>
            <p className="muted">
              Sources (FT, QS...), année, catégorie/région, liens vers le détail et le top écoles/programmes.
            </p>
          </div>
        </div>
      </section>

      {error ? <Banner tone="error" message={error} ariaLive="assertive" /> : null}

      {loading ? (
        <div className="card">
          <Loading />
        </div>
      ) : leaderboards.length === 0 ? (
        <EmptyState title="Aucun classement" description="Les classements seront ajoutés prochainement." />
      ) : (
        <div className="stack">
          {leaderboards.map((lb) => (
            <div key={lb.id} className="card stack">
              <div className="flex space-between items-start">
                <div className="stack-sm">
                  <span className="badge">{lb.source}</span>
                  <h3 className="section-title">{lb.name}</h3>
                  <p className="muted">
                    {lb.category ? `${lb.category} · ` : ''}
                    {lb.region ? `${lb.region} · ` : ''}
                    {lb.year}
                  </p>
                </div>
                <Link href={`/leaderboards/${lb.slug}`} className="btn btn-primary">
                  Voir le détail
                </Link>
              </div>
              <p className="muted">{lb.description ?? 'Découvrez le top des écoles/programmes.'}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}


