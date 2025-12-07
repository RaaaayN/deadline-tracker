"use client";

import { Leaderboard, LeaderboardEntry } from '@dossiertracker/shared';
import { motion } from 'framer-motion';
import {
  Trophy,
  ArrowLeft,
  ExternalLink,
  Calendar,
  MapPin,
  Tag,
  Award,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { Banner } from '../../../components/ui/Banner';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Loading } from '../../../components/ui/Loading';
import { fetchLeaderboard } from '../../../lib/api';

type Props = {
  params: { slug: string };
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

/**
 * Leaderboard detail page with ranking entries.
 */
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
      <div className="app-content">
        <Card>
          <Loading label="Chargement du classement..." />
        </Card>
      </div>
    );
  }

  if (error || !leaderboard) {
    return (
      <div className="app-content">
        <Banner tone="error" message={error ?? 'Classement introuvable'} ariaLive="assertive" />
        <Card style={{ marginTop: 'var(--space-4)' }}>
          <EmptyState
            title="Classement introuvable"
            description="Ce classement n'existe pas ou a été supprimé."
            action={
              <Link href="/leaderboards">
                <Button iconLeft={<ArrowLeft size={18} />}>Retour aux classements</Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  // Sort entries by rank
  const sortedEntries = [...leaderboard.entries].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));

  return (
    <div className="app-content">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 'var(--space-4)' }}
      >
        <Link href="/leaderboards" className="flex items-center gap-2 text-muted">
          <ArrowLeft size={18} />
          <span>Retour aux classements</span>
        </Link>
      </motion.div>

      {/* Header */}
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
                <span className="badge primary">
                  <Trophy size={12} />
                  {leaderboard.source}
                </span>
                <span className="badge">
                  <Calendar size={12} />
                  {leaderboard.year}
                </span>
              </div>
              <h1 style={{ fontSize: 'var(--text-3xl)', marginTop: 'var(--space-2)' }}>
                {leaderboard.name}
              </h1>
              <div className="flex items-center gap-4 text-secondary">
                {leaderboard.category && (
                  <span className="flex items-center gap-1">
                    <Tag size={14} />
                    {leaderboard.category}
                  </span>
                )}
                {leaderboard.region && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {leaderboard.region}
                  </span>
                )}
              </div>
            </div>
            <div className="badge success" style={{ padding: 'var(--space-2) var(--space-3)' }}>
              <Award size={16} />
              {sortedEntries.length} entrées
            </div>
          </div>

          {leaderboard.description && (
            <p className="text-secondary">{leaderboard.description}</p>
          )}

          {leaderboard.url && (
            <a href={leaderboard.url} target="_blank" rel="noreferrer">
              <Button variant="secondary" iconRight={<ExternalLink size={16} />}>
                Voir la méthodologie
              </Button>
            </a>
          )}
        </div>
      </motion.section>

      {/* Rankings Table */}
      <Card title="Classement" icon={<Trophy size={20} />}>
        {sortedEntries.length === 0 ? (
          <EmptyState
            title="Aucune entrée"
            description="Ce classement n'a pas encore d'entrées."
            icon={<Trophy size={64} />}
          />
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="list">
            {sortedEntries.map((entry) => {
              const isTopThree = entry.rank && entry.rank <= 3;
              
              return (
                <motion.div
                  key={entry.id}
                  variants={item}
                  className="list-item"
                  style={{
                    background: isTopThree ? 'var(--primary-soft)' : undefined,
                    borderColor: isTopThree ? 'var(--primary-light)' : undefined,
                  }}
                >
                  <div className="flex items-center gap-4" style={{ flex: 1 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-md)',
                        background: isTopThree
                          ? 'linear-gradient(135deg, var(--primary), var(--primary-hover))'
                          : 'var(--surface-muted)',
                        color: isTopThree ? 'white' : 'var(--text)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 'var(--text-lg)',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {entry.rank ?? '-'}
                    </div>
                    <div className="list-item-content">
                      <div className="list-item-title">
                        {entry.school?.name || entry.program?.name || 'École/Programme'}
                      </div>
                      {entry.program && entry.school && (
                        <div className="list-item-subtitle">{entry.program.name}</div>
                      )}
                      {entry.notes && <div className="list-item-subtitle">{entry.notes}</div>}
                    </div>
                  </div>
                  <div className="list-item-actions">
                    {entry.score && (
                      <span className="badge">{entry.score}</span>
                    )}
                    {entry.program?.slug && (
                      <Link href={`/diplomas/${entry.program.slug}`}>
                        <Button variant="ghost" size="sm" iconRight={<ChevronRight size={14} />}>
                          Voir
                        </Button>
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </Card>
    </div>
  );
}
