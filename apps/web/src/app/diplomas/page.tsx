"use client";

import { Program, ProgramFormat, ProgramType } from '@dossiertracker/shared';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  MapPin,
  Clock,
  Globe,
  CreditCard,
  Award,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';

import { Banner } from '../../components/ui/Banner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loading } from '../../components/ui/Loading';
import { PageHeader } from '../../components/ui/PageHeader';
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
  { value: ProgramType.SpecializedMsc, label: 'Specialized MSc' },
  { value: ProgramType.ExecutiveMaster, label: 'Executive Master' },
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function formatCurrency(cents?: number | null, currency = 'EUR') {
  if (!cents && cents !== 0) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(cents / 100);
}

function formatDuration(months?: number | null) {
  if (!months) return '—';
  if (months < 12) return `${months} mois`;
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  return remaining > 0 ? `${years} an${years > 1 ? 's' : ''} ${remaining} mois` : `${years} an${years > 1 ? 's' : ''}`;
}

/**
 * Diplomas catalog page with filtering and program cards.
 */
export default function DiplomasPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filters, setFilters] = useState<Filters>({ domain: '', campus: '', type: '', format: '' });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);

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

  const clearFilters = () => {
    setFilters({ domain: '', campus: '', type: '', format: '' });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  return (
    <div className="app-content">
      <PageHeader
        badge="Catalogue"
        title="Trouve le bon diplôme"
        description="Explore les programmes par domaine, format, campus et type."
        actions={
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            iconLeft={<Filter size={18} />}
          >
            {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </Button>
        }
      />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 'var(--space-6)' }}
        >
          <Banner tone="error" message={error} ariaLive="assertive" />
        </motion.div>
      )}

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginBottom: 'var(--space-6)' }}
          >
            <Card
              title="Filtres"
              icon={<Filter size={20} />}
              actions={
                hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Réinitialiser
                  </Button>
                )
              }
            >
              <div className="grid grid-4">
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Programs Grid */}
      {loading ? (
        <Card>
          <Loading label="Chargement des programmes..." />
        </Card>
      ) : programs.length === 0 ? (
        <Card>
          <EmptyState
            title="Aucun programme trouvé"
            description="Ajuste tes filtres ou réinitialise-les pour voir tous les diplômes."
            action={
              hasActiveFilters ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Réinitialiser les filtres
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-3">
          {programs.map((program) => {
            const topEntry = program.leaderboardEntries?.[0];
            const bestRanking = topEntry?.leaderboard;

            return (
              <motion.div key={program.id} variants={item}>
                <Card variant="interactive" className="stack-md" style={{ height: '100%' }}>
                  <div className="flex justify-between items-start">
                    <div className="stack-xs">
                      <span className="badge primary">{program.domain}</span>
                      <h3 style={{ fontSize: 'var(--text-lg)', marginTop: 'var(--space-2)' }}>
                        {program.name}
                      </h3>
                      <p className="text-muted text-sm">{program.school?.name}</p>
                    </div>
                    {bestRanking && (
                      <span className="badge success">
                        <Award size={12} />
                        #{topEntry?.rank} {bestRanking.source}
                      </span>
                    )}
                  </div>

                  <p className="text-secondary text-sm" style={{ flex: 1 }}>
                    {program.description?.slice(0, 120)}
                    {program.description && program.description.length > 120 ? '...' : ''}
                  </p>

                  <div className="grid grid-2" style={{ gap: 'var(--space-3)' }}>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={14} className="text-muted" />
                      <span>{formatDuration(program.durationMonths)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard size={14} className="text-muted" />
                      <span>{formatCurrency(program.tuitionCents, program.currency)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Globe size={14} className="text-muted" />
                      <span>{program.languages?.join(', ') || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={14} className="text-muted" />
                      <span>{program.campuses?.[0] || '—'}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center" style={{ marginTop: 'auto' }}>
                    <Link href={`/diplomas/${program.slug}`}>
                      <Button size="sm" iconRight={<ChevronRight size={16} />}>
                        Voir la fiche
                      </Button>
                    </Link>
                    {program.startPeriods?.length ? (
                      <span className="badge">{program.startPeriods[0]}</span>
                    ) : null}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
