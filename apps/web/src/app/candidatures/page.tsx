"use client";

import { CandidatureType, type Contest, type TaskStatus } from '@dossiertracker/shared';
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
  fetchContests,
  fetchDeadlines,
  fetchSchools,
  syncCandidatureDeadlines,
  updateCandidature,
  updateTaskStatus,
} from '../../lib/api';
import { useAuth } from '../providers/AuthProvider';

type EditState = {
  diploma: Record<string, string>;
  type: Record<string, CandidatureType>;
};

const TYPE_OPTIONS: { value: CandidatureType; label: string; helper: string }[] = [
  {
    value: CandidatureType.Concours,
    label: 'Concours',
    helper: 'Liste des tests/examens (GMAT, TOEIC, TAGE MAGE).',
  },
  {
    value: CandidatureType.Diplome,
    label: 'Dépôt de dossier (diplôme)',
    helper: 'Choix d’un diplôme précis, filtrable par école.',
  },
];

export default function CandidaturesPage() {
  const { token, candidatures, refreshSession } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [diplomas, setDiplomas] = useState<string[]>([]);
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  const [schoolDeadlines, setSchoolDeadlines] = useState<Record<string, Deadline[]>>({});
  const [creationType, setCreationType] = useState<CandidatureType>(CandidatureType.Concours);
  const [officialDeadlines, setOfficialDeadlines] = useState<Record<string, string[]>>({});
  const [creationContestId, setCreationContestId] = useState('');
  const [creationSchoolId, setCreationSchoolId] = useState('');
  const [creationDiploma, setCreationDiploma] = useState('');
  const [creationSession, setCreationSession] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ tone: 'info' | 'success' | 'error'; message: string } | null>(null);
  const [editState, setEditState] = useState<EditState>({ diploma: {}, type: {} });

  useEffect(() => {
    fetchContests()
      .then(setContests)
      .catch((err) => setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Erreur catalogue' }));
  }, []);

  useEffect(() => {
    if (!creationContestId) {
      setSchools([]);
      setDiplomas([]);
      setCreationSchoolId('');
      return;
    }
    const loadSchoolsAndDiplomas = async () => {
      try {
        if (creationType === CandidatureType.Diplome) {
          const fetchedSchools = await fetchSchools(creationContestId);
          setSchools(fetchedSchools);
          if (creationSchoolId || fetchedSchools[0]?.id) {
            const schoolId = creationSchoolId || fetchedSchools[0]?.id || '';
            setCreationSchoolId(schoolId);
            const deadlines = await fetchDeadlines(creationContestId, schoolId);
            setSchoolDeadlines((prev) => ({ ...prev, [schoolId]: deadlines }));
            const uniqDiplomas = Array.from(
              new Set((deadlines ?? []).map((dl) => dl.diplomaName).filter((d): d is string => Boolean(d))),
            );
            setOfficialDeadlines((prev) => ({ ...prev, [schoolId]: deadlines.map((d) => d.sessionLabel) }));
            setDiplomas(uniqDiplomas);
            const filteredByDiploma =
              creationDiploma && creationDiploma.trim().length > 0
                ? deadlines.filter((d) => d.diplomaName === creationDiploma)
                : deadlines;
            const uniqSessions = Array.from(
              new Set(filteredByDiploma.map((d) => d.sessionLabel).filter((s): s is string => Boolean(s))),
            );
            setAvailableSessions(uniqSessions);
            if (!creationSession && uniqSessions[0]) {
              setCreationSession(uniqSessions[0]);
            } else if (creationSession && !uniqSessions.includes(creationSession)) {
              setCreationSession(uniqSessions[0] ?? '');
            }
          } else {
            setDiplomas([]);
            setCreationSession('');
            setAvailableSessions([]);
          }
        } else {
          setSchools([]);
          setDiplomas([]);
          setCreationSession('');
          setAvailableSessions([]);
        }
      } catch (err) {
        setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Erreur écoles/diplômes' });
      }
    };
    void loadSchoolsAndDiplomas();
  }, [creationContestId, creationSchoolId, creationType]);

  useEffect(() => {
    const loadContestSessions = async () => {
      if (creationType !== CandidatureType.Concours || !creationContestId) {
        setCreationSession('');
        return;
      }
      try {
        const deadlines = await fetchDeadlines(creationContestId);
        const uniqSessions = Array.from(new Set(deadlines.map((d) => d.sessionLabel).filter((s): s is string => Boolean(s))));
        setOfficialDeadlines((prev) => ({ ...prev, [creationContestId]: deadlines.map((d) => d.sessionLabel) }));
        if (!creationSession && uniqSessions[0]) {
          setCreationSession(uniqSessions[0]);
        } else if (creationSession && !uniqSessions.includes(creationSession)) {
          setCreationSession(uniqSessions[0] ?? '');
        }
      } catch (err) {
        setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Erreur sessions concours' });
      }
    };
    void loadContestSessions();
  }, [creationContestId, creationType, creationSession]);

  useEffect(() => {
    if (creationType === CandidatureType.Diplome && contests.length > 0 && !creationContestId) {
      setCreationContestId(contests.find((c) => c.name.toLowerCase().includes('masters'))?.id || contests[0].id);
    }
    if (creationType === CandidatureType.Concours && contests.length > 0 && !creationContestId) {
      setCreationContestId(contests[0].id);
    }
  }, [contests, creationContestId, creationType]);

  useEffect(() => {
    if (creationType !== CandidatureType.Diplome) {
      return;
    }
    if (!creationSchoolId) {
      setAvailableSessions([]);
      return;
    }
    const deadlines = schoolDeadlines[creationSchoolId];
    if (!deadlines) {
      setAvailableSessions([]);
      return;
    }
    const filteredByDiploma =
      creationDiploma && creationDiploma.trim().length > 0
        ? deadlines.filter((d) => d.diplomaName === creationDiploma)
        : deadlines;
    const uniqSessions = Array.from(
      new Set(filteredByDiploma.map((d) => d.sessionLabel).filter((s): s is string => Boolean(s))),
    );
    setAvailableSessions(uniqSessions);
    if (!creationSession && uniqSessions[0]) {
      setCreationSession(uniqSessions[0]);
    } else if (creationSession && !uniqSessions.includes(creationSession)) {
      setCreationSession(uniqSessions[0] ?? '');
    }
  }, [creationDiploma, creationSchoolId, creationSession, creationType, schoolDeadlines]);

  const handleCreate = async () => {
    if (!token) {
      setBanner({ tone: 'error', message: 'Authentification requise.' });
      return;
    }
    if (creationType === CandidatureType.Concours && !creationContestId) {
      setBanner({ tone: 'error', message: 'Choisis un concours.' });
      return;
    }
    const requiresSchool = creationType === CandidatureType.Diplome;
    if (requiresSchool && !creationSchoolId) {
      setBanner({ tone: 'error', message: 'Sélectionne une école pour ce diplôme.' });
      return;
    }
    if (requiresSchool && !creationDiploma.trim()) {
      setBanner({ tone: 'error', message: 'Choisis un diplôme.' });
      return;
    }
    if (!creationSession.trim()) {
      setBanner({ tone: 'error', message: 'Choisis une session.' });
      return;
    }

    setIsCreating(true);
    try {
      await createCandidature(token, {
        contestId: creationContestId,
        type: creationType,
        schoolId: requiresSchool ? creationSchoolId : undefined,
        diplomaName: requiresSchool ? creationDiploma.trim() : undefined,
        sessionLabel: creationSession.trim(),
      });
      await refreshSession();
      setBanner({ tone: 'success', message: 'Candidature créée.' });
      setCreationDiploma('');
      if (requiresSchool) {
        setCreationSchoolId('');
      }
      setCreationSession('');
    } catch (err) {
      setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Création impossible.' });
    } finally {
      setIsCreating(false);
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

  const handleUpdate = async (candidatureId: string) => {
    if (!token) return;
    const nextDiploma = editState.diploma[candidatureId];
    const nextType = editState.type[candidatureId];

    try {
      await updateCandidature(token, candidatureId, {
        diplomaName: nextDiploma?.trim(),
        type: nextType,
      });
      await refreshSession();
      setBanner({ tone: 'success', message: 'Candidature mise à jour.' });
    } catch (err) {
      setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Mise à jour impossible.' });
    }
  };

  const handleDelete = async (candidatureId: string) => {
    if (!token) return;
    try {
      await deleteCandidature(token, candidatureId);
      await refreshSession();
      setBanner({ tone: 'success', message: 'Candidature supprimée.' });
    } catch (err) {
      setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Suppression impossible.' });
    }
  };

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

  const candidaturesByType = useMemo(() => {
    return candidatures.reduce<Record<CandidatureType, typeof candidatures>>(
      (acc, cand) => {
        acc[cand.type] = acc[cand.type] ?? [];
        acc[cand.type].push(cand);
        return acc;
      },
      {
        [CandidatureType.Concours]: [],
        [CandidatureType.Diplome]: [],
      },
    );
  }, [candidatures]);

  const contestOptions = useMemo(() => {
    const examKeywords = ['gmat', 'toeic', 'tage mage'];
    if (creationType === CandidatureType.Concours) {
      const exams = contests.filter((c) => examKeywords.some((k) => c.name.toLowerCase().includes(k)));
      return exams.length > 0 ? exams : contests;
    }
    const nonExams = contests.filter((c) => !examKeywords.some((k) => c.name.toLowerCase().includes(k)));
    return nonExams.length > 0 ? nonExams : contests;
  }, [contests, creationType]);

  return (
    <Protected>
      <main className="app-shell">
        <section className="card hero stack">
          <div className="stack">
            <span className="badge">Candidatures</span>
            <h1 className="section-title">Distingue concours et dépôts de dossier</h1>
            <p className="muted">Concours (tests GMAT/TOEIC/TAGE MAGE) vs dossiers diplôme (MSc, MiM, MBA...).</p>
          </div>
        </section>

        {banner ? <Banner message={banner.message} tone={banner.tone} ariaLive="assertive" /> : null}

        <Card title="Créer une candidature" description="Choisis le type, le concours et le diplôme ciblé.">
          <div className="stack-sm">
            <div className="grid-2">
              {TYPE_OPTIONS.map((opt) => (
                <label key={opt.value} className={`card card-nested ${creationType === opt.value ? 'active' : ''}`}>
                  <div className="stack-sm">
                    <div className="flex space-between">
                      <span className="strong">{opt.label}</span>
                      <input
                        type="radio"
                        name="creation-type"
                        value={opt.value}
                        checked={creationType === opt.value}
                        onChange={() => {
                          setCreationType(opt.value);
                          setCreationContestId('');
                          setCreationSchoolId('');
                          setCreationDiploma('');
                          setCreationSession('');
                          setDiplomas([]);
                          setAvailableSessions([]);
                        }}
                      />
                    </div>
                    <p className="muted">{opt.helper}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="grid-3">
            {creationType === CandidatureType.Concours ? (
              <>
                <Select
                  label="Concours"
                  name="creation-contest"
                  value={creationContestId}
                  onChange={(e) => setCreationContestId(e.target.value)}
                  options={[{ value: '', label: 'Choisir' }, ...contestOptions.map((c) => ({ value: c.id, label: `${c.name} ${c.year}` }))]}
                />
                <Select
                  label="Session"
                  name="creation-session"
                  value={creationSession}
                  onChange={(e) => setCreationSession(e.target.value)}
                  options={[
                    { value: '', label: 'Choisir une session' },
                    ...Array.from(new Set((officialDeadlines[creationContestId] ?? []).filter(Boolean))).map((s) => ({
                      value: s,
                      label: s,
                    })),
                  ]}
                  disabled={!creationContestId}
                />
              </>
            ) : (
              <>
                <Select
                  label="École"
                  name="creation-school"
                  value={creationSchoolId}
                  onChange={(e) => {
                    setCreationSchoolId(e.target.value);
                  }}
                  options={[{ value: '', label: 'Choisir une école' }, ...schools.map((s) => ({ value: s.id, label: s.name }))]}
                  disabled={!creationContestId}
                />
                <Select
                  label="Diplômes disponibles"
                  name="available-diploma"
                  value={creationDiploma}
                  onChange={(e) => setCreationDiploma(e.target.value)}
                  options={[{ value: '', label: 'Choisir' }, ...diplomas.map((d) => ({ value: d, label: d }))]}
                  disabled={diplomas.length === 0}
                />
                <Select
                  label="Session"
                  name="creation-session"
                  value={creationSession}
                  onChange={(e) => setCreationSession(e.target.value)}
                  options={[
                    { value: '', label: 'Choisir une session' },
                    ...availableSessions.map((s) => ({ value: s, label: s })),
                  ]}
                  disabled={creationSchoolId === '' || availableSessions.length === 0}
                />
              </>
            )}
          </div>
          <div className="grid-full">
            <Button
              type="button"
              onClick={handleCreate}
              loading={isCreating}
              disabled={
                creationType === CandidatureType.Concours
                  ? !creationContestId || !creationSession
                  : !creationContestId || !creationSchoolId || !creationDiploma || !creationSession
              }
            >
              Créer la candidature
            </Button>
          </div>
        </Card>

        <Card title="Mes candidatures" description="Gère le type, le diplôme et synchronise les échéances officielles.">
          {candidatures.length === 0 ? (
            <EmptyState title="Aucune candidature" description="Crée une candidature pour commencer." />
          ) : (
            <div className="stack">
              {[CandidatureType.Concours, CandidatureType.Diplome].map((type) => (
                <div key={type} className="stack">
                  <h3 className="section-title">{type === CandidatureType.Concours ? 'Concours' : 'Dépôt de dossier diplôme'}</h3>
                  {candidaturesByType[type].length === 0 ? (
                    <p className="muted">Aucune candidature de ce type.</p>
                  ) : (
                    <div className="stack">
                      {candidaturesByType[type].map((cand) => (
                        <div key={cand.id} className="card card-nested stack">
                          <div className="card-header">
                            <div className="stack-sm">
                              <div className="flex gap-2 items-center">
                                <span className="badge">{cand.type === CandidatureType.Concours ? 'Concours' : 'Diplôme'}</span>
                                <strong>
                                  {cand.contest.name} {cand.contest.year}
                                </strong>
                              </div>
                              {cand.type === CandidatureType.Diplome ? (
                                <Input
                                  label="Diplôme"
                                  name={`diploma-${cand.id}`}
                                  value={cand.diplomaName ?? ''}
                                  readOnly
                                />
                              ) : null}
                              <Select
                                label="Type"
                                name={`type-${cand.id}`}
                                value={cand.type}
                                disabled
                                options={[
                                  { value: CandidatureType.Concours, label: 'Concours (sans école)' },
                                  { value: CandidatureType.Diplome, label: 'Dépôt de dossier (diplôme)' },
                                ]}
                              />
                            </div>
                            <div className="card-actions">
                              <Button variant="secondary" type="button" loading={isSyncing === cand.id} onClick={() => handleSync(cand.id)}>
                                Synchroniser
                              </Button>
                              <Button variant="ghost" type="button" onClick={() => handleUpdate(cand.id)}>
                                Enregistrer
                              </Button>
                              <Button variant="danger" type="button" onClick={() => handleDelete(cand.id)}>
                                Supprimer
                              </Button>
                            </div>
                          </div>
                          {cand.tasks.length === 0 ? (
                            <EmptyState title="Aucune tâche" description="Synchronise pour importer les deadlines officielles." />
                          ) : (
                            <div className="list">
                              {cand.tasks.map((task) => (
                                <div key={task.id} className="list-row">
                                  <div className="stack-sm">
                                    <span>{task.title}</span>
                                    {task.deadline?.dueAt ? (
                                      <p className="subtle">Échéance : {new Date(task.deadline.dueAt).toLocaleDateString('fr-FR')}</p>
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
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </Protected>
  );
}


