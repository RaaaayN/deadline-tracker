"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import { Program } from '@dossiertracker/shared';

import { Banner } from '../../../components/ui/Banner';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Loading } from '../../../components/ui/Loading';
import { fetchProgram } from '../../../lib/api';

type Props = {
  params: { slug: string };
};

function formatCurrency(cents?: number | null, currency = 'EUR') {
  if (!cents && cents !== 0) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(cents / 100);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDuration(months?: number | null) {
  if (!months) return '—';
  if (months < 12) return `${months} mois`;
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  return remaining > 0 ? `${years} an(s) ${remaining} mois` : `${years} an(s)`;
}

export default function DiplomaDetailPage({ params }: Props) {
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProgram(params.slug);
        setProgram(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Impossible de charger ce diplôme.');
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

  if (error || !program) {
    return (
      <main className="app-shell">
        <Banner tone="error" message={error ?? 'Diplôme introuvable.'} ariaLive="assertive" />
        <EmptyState title="Diplôme introuvable" description="Retour au catalogue des diplômes." />
        <Link href="/diplomas" className="btn btn-primary">
          Retour au catalogue
        </Link>
      </main>
    );
  }

  const topEntry = program.leaderboardEntries?.[0];
  const bestRanking = topEntry?.leaderboard;

  return (
    <main className="app-shell">
      <section className="card hero stack">
        <div className="stack">
          <span className="badge">{program.domain}</span>
          <div className="flex space-between items-start">
            <div className="stack-sm">
              <h1 className="section-title">{program.name}</h1>
              <p className="muted">
                {program.school?.name} · {program.campuses?.join(', ') || 'Campus à préciser'} · {program.languages?.join(', ') || 'Langue à préciser'}
              </p>
            </div>
            {bestRanking ? (
              <span className="badge success">
                {bestRanking.source} #{topEntry?.rank ?? '—'} ({bestRanking.year})
              </span>
            ) : null}
          </div>
          <p className="muted">{program.description}</p>
          <div className="cta-group">
            {program.website ? (
              <a href={program.website} target="_blank" rel="noreferrer" className="btn btn-primary">
                Site du programme
              </a>
            ) : null}
            <Link href="/diplomas" className="btn btn-ghost">
              Retour catalogue
            </Link>
          </div>
        </div>
      </section>

      <section className="grid-3">
        <Card title="Format" description="Durée, rythme et langue.">
          <ul className="bullet-list">
            <li>Format : {program.format.replace(/_/g, ' ')}</li>
            <li>Durée : {formatDuration(program.durationMonths)}</li>
            <li>ECTS : {program.ects ?? '—'}</li>
            <li>Langues : {program.languages?.join(', ') || '—'}</li>
            <li>Campus : {program.campuses?.join(', ') || '—'}</li>
          </ul>
        </Card>
        <Card title="Admissions" description="Prérequis, tests et documents.">
          <ul className="bullet-list">
            <li>Prérequis : {program.admissionPrerequisites?.join(', ') || '—'}</li>
            <li>Tests : {program.admissionTests?.join(', ') || '—'}</li>
            <li>Documents : {program.admissionDocuments?.join(', ') || '—'}</li>
            <li>Process : {program.admissionProcess ?? '—'}</li>
          </ul>
        </Card>
        <Card title="Frais & financement" description="Montants et aides.">
          <ul className="bullet-list">
            <li>Frais de scolarité : {formatCurrency(program.tuitionCents, program.currency)}</li>
            <li>Frais de dossier : {formatCurrency(program.applicationFeeCents, program.currency)}</li>
            <li>Financement : {program.financing ?? '—'}</li>
          </ul>
        </Card>
      </section>

      <section className="grid-2">
        <Card title="Objectifs" description="Ce que vous saurez faire.">
          <p className="muted">{program.objectives ?? 'Objectifs à venir.'}</p>
          {program.outcomes?.length ? (
            <ul className="bullet-list">
              {program.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          ) : null}
        </Card>
        <Card title="Débouchés" description="Rôles visés.">
          {program.careers?.length ? (
            <ul className="bullet-list">
              {program.careers.map((career) => (
                <li key={career.id}>
                  <strong>{career.title}</strong> — <span className="muted">{career.description ?? ''}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Débouchés en cours de collecte.</p>
          )}
        </Card>
      </section>

      <section className="grid-2">
        <Card title="Cours" description="Aperçu des modules principaux.">
          {program.courses?.length ? (
            <ul className="bullet-list">
              {program.courses.map((course) => (
                <li key={course.id}>
                  <strong>{course.title}</strong>
                  {course.category ? <span className="subtle"> ({course.category})</span> : null} —{' '}
                  <span className="muted">{course.description ?? 'Description à venir.'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Modules en cours de collecte.</p>
          )}
        </Card>
        <Card title="Classements" description="Sources, rangs et scores.">
          {program.leaderboardEntries?.length ? (
            <ul className="bullet-list">
              {program.leaderboardEntries.map((entry) => (
                <li key={entry.id}>
                  <span className="strong">
                    {entry.leaderboard?.source ?? 'Classement'} {entry.leaderboard?.category ? `· ${entry.leaderboard?.category}` : ''}
                  </span>
                  <span className="muted">
                    {' '}
                    — {entry.leaderboard?.year ?? ''} {entry.rank ? `· #${entry.rank}` : ''}{' '}
                    {entry.score ? `· Score ${entry.score}` : ''}
                  </span>
                  {entry.leaderboard?.url ? (
                    <a href={entry.leaderboard.url} target="_blank" rel="noreferrer" className="btn btn-link">
                      Voir
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Aucun classement renseigné pour l’instant.</p>
          )}
        </Card>
      </section>

      <section className="card">
        <h2 className="section-title">Deadlines</h2>
        {program.deadlines?.length ? (
          <div className="list">
            {program.deadlines.map((dl) => (
              <div key={dl.id} className="list-row">
                <div className="stack-sm">
                  <strong>{dl.title}</strong>
                  <p className="subtle">
                    {dl.sessionLabel} · {dl.type} · {formatDate(dl.dueAt)}
                  </p>
                </div>
                <span className="badge">{dl.type}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Aucune échéance" description="Les dates seront ajoutées prochainement." />
        )}
      </section>
    </main>
  );
}


