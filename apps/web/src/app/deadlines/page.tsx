"use client";

import { CandidatureType } from '@dossiertracker/shared';
import type { Contest, Deadline, School, TaskStatus } from '@dossiertracker/shared';
import React, { useEffect, useMemo, useState } from 'react';

import { Protected } from '../../components/Protected';
import { Banner } from '../../components/ui/Banner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusPill } from '../../components/ui/StatusPill';
import {
  createCandidature,
  deleteCandidature,
  deleteTask,
  fetchContests,
  fetchDeadlines,
  fetchSchools,
  syncCandidatureDeadlines,
  updateCandidature,
  updateTaskStatus,
} from '../../lib/api';
import { useAuth } from '../providers/AuthProvider';

type GroupedCandidatures = Record<
  string,
  Record<
    string,
    {
      id: string;
      contest: Contest & { year: number };
      school?: { id?: string; name: string };
      diplomaName?: string;
      tasks: {
        id: string;
        title: string;
        status: TaskStatus;
        deadline?: Deadline;
        suggestion?: string;
      }[];
    }[]
  >
>;

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
  const [isCreating, setIsCreating] = useState(false);
  const [newDiploma, setNewDiploma] = useState('');
  const [editDiploma, setEditDiploma] = useState<Record<string, string>>({});
  const [creationContestId, setCreationContestId] = useState('');
  const [creationSchoolId, setCreationSchoolId] = useState('');

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

  useEffect(() => {
    setCreationContestId(filters.contestId);
    setCreationSchoolId(filters.schoolId);
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
      });
  }, [filters.contestId, filters.end, filters.query, filters.schoolId, filters.start, filters.status, tasks]);

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
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

  const handleCreateCandidature = async () => {
    if (!token || !creationContestId) {
      setBanner({ tone: 'error', message: 'Choisis un concours pour créer une candidature.' });
      return;
    }
    setIsCreating(true);
    try {
      await createCandidature(token, {
        contestId: creationContestId,
        type: CandidatureType.Concours,
        diplomaName: newDiploma || undefined,
      });
      await refreshSession();
      setBanner({ tone: 'success', message: 'Candidature créée.' });
      setNewDiploma('');
      setCreationSchoolId('');
    } catch (err) {
      setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Création impossible.' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateCandidature = async (candidatureId: string) => {
    if (!token) return;
    try {
      await updateCandidature(token, candidatureId, {
        diplomaName: editDiploma[candidatureId] ?? undefined,
      });
      await refreshSession();
      setBanner({ tone: 'success', message: 'Candidature mise à jour.' });
    } catch (err) {
      setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Mise à jour impossible.' });
    }
  };

  const handleDeleteCandidature = async (candidatureId: string) => {
    if (!token) return;
    try {
      await deleteCandidature(token, candidatureId);
      await refreshSession();
      setBanner({ tone: 'success', message: 'Candidature supprimée.' });
    } catch (err) {
      setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Suppression impossible.' });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!token) return;
    try {
      await deleteTask(token, taskId);
      await refreshSession();
      setBanner({ tone: 'success', message: 'Tâche supprimée.' });
    } catch (err) {
      setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Suppression impossible.' });
    }
  };

  const grouped: GroupedCandidatures = useMemo(() => {
    return candidatures.reduce<GroupedCandidatures>((acc, cand) => {
      const schoolLabel = cand.school?.name ?? 'Sans école';
      const diplomaLabel = cand.diplomaName ?? 'Sans diplôme';
      if (!acc[schoolLabel]) {
        acc[schoolLabel] = {};
      }
      if (!acc[schoolLabel][diplomaLabel]) {
        acc[schoolLabel][diplomaLabel] = [];
      }
      acc[schoolLabel][diplomaLabel].push(cand);
      return acc;
    }, {});
  }, [candidatures]);

  return (
    <Protected>
      <main className="app-shell">
        <section className="card hero stack">
          <div className="stack">
            <span className="badge">Échéances</span>
            <h1 className="section-title">Toutes les dates à ne pas manquer</h1>
            <p className="muted">Filtre par concours, école, statut et fenêtre temporelle.</p>
          </div>
        </section>

        {banner ? <Banner message={banner.message} tone={banner.tone} ariaLive="assertive" /> : null}

        <Card title="Créer une candidature" description="Associe concours, école et diplôme pour suivre les tâches.">
          <div className="grid-4">
            <Select
              label="Concours"
              name="creation-contest"
              value={creationContestId}
              onChange={(e) => {
                setCreationContestId(e.target.value);
                setFilters({ ...filters, contestId: e.target.value });
              }}
              options={[{ value: '', label: 'Choisir' }, ...contests.map((c) => ({ value: c.id, label: `${c.name} ${c.year}` }))]}
            />
            <Select
              label="École"
              name="creation-school"
              value=""
              onChange={() => {}}
              options={[{ value: '', label: 'Non applicable pour un concours' }]}
              disabled
            />
            <Input
              label="Diplôme / Master"
              name="creation-diploma"
              placeholder="ex: MIM, MSc Finance"
              value={newDiploma}
              onChange={(e) => setNewDiploma(e.target.value)}
            />
            <div className="grid-full">
              <Button type="button" onClick={handleCreateCandidature} loading={isCreating} disabled={!creationContestId}>
                Créer la candidature
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Filtres" description="Affiner les tâches liées aux deadlines importées.">
          <div className="grid-4">
            <Select
              label="Concours"
              name="contest"
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
              placeholder="Titre de tâche"
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            />
          </div>
          <div className="grid-4">
            <Input
              label="À partir du"
              type="date"
              name="start-date"
              value={filters.start}
              onChange={(e) => setFilters({ ...filters, start: e.target.value })}
            />
            <Input
              label="Jusqu’au"
              type="date"
              name="end-date"
              value={filters.end}
              onChange={(e) => setFilters({ ...filters, end: e.target.value })}
            />
          </div>
        </Card>

        <Card title="Candidatures par école / diplôme" description="Visualise et gère chaque candidature et ses tâches.">
          {candidatures.length === 0 ? (
            <EmptyState title="Aucune candidature" description="Crée une candidature pour commencer." />
          ) : (
            <div className="stack">
              {Object.entries(grouped).map(([schoolLabel, diplomas]) => (
                <div key={schoolLabel} className="card card-nested stack">
                  <h3 className="section-title">{schoolLabel}</h3>
                  <div className="stack">
                    {Object.entries(diplomas).map(([diplomaLabel, cands]) => (
                      <div key={`${schoolLabel}-${diplomaLabel}`} className="card card-nested stack">
                        <div className="card-header">
                          <div className="stack-sm">
                            <strong>Diplôme : {diplomaLabel}</strong>
                            <p className="muted">{cands.length} candidature(s)</p>
                          </div>
                        </div>
                        <div className="stack">
                          {cands.map((cand) => (
                            <div key={cand.id} className="card card-nested stack">
                              <div className="card-header">
                                <div className="stack-sm">
                                  <strong>
                                    {cand.contest.name} {cand.contest.year}
                                  </strong>
                                  <Input
                                    label="Diplôme"
                                    name={`diploma-${cand.id}`}
                                    value={editDiploma[cand.id] ?? cand.diplomaName ?? ''}
                                    onChange={(e) =>
                                      setEditDiploma((prev) => ({
                                        ...prev,
                                        [cand.id]: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                                <div className="card-actions">
                                  <Button variant="secondary" type="button" loading={isSyncing === cand.id} onClick={() => handleSync(cand.id)}>
                                    Synchroniser
                                  </Button>
                                  <Button variant="ghost" type="button" onClick={() => handleUpdateCandidature(cand.id)}>
                                    Enregistrer
                                  </Button>
                                  <Button variant="danger" type="button" onClick={() => handleDeleteCandidature(cand.id)}>
                                    Supprimer
                                  </Button>
                                </div>
                              </div>
                              {cand.tasks.length === 0 ? (
                                <EmptyState title="Aucune tâche" description="Synchronise pour importer les deadlines." />
                              ) : (
                                <div className="list">
                                  {cand.tasks.map((task) => (
                                    <div key={task.id} className="list-row">
                                      <div className="stack-sm">
                                        <span>{task.title}</span>
                                        {task.deadline?.dueAt ? (
                                          <p className="subtle">
                                            Échéance : {new Date(task.deadline.dueAt).toLocaleDateString('fr-FR')}
                                          </p>
                                        ) : null}
                                        {task.suggestion ? <p className="subtle">{task.suggestion}</p> : null}
                                      </div>
                                      <div className="list-right">
                                        <select
                                          value={task.status}
                                          onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                                          disabled={updatingTaskId === task.id}
                                          aria-label={`Statut ${task.title}`}
                                        >
                                          <option value="todo">todo</option>
                                          <option value="doing">doing</option>
                                          <option value="done">done</option>
                                        </select>
                                        <StatusPill status={task.status} />
                                        <Button variant="ghost" type="button" onClick={() => handleDeleteTask(task.id)}>
                                          Supprimer
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          title="Tâches liées aux deadlines"
          description="Mets à jour les statuts et synchronise si besoin."
          actions={
            candidatures.length > 0 ? (
              <div className="stack-sm">
                {candidatures.map((cand) => (
                  <Button
                    key={cand.id}
                    variant="secondary"
                    type="button"
                    loading={isSyncing === cand.id}
                    onClick={() => handleSync(cand.id)}
                  >
                    Sync {cand.contest.name}
                  </Button>
                ))}
              </div>
            ) : null
          }
        >
          {filteredTasks.length === 0 ? (
            <EmptyState
              title="Aucune tâche pour ces filtres"
              description="Vérifie que la synchronisation est faite ou change les filtres."
            />
          ) : (
            <div className="list">
              {filteredTasks.map((task) => (
                <div key={task.id} className="list-row">
                  <div className="stack-sm">
                    <strong>{task.title}</strong>
                    <p className="muted">
                      {task.contestName} {task.contestYear}
                      {task.schoolName ? ` · ${task.schoolName}` : ''}
                    </p>
                    {task.deadline?.dueAt ? (
                      <p className="subtle">Échéance : {new Date(task.deadline.dueAt).toLocaleDateString('fr-FR')}</p>
                    ) : null}
                  </div>
                  <div className="list-right">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      disabled={updatingTaskId === task.id}
                      aria-label={`Statut ${task.title}`}
                    >
                      <option value="todo">todo</option>
                      <option value="doing">doing</option>
                      <option value="done">done</option>
                    </select>
                    <StatusPill status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Deadlines officielles" description="Référence des dates publiées (lecture seule).">
          {filters.contestId === '' && officialDeadlines.length === 0 ? (
            <p className="muted">Choisis un concours pour afficher ses échéances.</p>
          ) : officialDeadlines.length === 0 ? (
            <EmptyState title="Aucune échéance" description="Aucune deadline trouvée pour ces filtres." />
          ) : (
            <div className="list">
              {officialDeadlines.map((dl) => (
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
