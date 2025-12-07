"use client";

import type { Contest, ContestTestRequirement } from '@dossiertracker/shared';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Filter,
  Globe,
  MapPin,
  Target,
  ExternalLink,
  ClipboardList,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { Banner } from '../../components/ui/Banner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { Loading } from '../../components/ui/Loading';
import { PageHeader } from '../../components/ui/PageHeader';
import { Select } from '../../components/ui/Select';
import { fetchContests } from '../../lib/api';

const TEST_LABELS = {
  gmat: 'GMAT',
  tage_mage: 'TAGE MAGE',
  gre: 'GRE',
  toeic: 'TOEIC',
  toefl: 'TOEFL',
  ielts: 'IELTS',
  sat: 'SAT',
  other: 'Autre test',
} as const;

type TestKey = keyof typeof TEST_LABELS;

type Filters = {
  year: string;
  test: TestKey | '';
  language: string;
  query: string;
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function formatCurrency(cents?: number | null, currency = 'EUR') {
  if (!cents && cents !== 0) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(cents / 100);
}

function formatDate(date?: string) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDurationMinutes(minutes?: number | null) {
  if (!minutes) return '—';
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (hours === 0) return `${remaining} min`;
  return remaining > 0 ? `${hours} h ${remaining} min` : `${hours} h`;
}

function TestRequirementList({ requirements }: { requirements?: ContestTestRequirement[] }) {
  if (!requirements || requirements.length === 0) {
    return <p className="text-muted">Exigences de tests à venir.</p>;
  }

  return (
    <div className="list">
      {requirements.map((req) => (
        <div key={req.id} className="list-item">
          <div className="list-item-content">
            <div className="list-item-title">{TEST_LABELS[req.test as TestKey] ?? req.test}</div>
            <div className="list-item-subtitle">
              {req.minimumScore ? `Min ${req.minimumScore}` : 'Seuil à confirmer'}
              {req.recommendedScore ? ` · Reco ${req.recommendedScore}` : ''}
              {req.weightPercent ? ` · ${req.weightPercent}% du score` : ''}
              {req.validityMonths ? ` · Validité ${req.validityMonths} mois` : ''}
            </div>
            {req.sections?.length ? (
              <div className="flex gap-2 flex-wrap" style={{ marginTop: 'var(--space-2)' }}>
                {req.sections.map((section) => (
                  <span key={section} className="badge">
                    {section}
                  </span>
                ))}
              </div>
            ) : null}
            {req.notes ? <p className="text-muted text-sm" style={{ marginTop: 'var(--space-2)' }}>{req.notes}</p> : null}
          </div>
          {req.registrationUrl ? (
            <a href={req.registrationUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
              S'inscrire
            </a>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/**
 * Concours page: catalog of contests/tests (GMAT, TAGE MAGE, TOEIC, TOEFL, etc.)
 */
export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [filters, setFilters] = useState<Filters>({ year: '', test: '', language: '', query: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchContests({
          year: filters.year ? Number(filters.year) : undefined,
        });
        setContests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Impossible de charger les concours.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [filters.test, filters.year]);

  const availableYears = useMemo(() => Array.from(new Set(contests.map((c) => c.year))).sort((a, b) => b - a), [contests]);
  const availableTests = useMemo(
    () =>
      Array.from(
        new Set(
          contests.flatMap((c) => c.testRequirements?.map((tr) => tr.test as TestKey) ?? []),
        ),
      ).filter((t): t is TestKey => Boolean(TEST_LABELS[t])),
    [contests],
  );
  const availableLanguages = useMemo(
    () => Array.from(new Set(contests.flatMap((c) => c.languages ?? []))).sort(),
    [contests],
  );

  const filteredContests = useMemo(() => {
    return contests
      .filter((contest) =>
        filters.language ? contest.languages?.some((lang) => lang.toLowerCase() === filters.language.toLowerCase()) : true,
      )
      .filter((contest) =>
        filters.query ? contest.name.toLowerCase().includes(filters.query.toLowerCase()) : true,
      );
  }, [contests, filters.language, filters.query]);

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  const clearFilters = () => {
    setFilters({ year: '', test: '', language: '', query: '' });
  };

  return (
    <div className="app-content">
      <PageHeader
        badge="Concours"
        title="Prépare tes concours et tests"
        description="GMAT, TAGE MAGE, TOEIC, TOEFL... Retrouve formats, scores cibles et prochaines sessions."
        actions={
          <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} iconLeft={<Filter size={18} />}>
            {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </Button>
        }
      />

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 'var(--space-6)' }}>
          <Banner tone="error" message={error} ariaLive="assertive" />
        </motion.div>
      )}

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
                hasActiveFilters ? (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Réinitialiser
                  </Button>
                ) : null
              }
            >
              <div className="grid grid-4">
                <Select
                  label="Année"
                  name="year"
                  value={filters.year}
                  onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}
                  options={[
                    { value: '', label: 'Toutes les années' },
                    ...availableYears.map((year) => ({ value: year.toString(), label: year.toString() })),
                  ]}
                />
                <Select
                  label="Test"
                  name="test"
                  value={filters.test}
                  onChange={(e) => setFilters((f) => ({ ...f, test: e.target.value as TestKey | '' }))}
                  options={[
                    { value: '', label: 'Tous les tests' },
                    ...availableTests.map((test) => ({ value: test, label: TEST_LABELS[test] })),
                  ]}
                />
                <Select
                  label="Langue"
                  name="language"
                  value={filters.language}
                  onChange={(e) => setFilters((f) => ({ ...f, language: e.target.value }))}
                  options={[{ value: '', label: 'Toutes les langues' }, ...availableLanguages.map((lang) => ({ value: lang, label: lang }))]}
                />
                <Input
                  label="Recherche"
                  name="query"
                  placeholder="Nom du concours..."
                  value={filters.query}
                  onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
                />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <Card>
          <Loading label="Chargement des concours..." />
        </Card>
      ) : filteredContests.length === 0 ? (
        <Card>
          <EmptyState
            title="Aucun concours trouvé"
            description="Ajuste les filtres ou réinitialise-les pour voir tous les concours."
            icon={<ClipboardList size={64} />}
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
        <motion.div variants={container} initial="hidden" animate="show" className="stack-lg">
          <div className="grid grid-2">
            {filteredContests.map((contest) => {
              const upcomingDeadlines = (contest.deadlines ?? []).slice(0, 3);
              return (
                <motion.div key={contest.id} variants={item}>
                  <Card variant="interactive" className="stack-md">
                    <div className="flex items-start justify-between gap-4">
                      <div className="stack-xs">
                        <div className="flex items-center gap-2">
                          <span className="badge primary">{contest.year}</span>
                          {contest.examFormat ? <span className="badge">{contest.examFormat}</span> : null}
                        </div>
                        <h3 style={{ fontSize: 'var(--text-xl)', marginTop: 'var(--space-2)' }}>{contest.name}</h3>
                        {contest.description ? <p className="text-secondary text-sm">{contest.description}</p> : null}
                        <div className="flex gap-2 flex-wrap">
                          {contest.languages?.map((lang) => (
                            <span key={lang} className="badge success">
                              <Globe size={12} />
                              {lang}
                            </span>
                          ))}
                          {contest.examLocations?.[0] ? (
                            <span className="badge">
                              <MapPin size={12} />
                              {contest.examLocations.slice(0, 2).join(', ')}
                              {contest.examLocations.length > 2 ? ' +' : ''}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {contest.registrationUrl ? (
                        <a href={contest.registrationUrl} target="_blank" rel="noreferrer">
                          <Button size="sm" iconRight={<ExternalLink size={16} />}>
                            S'inscrire
                          </Button>
                        </a>
                      ) : null}
                    </div>

                    <div className="grid grid-3" style={{ marginTop: 'var(--space-3)', gap: 'var(--space-3)' }}>
                      <div className="stack-xs">
                        <div className="text-muted text-sm flex items-center gap-2">
                          <Clock size={14} />
                          <span>Durée</span>
                        </div>
                        <div className="text-body">{formatDurationMinutes(contest.durationMinutes)}</div>
                      </div>
                      <div className="stack-xs">
                        <div className="text-muted text-sm flex items-center gap-2">
                          <Target size={14} />
                          <span>Échelle</span>
                        </div>
                        <div className="text-body">{contest.scoreScale ?? '—'}</div>
                      </div>
                      <div className="stack-xs">
                        <div className="text-muted text-sm flex items-center gap-2">
                          <Calendar size={14} />
                          <span>Frais</span>
                        </div>
                        <div className="text-body">{formatCurrency(contest.feesCents, contest.currency)}</div>
                      </div>
                    </div>

                    <Card title="Tests requis" icon={<Target size={18} />} variant="nested">
                      <TestRequirementList requirements={contest.testRequirements} />
                    </Card>

                    <Card title="Prochaines sessions" icon={<Calendar size={18} />} variant="nested">
                      {upcomingDeadlines.length ? (
                        <div className="list">
                          {upcomingDeadlines.map((dl) => (
                            <div key={dl.id} className="list-item">
                              <div className="list-item-content">
                                <div className="list-item-title">{dl.title}</div>
                                <div className="list-item-subtitle">{dl.sessionLabel}</div>
                              </div>
                              <div className="list-item-actions">
                                <span className="badge">{dl.type}</span>
                                <span className="text-muted text-sm">{formatDate(dl.dueAt)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted">Sessions à venir.</p>
                      )}
                    </Card>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

