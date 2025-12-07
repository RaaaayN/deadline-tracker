"use client";

import { Leaderboard } from '@dossiertracker/shared';
import { motion } from 'framer-motion';
import { Trophy, ChevronRight, Calendar, MapPin, Tag } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { Banner } from '../../components/ui/Banner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loading } from '../../components/ui/Loading';
import { PageHeader } from '../../components/ui/PageHeader';
import { fetchLeaderboards } from '../../lib/api';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

/**
 * Leaderboards listing page.
 */
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

  // Group by source
  const groupedBySource = leaderboards.reduce<Record<string, Leaderboard[]>>((acc, lb) => {
    const source = lb.source || 'Autre';
    if (!acc[source]) acc[source] = [];
    acc[source].push(lb);
    return acc;
  }, {});

  return (
    <div className="app-content">
      <PageHeader
        badge="Classements"
        title="Rankings des écoles et programmes"
        description="Financial Times, QS, et autres sources pour comparer les meilleures formations."
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

      {loading ? (
        <Card>
          <Loading label="Chargement des classements..." />
        </Card>
      ) : leaderboards.length === 0 ? (
        <Card>
          <EmptyState
            title="Aucun classement disponible"
            description="Les classements seront ajoutés prochainement."
            icon={<Trophy size={64} />}
          />
        </Card>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="stack-lg">
          {Object.entries(groupedBySource).map(([source, lbs]) => (
            <div key={source} className="stack-md">
              <div className="flex items-center gap-2">
                <Trophy size={20} className="text-primary" />
                <h2 style={{ fontSize: 'var(--text-xl)' }}>{source}</h2>
                <span className="badge">{lbs.length}</span>
              </div>

              <div className="grid grid-3">
                {lbs.map((lb) => (
                  <motion.div key={lb.id} variants={item}>
                    <Card variant="interactive" className="stack-md" style={{ height: '100%' }}>
                      <div className="stack-xs">
                        <div className="flex items-center gap-2">
                          <span className="badge primary">{lb.source}</span>
                          <span className="badge">
                            <Calendar size={12} />
                            {lb.year}
                          </span>
                        </div>
                        <h3 style={{ fontSize: 'var(--text-lg)', marginTop: 'var(--space-2)' }}>
                          {lb.name}
                        </h3>
                      </div>

                      <div className="stack-xs">
                        {lb.category && (
                          <div className="flex items-center gap-2 text-sm text-muted">
                            <Tag size={14} />
                            <span>{lb.category}</span>
                          </div>
                        )}
                        {lb.region && (
                          <div className="flex items-center gap-2 text-sm text-muted">
                            <MapPin size={14} />
                            <span>{lb.region}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-secondary text-sm" style={{ flex: 1 }}>
                        {lb.description || 'Découvre le top des écoles et programmes.'}
                      </p>

                      <Link href={`/leaderboards/${lb.slug}`}>
                        <Button size="sm" iconRight={<ChevronRight size={16} />}>
                          Voir le classement
                        </Button>
                      </Link>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
