"use client";

import type { Deadline } from '@dossiertracker/shared';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListTodo,
  Clock,
  CheckCircle2,
  Calendar,
  RefreshCw,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';

import { Protected } from '../../components/Protected';
import { Banner } from '../../components/ui/Banner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loading } from '../../components/ui/Loading';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { StatusPill } from '../../components/ui/StatusPill';
import { fetchDeadlines, syncCandidatureDeadlines } from '../../lib/api';
import { useAuth } from '../providers/AuthProvider';

const UPCOMING_WINDOW_DAYS = 30;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

/**
 * Dashboard page showing overview of tasks, stats, and upcoming deadlines.
 */
export default function DashboardPage() {
  const { token, user, candidatures, refreshSession } = useAuth();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [banner, setBanner] = useState<{ tone: 'info' | 'success' | 'error'; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [isLoadingDeadlines, setIsLoadingDeadlines] = useState(true);

  useEffect(() => {
    setIsLoadingDeadlines(true);
    fetchDeadlines()
      .then(setDeadlines)
      .catch((err) => setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Impossible de charger' }))
      .finally(() => setIsLoadingDeadlines(false));
  }, []);

  const tasks = useMemo(
    () =>
      candidatures.flatMap((cand) =>
        cand.tasks.map((task) => ({
          ...task,
          contestName: cand.contest.name,
          contestYear: cand.contest.year,
          schoolName: cand.school?.name,
        })),
      ),
    [candidatures],
  );

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const doing = tasks.filter((t) => t.status === 'doing').length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const upcoming = tasks.filter((task) => {
      if (!task.deadline?.dueAt) return false;
      const dueDate = new Date(task.deadline.dueAt);
      const now = new Date();
      const inWindow = dueDate.getTime() - now.getTime() <= UPCOMING_WINDOW_DAYS * 24 * 60 * 60 * 1000;
      return inWindow && dueDate > now && task.status !== 'done';
    }).length;
    return { total, done, doing, todo, upcoming };
  }, [tasks]);

  const upcomingDeadlines = useMemo(
    () =>
      tasks
        .filter((task) => task.deadline?.dueAt)
        .map((task) => ({
          ...task,
          dueAt: task.deadline?.dueAt ?? '',
        }))
        .filter((task) => {
          const dueDate = new Date(task.dueAt);
          const now = new Date();
          return dueDate > now && dueDate.getTime() - now.getTime() <= UPCOMING_WINDOW_DAYS * 24 * 60 * 60 * 1000;
        })
        .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
        .slice(0, 6),
    [tasks],
  );

  const handleSync = async (candidatureId: string) => {
    if (!token) return;
    setBanner(null);
    setIsSyncing(candidatureId);
    try {
      const res = await syncCandidatureDeadlines(token, candidatureId);
      setBanner({ tone: 'success', message: `Synchronisation terminée (${res.created} nouvelles tâches).` });
      await refreshSession();
    } catch (err) {
      setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Erreur lors de la synchronisation.' });
    } finally {
      setIsSyncing(null);
    }
  };

  const getDaysUntil = (dateStr: string) => {
    const now = new Date();
    const due = new Date(dateStr);
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <Protected>
      <div className="app-content">
        <PageHeader
          badge={`Bienvenue, ${user?.firstName} 👋`}
          title="Tableau de bord"
          description="Vue rapide sur tes candidatures, tâches et prochaines échéances."
        />

        <AnimatePresence>
          {banner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ marginBottom: 'var(--space-6)' }}
            >
              <Banner message={banner.message} tone={banner.tone} dismissible ariaLive="assertive" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-4"
          style={{ marginBottom: 'var(--space-6)' }}
        >
          <motion.div variants={item}>
            <StatCard
              label="Tâches totales"
              value={stats.total}
              trend={`${stats.todo} à faire · ${stats.doing} en cours`}
              icon={<ListTodo size={20} />}
              variant="primary"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              label="En cours"
              value={stats.doing}
              trend="Actuellement"
              icon={<Clock size={20} />}
              variant="warning"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              label="Terminées"
              value={stats.done}
              trend="Bravo ! Continue comme ça 🎉"
              icon={<CheckCircle2 size={20} />}
              variant="success"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              label="Échéances proches"
              value={stats.upcoming}
              trend="Dans les 30 prochains jours"
              icon={<AlertCircle size={20} />}
              variant="accent"
            />
          </motion.div>
        </motion.div>

        <div className="grid grid-2" style={{ marginBottom: 'var(--space-6)' }}>
          {/* Upcoming Deadlines */}
          <Card
            title="Prochaines échéances"
            description="Dates limites dans les 30 prochains jours"
            icon={<Calendar size={20} />}
            actions={
              <Link href="/deadlines">
                <Button variant="ghost" size="sm" iconRight={<ChevronRight size={16} />}>
                  Tout voir
                </Button>
              </Link>
            }
          >
            {upcomingDeadlines.length === 0 ? (
              <EmptyState
                title="Aucune échéance imminente"
                description="Synchronise tes candidatures pour importer les deadlines officielles."
              />
            ) : (
              <motion.div variants={container} initial="hidden" animate="show" className="list">
                {upcomingDeadlines.map((task) => {
                  const daysUntil = getDaysUntil(task.dueAt);
                  const isUrgent = daysUntil <= 7;
                  
                  return (
                    <motion.div key={task.id} variants={item} className="list-item">
                      <div className="list-item-content">
                        <div className="list-item-title">{task.title}</div>
                        <div className="list-item-subtitle">
                          {task.contestName} {task.contestYear}
                          {task.schoolName ? ` · ${task.schoolName}` : ''}
                        </div>
                      </div>
                      <div className="list-item-actions">
                        <span
                          className={`badge ${isUrgent ? 'danger' : ''}`}
                          style={isUrgent ? { background: 'var(--danger-soft)', color: 'var(--danger)' } : {}}
                        >
                          {daysUntil === 0 ? "Aujourd'hui" : daysUntil === 1 ? 'Demain' : `J-${daysUntil}`}
                        </span>
                        <StatusPill status={task.status} showLabel={false} />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </Card>

          {/* Quick Actions - Candidatures */}
          <Card
            title="Mes candidatures"
            description="Synchronise les échéances de tes dossiers"
            icon={<RefreshCw size={20} />}
            actions={
              <Link href="/candidatures">
                <Button variant="ghost" size="sm" iconRight={<ChevronRight size={16} />}>
                  Gérer
                </Button>
              </Link>
            }
          >
            {candidatures.length === 0 ? (
              <EmptyState
                title="Aucune candidature"
                description="Crée une candidature pour commencer à suivre tes dossiers."
                action={
                  <Link href="/candidatures">
                    <Button size="sm">Créer une candidature</Button>
                  </Link>
                }
              />
            ) : (
              <motion.div variants={container} initial="hidden" animate="show" className="list">
                {candidatures.slice(0, 4).map((cand) => (
                  <motion.div key={cand.id} variants={item} className="list-item">
                    <div className="list-item-content">
                      <div className="list-item-title">
                        {cand.contest.name} {cand.contest.year}
                      </div>
                      <div className="list-item-subtitle">
                        {cand.school?.name || 'Sans école'} · {cand.tasks.length} tâches
                      </div>
                    </div>
                    <div className="list-item-actions">
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={isSyncing === cand.id}
                        onClick={() => handleSync(cand.id)}
                        iconLeft={<RefreshCw size={14} />}
                      >
                        Sync
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </Card>
        </div>

        {/* Catalog Preview */}
        <Card
          title="Catalogue des deadlines"
          description="Échéances officielles (tous concours)"
          icon={<Calendar size={20} />}
          actions={
            <Link href="/diplomas">
              <Button variant="ghost" size="sm" iconRight={<ChevronRight size={16} />}>
                Explorer
              </Button>
            </Link>
          }
        >
          {isLoadingDeadlines ? (
            <Loading label="Chargement des deadlines..." />
          ) : deadlines.length === 0 ? (
            <EmptyState title="Aucune deadline" description="Ajoute des données via l'API ou le seed." />
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="list">
              {deadlines.slice(0, 5).map((dl) => (
                <motion.div key={dl.id} variants={item} className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title">{dl.title}</div>
                    <div className="list-item-subtitle">{dl.type}</div>
                  </div>
                  <div className="list-item-actions">
                    <span className="text-muted text-sm">
                      {new Date(dl.dueAt).toLocaleDateString('fr-FR')}
                    </span>
                    <span className={`badge ${dl.schoolId ? 'primary' : ''}`}>
                      {dl.schoolId ? 'École' : 'Concours'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </Card>
      </div>
    </Protected>
  );
}
