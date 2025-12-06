"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { Program, ProgramFormat, ProgramType } from '@dossiertracker/shared';

import { Banner } from '../../components/ui/Banner';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loading } from '../../components/ui/Loading';
import { Select } from '../../components/ui/Select';
import { fetchPrograms } from '../../lib/api';

type Filters = {
  domain: string;
  campus: string;
  type: string;
  format: string;
};

const PROGRAM_TYPES: { value: string; label: string }[] = [
  { value: '', label: 'Tous les types' },
  { value: ProgramType.Msc, label: 'MSc' },
  { value: ProgramType.Mba, label: 'MBA' },
  { value: ProgramType.Master, label: 'Master' },
  { value: ProgramType.SpecializedMsc, label: 'Spécialised MSc' },
  { value: ProgramType.ExecutiveMaster, label: 'Exec Master' },
  { value: ProgramType.Certificate, label: 'Certificat' },
  { value: ProgramType.Bachelor, label: 'Bachelor' },
  { value: ProgramType.Other, label: 'Autre' },
];

const FORMATS: { value: string; label: string }[] = [
  { value: '', label: 'Tous les formats' },
  { value: ProgramFormat.FullTime, label: 'Full time' },
  { value: ProgramFormat.PartTime, label: 'Part time' },
  { value: ProgramFormat.Online, label: 'Online' },
  { value: ProgramFormat.Hybrid, label: 'Hybride' },
];

function formatCurrency(cents?: number | null, currency = 'EUR') {
  if (!cents && cents !== 0) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(cents / 100);
}

function formatDuration(months?: number | null) {
  if (!months) return '—';
  if (months < 12) return `${months} mois`;
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  return remaining > 0 ? `${years} an(s) ${remaining} mois` : `${years} an(s)`;
}

export default function DiplomasPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filters, setFilters] = useState<Filters>({ domain: '', campus: '', type: '', format: '' });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const uniqueDomains = useMemo(() => Array.from(new Set(programs.map((p) => p.domain))).sort(), [programs]);
  const uniqueCampuses = useMemo(
    () => Array.from(new Set(programs.flatMap((p) => p.campuses ?? []))).sort(),
    [programs],
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPrograms({
          domain: filters.domain || undefined,
          campus: filters.campus || undefined,
          type: (filters.type as ProgramType) || undefined,
          format: (filters.format as ProgramFormat) || undefined,
        });
        setPrograms(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Impossible de charger les programmes.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [filters.campus, filters.domain, filters.format, filters.type]);

  return (
    <main className="app-shell">
      <section className="card hero stack">
        <div className="stack">
          <span className="badge">Catalogue diplômes</span>
          <div className="stack-sm">
            <h1 className="section-title">Trouvez le bon diplôme et ses échéances</h1>
            <p className="muted">
              Domaines, formats, campus, langues, frais, rankings et débouchés. Inspirez-vous du MSc Business Analytics & AI de l’ESCP.
            </p>
          </div>
        </div>
      </section>

      {error ? <Banner tone="error" message={error} ariaLive="assertive" /> : null}

      <Card title="Filtres" description="Affinez par domaine, campus, type ou format.">
        <div className="grid-4">
          <Select
            label="Domaine"
            name="domain"
            value={filters.domain}
            onChange={(e) => setFilters((f) => ({ ...f, domain: e.target.value }))}
            options={[{ value: '', label: 'Tous les domaines' }, ...uniqueDomains.map((d) => ({ value: d, label: d }))]}
          />
          <Select
            label="Campus"
            name="campus"
            value={filters.campus}
            onChange={(e) => setFilters((f) => ({ ...f, campus: e.target.value }))}
            options={[{ value: '', label: 'Tous les campus' }, ...uniqueCampuses.map((c) => ({ value: c, label: c }))]}
          />
          <Select
            label="Type"
            name="type"
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            options={PROGRAM_TYPES}
          />
          <Select
            label="Format"
            name="format"
            value={filters.format}
            onChange={(e) => setFilters((f) => ({ ...f, format: e.target.value }))}
            options={FORMATS}
          />
        </div>
      </Card>

      {loading ? (
        <div className="card">
          <Loading />
        </div>
      ) : programs.length === 0 ? (
        <EmptyState
          title="Aucun programme trouvé"
          description="Ajustez vos filtres ou réinitialisez-les pour voir tous les diplômes."
        />
      ) : (
        <div className="grid-3">
          {programs.map((program) => {
            const topEntry = program.leaderboardEntries?.[0];
            const bestRanking = topEntry?.leaderboard;
            return (
              <div key={program.id} className="card stack">
                <div className="flex space-between items-start">
                  <div className="stack-sm">
                    <span className="badge">{program.domain}</span>
                    <h3 className="section-title">{program.name}</h3>
                    <p className="muted">{program.school?.name}</p>
                  </div>
                  {bestRanking ? (
                    <span className="badge success">
                      {bestRanking.source} #{topEntry?.rank ?? '—'} ({bestRanking.year})
                    </span>
                  ) : null}
                </div>
                <p className="muted">{program.description}</p>
                <div className="grid-2">
                  <div className="stack-sm">
                    <span className="subtle">Format</span>
                    <strong>{program.format.replace(/_/g, ' ')}</strong>
                    <span className="subtle">Durée</span>
                    <strong>{formatDuration(program.durationMonths)}</strong>
                  </div>
                  <div className="stack-sm">
                    <span className="subtle">Langues</span>
                    <strong>{program.languages?.join(', ') || '—'}</strong>
                    <span className="subtle">Frais</span>
                    <strong>{formatCurrency(program.tuitionCents, program.currency)}</strong>
                  </div>
                </div>
                <div className="stack-sm">
                  <span className="subtle">Campus</span>
                  <p className="muted">{program.campuses?.join(', ') || '—'}</p>
                </div>
                <div className="flex space-between items-center">
                  <Link href={`/diplomas/${program.slug}`} className="btn btn-primary">
                    Voir la fiche
                  </Link>
                  {program.startPeriods?.length ? (
                    <span className="badge muted">Intakes: {program.startPeriods.join(', ')}</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}


