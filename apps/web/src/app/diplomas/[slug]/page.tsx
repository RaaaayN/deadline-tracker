"use client";

import { Program } from '@dossiertracker/shared';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  CreditCard,
  Globe,
  MapPin,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  FileText,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { Banner } from '../../../components/ui/Banner';
import { Button } from '../../../components/ui/Button';
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
  return remaining > 0 ? `${years} an${years > 1 ? 's' : ''} ${remaining} mois` : `${years} an${years > 1 ? 's' : ''}`;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

/**
 * Diploma detail page with full program information.
 */
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
      <div className="app-content">
        <Card>
          <Loading label="Chargement du programme..." />
        </Card>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="app-content">
        <Banner tone="error" message={error ?? 'Diplôme introuvable.'} ariaLive="assertive" />
        <Card style={{ marginTop: 'var(--space-4)' }}>
          <EmptyState
            title="Diplôme introuvable"
            description="Ce programme n'existe pas ou a été supprimé."
            action={
              <Link href="/diplomas">
                <Button iconLeft={<ArrowLeft size={18} />}>Retour au catalogue</Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  const topEntry = program.leaderboardEntries?.[0];
  const bestRanking = topEntry?.leaderboard;

  return (
    <div className="app-content">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 'var(--space-4)' }}
      >
        <Link href="/diplomas" className="flex items-center gap-2 text-muted" style={{ marginBottom: 'var(--space-4)' }}>
          <ArrowLeft size={18} />
          <span>Retour au catalogue</span>
        </Link>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero"
        style={{ marginBottom: 'var(--space-8)' }}
      >
        <div className="stack-md">
          <div className="flex items-start justify-between gap-4">
            <div className="stack-sm">
              <div className="flex items-center gap-2">
                <span className="badge primary">{program.domain}</span>
                <span className="badge">{program.format.replace(/_/g, ' ')}</span>
              </div>
              <h1 style={{ fontSize: 'var(--text-3xl)', marginTop: 'var(--space-2)' }}>{program.name}</h1>
              <p className="text-secondary" style={{ fontSize: 'var(--text-lg)' }}>
                {program.school?.name}
              </p>
            </div>
            {bestRanking && (
              <div className="badge success" style={{ padding: 'var(--space-2) var(--space-3)' }}>
                <Award size={16} />
                #{topEntry?.rank} {bestRanking.source} ({bestRanking.year})
              </div>
            )}
          </div>

          <p className="text-secondary">{program.description}</p>

          <div className="flex flex-wrap gap-3">
            {program.website && (
              <a href={program.website} target="_blank" rel="noreferrer">
                <Button iconRight={<ExternalLink size={16} />}>Site du programme</Button>
              </a>
            )}
          </div>
        </div>
      </motion.section>

      {/* Quick Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-4"
        style={{ marginBottom: 'var(--space-8)' }}
      >
        <motion.div variants={item} className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon primary"><Clock size={20} /></div>
          </div>
          <div className="stat-card-value" style={{ fontSize: 'var(--text-xl)' }}>
            {formatDuration(program.durationMonths)}
          </div>
          <p className="stat-card-label">Durée</p>
        </motion.div>

        <motion.div variants={item} className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon warning"><CreditCard size={20} /></div>
          </div>
          <div className="stat-card-value" style={{ fontSize: 'var(--text-xl)' }}>
            {formatCurrency(program.tuitionCents, program.currency)}
          </div>
          <p className="stat-card-label">Frais de scolarité</p>
        </motion.div>

        <motion.div variants={item} className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon success"><Globe size={20} /></div>
          </div>
          <div className="stat-card-value" style={{ fontSize: 'var(--text-xl)' }}>
            {program.languages?.join(', ') || '—'}
          </div>
          <p className="stat-card-label">Langues</p>
        </motion.div>

        <motion.div variants={item} className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon accent"><MapPin size={20} /></div>
          </div>
          <div className="stat-card-value" style={{ fontSize: 'var(--text-xl)' }}>
            {program.campuses?.[0] || '—'}
          </div>
          <p className="stat-card-label">Campus principal</p>
        </motion.div>
      </motion.div>

      {/* Details */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-2"
        style={{ marginBottom: 'var(--space-6)' }}
      >
        <motion.div variants={item}>
          <Card title="Admissions" icon={<FileText size={20} />}>
            <div className="list">
              {program.admissionPrerequisites?.length ? (
                <div className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title">Prérequis</div>
                    <div className="list-item-subtitle">{program.admissionPrerequisites.join(', ')}</div>
                  </div>
                </div>
              ) : null}
              {program.admissionTests?.length ? (
                <div className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title">Tests requis</div>
                    <div className="list-item-subtitle">{program.admissionTests.join(', ')}</div>
                  </div>
                </div>
              ) : null}
              {program.admissionDocuments?.length ? (
                <div className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title">Documents</div>
                    <div className="list-item-subtitle">{program.admissionDocuments.join(', ')}</div>
                  </div>
                </div>
              ) : null}
              {program.admissionProcess && (
                <div className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title">Processus</div>
                    <div className="list-item-subtitle">{program.admissionProcess}</div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card title="Financement" icon={<CreditCard size={20} />}>
            <div className="list">
              <div className="list-item">
                <div className="list-item-content">
                  <div className="list-item-title">Frais de scolarité</div>
                  <div className="list-item-subtitle">{formatCurrency(program.tuitionCents, program.currency)}</div>
                </div>
              </div>
              <div className="list-item">
                <div className="list-item-content">
                  <div className="list-item-title">Frais de dossier</div>
                  <div className="list-item-subtitle">{formatCurrency(program.applicationFeeCents, program.currency)}</div>
                </div>
              </div>
              {program.financing && (
                <div className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title">Options de financement</div>
                    <div className="list-item-subtitle">{program.financing}</div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-2"
        style={{ marginBottom: 'var(--space-6)' }}
      >
        <motion.div variants={item}>
          <Card title="Objectifs" icon={<Target size={20} />}>
            <p className="text-secondary" style={{ marginBottom: 'var(--space-4)' }}>
              {program.objectives ?? 'Objectifs à venir.'}
            </p>
            {program.outcomes?.length ? (
              <div className="list">
                {program.outcomes.map((outcome, i) => (
                  <div key={i} className="list-item">
                    <div className="list-item-content">
                      <div className="list-item-title">{outcome}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card title="Débouchés" icon={<Briefcase size={20} />}>
            {program.careers?.length ? (
              <div className="list">
                {program.careers.map((career) => (
                  <div key={career.id} className="list-item">
                    <div className="list-item-content">
                      <div className="list-item-title">{career.title}</div>
                      <div className="list-item-subtitle">{career.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">Débouchés en cours de collecte.</p>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* Courses */}
      <motion.div variants={item} style={{ marginBottom: 'var(--space-6)' }}>
        <Card title="Cours & Modules" icon={<BookOpen size={20} />}>
          {program.courses?.length ? (
            <div className="list">
              {program.courses.map((course) => (
                <div key={course.id} className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title">{course.title}</div>
                    <div className="list-item-subtitle">{course.description}</div>
                  </div>
                  {course.category && <span className="badge">{course.category}</span>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Modules en cours de collecte" description="Les cours seront ajoutés prochainement." />
          )}
        </Card>
      </motion.div>

      {/* Deadlines */}
      <motion.div variants={item}>
        <Card title="Échéances" icon={<Calendar size={20} />}>
          {program.deadlines?.length ? (
            <div className="list">
              {program.deadlines.map((dl) => (
                <div key={dl.id} className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title">{dl.title}</div>
                    <div className="list-item-subtitle">
                      {dl.sessionLabel} · {dl.type}
                    </div>
                  </div>
                  <div className="list-item-actions">
                    <span className="text-muted text-sm">{formatDate(dl.dueAt)}</span>
                    <span className="badge">{dl.type}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Aucune échéance" description="Les dates seront ajoutées prochainement." />
          )}
        </Card>
      </motion.div>
    </div>
  );
}
