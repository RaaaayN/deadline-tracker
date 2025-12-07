"use client";

import type { Contest, Deadline, School, TaskStatus } from '@dossiertracker/shared';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Clock,
  Building2,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { Protected } from '../../components/Protected';
import { Banner } from '../../components/ui/Banner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { Select } from '../../components/ui/Select';
import { StatusPill } from '../../components/ui/StatusPill';
import {
  fetchContests,
  fetchDeadlines,
  fetchSchools,
  syncCandidatureDeadlines,
  updateTaskStatus,
} from '../../lib/api';
import { useAuth } from '../providers/AuthProvider';

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
 * Deadlines page with filters and task management.
 */
export default function DeadlinesPage() {
  const { token, candidatures, refreshSession } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [officialDeadlines, setOfficialDeadlines] = useState<Deadline[]>([]);
  const [filters, setFilters] = useState({ contestId: '', schoolId: '', status: '', query: '', start: '', end: '' });
  const [banner, setBanner] = useState<{ tone: 'info' | 'success' | 'error'; message: string } | null>(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    setIsLoadingCatalog(true);
    fetchContests()
      .then(setContests)
      .catch((err) => setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Erreur catalogue' }))
      .finally(() => setIsLoadingCatalog(false));
  }, []);

  useEffect(() => {
    if (!filters.contestId) {
      setSchools([]);
      setOfficialDeadlines([]);
      return;
    }
    fetchSchools(filters.contestId)
      .then(setSchools)
      .catch((err) => setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Erreur écoles' }));
  }, [filters.contestId]);

  useEffect(() => {
    const loadDeadlines = async () => {
      try {
        const data = await fetchDeadlines(filters.contestId, filters.schoolId);
        setOfficialDeadlines(data);
      } catch (err) {
        setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Erreur deadlines' });
      }
    };
    void loadDeadlines();
  }, [filters.contestId, filters.schoolId]);

  const tasks = useMemo(
    () =>
      candidatures.flatMap((cand) =>
        cand.tasks.map((task) => ({
          ...task,
          candidatureId: cand.id,
          contestId: cand.contest.id,
          contestName: cand.contest.name,
          contestYear: cand.contest.year,
          schoolId: cand.school?.id,
          schoolName: cand.school?.name,
          diplomaName: cand.diplomaName,
        })),
      ),
    [candidatures],
  );

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => (filters.status ? task.status === filters.status : true))
      .filter((task) => (filters.query ? task.title.toLowerCase().includes(filters.query.toLowerCase()) : true))
      .filter((task) => (filters.contestId ? task.deadline?.contestId === filters.contestId || task.contestId === filters.contestId : true))
      .filter((task) => (filters.schoolId ? task.deadline?.schoolId === filters.schoolId || task.schoolId === filters.schoolId : true))
      .filter((task) => {
        if (!filters.start && !filters.end) return true;
        const due = task.deadline?.dueAt ? new Date(task.deadline.dueAt) : null;
        if (!due) return false;
        if (filters.start && due < new Date(filters.start)) return false;
        if (filters.end && due > new Date(filters.end)) return false;
        return true;
      })
      .sort((a, b) => {
        const dateA = a.deadline?.dueAt ? new Date(a.deadline.dueAt).getTime() : Infinity;
        const dateB = b.deadline?.dueAt ? new Date(b.deadline.dueAt).getTime() : Infinity;
        return dateA - dateB;
      });
  }, [filters.contestId, filters.end, filters.query, filters.schoolId, filters.start, filters.status, tasks]);

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    if (!token) return;
    setUpdatingTaskId(taskId);
    try {
      await updateTaskStatus(token, taskId, status);
      await refreshSession();
    } catch (err) {
      setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Mise à jour impossible.' });
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleSync = async (candidatureId: string) => {
    if (!token) return;
    setIsSyncing(candidatureId);
    try {
      await syncCandidatureDeadlines(token, candidatureId);
      await refreshSession();
      setBanner({ tone: 'success', message: 'Synchronisation terminée.' });
    } catch (err) {
      setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Erreur de synchronisation.' });
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

  const clearFilters = () => {
    setFilters({ contestId: '', schoolId: '', status: '', query: '', start: '', end: '' });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  return (
    <Protected>
      <div className="app-content">
        <PageHeader
          badge="Échéances"
          title="Toutes les dates à ne pas manquer"
          description="Filtre par concours, école, statut et fenêtre temporelle."
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
                    label="Concours"
                    name="contest"
                    icon={<Building2 size={18} />}
                    value={filters.contestId}
                    onChange={(e) => setFilters({ ...filters, contestId: e.target.value, schoolId: '' })}
                    options={[{ value: '', label: 'Tous' }, ...contests.map((c) => ({ value: c.id, label: `${c.name} ${c.year}` }))]}
                  />
                  <Select
                    label="École"
                    name="school"
                    value={filters.schoolId}
                    onChange={(e) => setFilters({ ...filters, schoolId: e.target.value })}
                    options={[{ value: '', label: 'Toutes' }, ...schools.map((s) => ({ value: s.id, label: s.name }))]}
                    disabled={!filters.contestId || isLoadingCatalog}
                  />
                  <Select
                    label="Statut"
                    name="status"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    options={[
                      { value: '', label: 'Tous' },
                      { value: 'todo', label: 'À faire' },
                      { value: 'doing', label: 'En cours' },
                      { value: 'done', label: 'Terminé' },
                    ]}
                  />
                  <Input
                    label="Recherche"
                    name="query"
                    placeholder="Titre de tâche..."
                    icon={<Search size={18} />}
                    value={filters.query}
                    onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  />
                </div>
                <div className="grid grid-2" style={{ marginTop: 'var(--space-4)' }}>
                  <Input
                    label="À partir du"
                    type="date"
                    name="start-date"
                    value={filters.start}
                    onChange={(e) => setFilters({ ...filters, start: e.target.value })}
                  />
                  <Input
                    label="Jusqu'au"
                    type="date"
                    name="end-date"
                    value={filters.end}
                    onChange={(e) => setFilters({ ...filters, end: e.target.value })}
                  />
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Sync */}
        {candidatures.length > 0 && (
          <div className="flex flex-wrap gap-2" style={{ marginBottom: 'var(--space-6)' }}>
            <span className="text-sm text-muted" style={{ alignSelf: 'center' }}>Synchroniser :</span>
            {candidatures.slice(0, 4).map((cand) => (
              <Button
                key={cand.id}
                variant="secondary"
                size="sm"
                loading={isSyncing === cand.id}
                onClick={() => handleSync(cand.id)}
                iconLeft={<RefreshCw size={14} />}
              >
                {cand.contest.name}
              </Button>
            ))}
          </div>
        )}

        {/* Tasks List */}
        <Card
          title="Mes tâches"
          description={`${filteredTasks.length} tâche${filteredTasks.length !== 1 ? 's' : ''} trouvée${filteredTasks.length !== 1 ? 's' : ''}`}
          icon={<Calendar size={20} />}
        >
          {filteredTasks.length === 0 ? (
            <EmptyState
              title="Aucune tâche pour ces filtres"
              description={hasActiveFilters ? 'Essaie de modifier ou réinitialiser les filtres.' : 'Synchronise tes candidatures pour importer les échéances.'}
              action={
                hasActiveFilters ? (
                  <Button variant="secondary" onClick={clearFilters}>
                    Réinitialiser les filtres
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="list">
              {filteredTasks.map((task) => {
                const daysUntil = task.deadline?.dueAt ? getDaysUntil(task.deadline.dueAt) : null;
                const isUrgent = daysUntil !== null && daysUntil <= 7 && daysUntil >= 0;
                const isPast = daysUntil !== null && daysUntil < 0;

                return (
                  <motion.div key={task.id} variants={item} className="list-item">
                    <div className="list-item-content">
                      <div className="list-item-title">{task.title}</div>
                      <div className="list-item-subtitle">
                        {task.contestName} {task.contestYear}
                        {task.schoolName ? ` · ${task.schoolName}` : ''}
                        {task.diplomaName ? ` · ${task.diplomaName}` : ''}
                      </div>
                      {task.deadline?.dueAt && (
                        <div className="flex items-center gap-2 text-sm" style={{ marginTop: 'var(--space-1)' }}>
                          <Clock size={14} className="text-muted" />
                          <span className={isPast ? 'text-danger' : isUrgent ? 'text-warning' : 'text-muted'}>
                            {new Date(task.deadline.dueAt).toLocaleDateString('fr-FR', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                            {daysUntil !== null && (
                              <span style={{ marginLeft: 'var(--space-2)' }}>
                                {isPast
                                  ? `(${Math.abs(daysUntil)} jour${Math.abs(daysUntil) > 1 ? 's' : ''} passé${Math.abs(daysUntil) > 1 ? 's' : ''})`
                                  : daysUntil === 0
                                    ? "(Aujourd'hui)"
                                    : daysUntil === 1
                                      ? '(Demain)'
                                      : `(J-${daysUntil})`}
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="list-item-actions">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        disabled={updatingTaskId === task.id}
                        aria-label={`Statut ${task.title}`}
                        style={{ minWidth: 100 }}
                      >
                        <option value="todo">À faire</option>
                        <option value="doing">En cours</option>
                        <option value="done">Terminé</option>
                      </select>
                      <StatusPill status={task.status} showLabel={false} />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </Card>

        {/* Official Deadlines */}
        <Card
          title="Deadlines officielles"
          description="Référence des dates publiées (lecture seule)"
          icon={<Calendar size={20} />}
          style={{ marginTop: 'var(--space-6)' }}
        >
          {filters.contestId === '' && officialDeadlines.length === 0 ? (
            <p className="text-muted">Choisis un concours pour afficher ses échéances.</p>
          ) : officialDeadlines.length === 0 ? (
            <EmptyState title="Aucune échéance" description="Aucune deadline trouvée pour ces filtres." />
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="list">
              {officialDeadlines.slice(0, 10).map((dl) => (
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
