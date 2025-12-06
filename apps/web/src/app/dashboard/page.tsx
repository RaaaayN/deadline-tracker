"use client";

import type { Deadline, TaskStatus } from '@dossiertracker/shared';
import React, { useEffect, useMemo, useState } from 'react';

import { Protected } from '../../components/Protected';
import { Banner } from '../../components/ui/Banner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Loading } from '../../components/ui/Loading';
import { StatCard } from '../../components/ui/StatCard';
import { StatusPill } from '../../components/ui/StatusPill';
import { fetchDeadlines, syncCandidatureDeadlines, updateTaskStatus } from '../../lib/api';
import { useAuth } from '../providers/AuthProvider';

const UPCOMING_WINDOW_DAYS = 30;

export default function DashboardPage() {
  const { token, user, candidatures, refreshSession } = useAuth();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [banner, setBanner] = useState<{ tone: 'info' | 'success' | 'error'; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
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

  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    if (!token) return;
    setUpdatingTaskId(taskId);
    try {
      await updateTaskStatus(token, taskId, status);
      await refreshSession();
      setBanner({ tone: 'success', message: 'Statut mis à jour.' });
    } catch (err) {
      setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Mise à jour impossible.' });
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <Protected>
      <main className="app-shell">
        <section className="card hero stack">
          <div className="stack">
            <span className="badge">Bienvenue {user?.firstName}</span>
            <h1 className="section-title">Tableau de bord</h1>
            <p className="muted">Vue rapide sur tes candidatures, tâches et prochaines échéances.</p>
          </div>
        </section>

        {banner ? <Banner message={banner.message} tone={banner.tone} ariaLive="assertive" /> : null}

        <section className="grid-3">
          <StatCard label="Tâches totales" value={stats.total} trend={`Todo ${stats.todo} · Doing ${stats.doing}`} />
          <StatCard label="Terminé" value={stats.done} trend="Bravo, continue !" />
          <StatCard label="À venir" value={stats.upcoming} trend="Dans les 30 prochains jours" />
        </section>

        <Card title="Prochaines échéances" description="Dates limites dans les 30 prochains jours.">
          {upcomingDeadlines.length === 0 ? (
            <EmptyState
              title="Aucune échéance imminente"
              description="Synchronise tes candidatures pour importer les deadlines officielles."
            />
          ) : (
            <div className="list">
              {upcomingDeadlines.map((task) => (
                <div key={task.id} className="list-row">
                  <div className="stack-sm">
                    <strong>{task.title}</strong>
                    <p className="muted">
                      {task.contestName} {task.contestYear}
                      {task.schoolName ? ` · ${task.schoolName}` : ''}
                    </p>
                  </div>
                  <div className="list-right">
                    <span className="muted">{new Date(task.dueAt).toLocaleDateString('fr-FR')}</span>
                    <StatusPill status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          title="Mes candidatures"
          description="Checklist par concours/école avec synchronisation des échéances officielles."
        >
          {candidatures.length === 0 ? (
            <EmptyState
              title="Aucune candidature pour l’instant"
              description="Crée une candidature depuis la page Échéances pour démarrer."
            />
          ) : (
            <div className="stack">
              {candidatures.map((cand) => (
                <div key={cand.id} className="card card-nested stack">
                  <div className="card-header">
                    <div className="stack-sm">
                      <strong>
                        {cand.contest.name} {cand.contest.year}
                        {cand.school ? ` · ${cand.school.name}` : ''}
                      </strong>
                      <p className="muted">{cand.tasks.length} tâches</p>
                    </div>
                    <Button
                      variant="secondary"
                      type="button"
                      loading={isSyncing === cand.id}
                      onClick={() => handleSync(cand.id)}
                    >
                      Synchroniser les échéances
                    </Button>
                  </div>
                  {cand.tasks.length === 0 ? (
                    <EmptyState title="Aucune tâche" description="Synchronise pour récupérer les deadlines." />
                  ) : (
                    <div className="list">
                      {cand.tasks.map((task) => (
                        <div key={task.id} className="list-row">
                          <div className="stack-sm">
                            <span>{task.title}</span>
                            {task.suggestion ? <p className="subtle">{task.suggestion}</p> : null}
                          </div>
                          <div className="list-right">
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateStatus(task.id, e.target.value as TaskStatus)}
                              disabled={updatingTaskId === task.id}
                              aria-label={`Statut ${task.title}`}
                            >
                              <option value="todo">todo</option>
                              <option value="doing">doing</option>
                              <option value="done">done</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Catalogue des deadlines" description="Vue synthétique des deadlines officielles (tous concours).">
          {isLoadingDeadlines ? (
            <Loading label="Chargement des deadlines..." />
          ) : deadlines.length === 0 ? (
            <EmptyState title="Aucune deadline" description="Ajoute des données via l’API ou Prisma seed." />
          ) : (
            <div className="list">
              {deadlines.slice(0, 8).map((dl) => (
                <div key={dl.id} className="list-row">
                  <div className="stack-sm">
                    <strong>{dl.title}</strong>
                    <p className="muted">{dl.type}</p>
                  </div>
                  <div className="list-right">
                    <span className="muted">{new Date(dl.dueAt).toLocaleDateString('fr-FR')}</span>
                    {dl.schoolId ? <span className="badge">École</span> : <span className="badge">Concours</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </Protected>
  );
}
