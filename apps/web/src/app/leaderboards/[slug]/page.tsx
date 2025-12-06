"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import { Leaderboard, LeaderboardEntry } from '@dossiertracker/shared';

import { Banner } from '../../../components/ui/Banner';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Loading } from '../../../components/ui/Loading';
import { fetchLeaderboard } from '../../../lib/api';

type Props = {
  params: { slug: string };
};

export default function LeaderboardDetailPage({ params }: Props) {
  const [leaderboard, setLeaderboard] = useState<(Leaderboard & { entries: LeaderboardEntry[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchLeaderboard(params.slug);
        setLeaderboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Impossible de charger le classement.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [params.slug]);

  if (loading) {
    return (
      <main className="app-shell">
        <Card title="Chargement" description="">
          <Loading />
        </Card>
      </main>
    );
  }

  if (error || !leaderboard) {
    return (
      <main className="app-shell">
        <Banner tone="error" message={error ?? 'Classement introuvable'} />
        <EmptyState title="Classement introuvable" description="Retour aux classements." />
        <Link href="/leaderboards" className="btn btn-primary">
          Retour aux classements
        </Link>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="card hero stack">
        <div className="stack">
          <span className="badge">{leaderboard.source}</span>
          <div className="flex space-between items-start">
            <div className="stack-sm">
              <h1 className="section-title">{leaderboard.name}</h1>
              <p className="muted">
                {leaderboard.category ? `${leaderboard.category} · ` : ''}
                {leaderboard.region ? `${leaderboard.region} · ` : ''}
                {leaderboard.year}
              </p>
            </div>
            <Link href="/leaderboards" className="btn btn-ghost">
              Retour
            </Link>
          </div>
          <p className="muted">{leaderboard.description ?? ''}</p>
          {leaderboard.url ? (
            <a href={leaderboard.url} target="_blank" rel="noreferrer" className="btn btn-primary">
              Voir la méthodologie
            </a>
          ) : null}
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Entrées</h2>
        {leaderboard.entries.length === 0 ? (
          <EmptyState title="Aucune entrée" description="Ce classement n’a pas encore d’entrées." />
        ) : (
          <div className="list">
            {leaderboard.entries.map((entry) => (
              <div key={entry.id} className="list-row">
                <div className="stack-sm">
                  <strong>#{entry.rank}</strong>
                  {entry.school ? <p className="muted">{entry.school.name}</p> : null}
                  {entry.program ? <p className="muted">{entry.program.name}</p> : null}
                  {entry.notes ? <p className="subtle">{entry.notes}</p> : null}
                </div>
                <div className="stack-sm items-end">
                  {entry.score ? <span className="badge">{entry.score}</span> : null}
                  {entry.program?.slug ? (
                    <Link href={`/diplomas/${entry.program.slug}`} className="btn btn-link">
                      Voir programme
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}


