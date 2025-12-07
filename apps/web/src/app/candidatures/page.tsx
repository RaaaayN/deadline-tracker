"use client";

import { CandidatureType, type Contest, type Deadline, type TaskStatus } from '@dossiertracker/shared';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban,
  GraduationCap,
  FileText,
  RefreshCw,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { Protected } from '../../components/Protected';
import { Banner } from '../../components/ui/Banner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Select } from '../../components/ui/Select';
import { StatusPill } from '../../components/ui/StatusPill';
import {
  createCandidature,
  deleteCandidature,
  fetchContests,
  fetchDeadlines,
  fetchSchools,
  syncCandidatureDeadlines,
  updateTaskStatus,
} from '../../lib/api';
import { useAuth } from '../providers/AuthProvider';

const TYPE_OPTIONS: { value: CandidatureType; label: string; icon: React.ElementType; helper: string }[] = [
  {
    value: CandidatureType.Concours,
    label: 'Concours',
    icon: FileText,
    helper: 'Tests/examens (GMAT, TOEIC, TAGE MAGE)',
  },
  {
    value: CandidatureType.Diplome,
    label: 'Dépôt de dossier',
    icon: GraduationCap,
    helper: 'Candidature à un diplôme spécifique',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

/**
 * Candidatures management page with creation form and list.
 */
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
  const [expandedCandidatures, setExpandedCandidatures] = useState<Set<string>>(new Set());

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
            setOfficialDeadlines((prev) => ({ ...prev, [schoolId]: deadlines.map((d) => d.sessionLabel ?? '') }));
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
        setOfficialDeadlines((prev) => ({ ...prev, [creationContestId]: deadlines.map((d) => d.sessionLabel ?? '') }));
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
    // intentionally ignore creationSession to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creationContestId, creationType]);

  useEffect(() => {
    if (creationType === CandidatureType.Diplome && contests.length > 0 && !creationContestId) {
      setCreationContestId(contests.find((c) => c.name.toLowerCase().includes('masters'))?.id || contests[0].id);
    }
    if (creationType === CandidatureType.Concours && contests.length > 0 && !creationContestId) {
      setCreationContestId(contests[0].id);
    }
  }, [contests, creationContestId, creationType]);

  useEffect(() => {
    if (creationType !== CandidatureType.Diplome) return;
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
    // intentionally ignore creationSession to avoid selection loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creationDiploma, creationSchoolId, creationType, schoolDeadlines]);

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
      setBanner({ tone: 'success', message: 'Candidature créée avec succès !' });
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
    } catch (err) {
      setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Mise à jour impossible.' });
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedCandidatures((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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
      <div className="app-content">
        <PageHeader
          badge="Candidatures"
          title="Gère tes dossiers"
          description="Distingue concours (GMAT, TOEIC, TAGE MAGE) et dépôts de dossier (MSc, MiM, MBA)."
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

        {/* Creation Form */}
        <Card
          title="Nouvelle candidature"
          description="Choisis le type, le concours et le diplôme ciblé."
          icon={<Plus size={20} />}
          className="stack-lg"
        >
          {/* Type Selection */}
          <div className="grid grid-2">
            {TYPE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = creationType === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    setCreationType(opt.value);
                    setCreationContestId('');
                    setCreationSchoolId('');
                    setCreationDiploma('');
                    setCreationSession('');
                    setDiplomas([]);
                    setAvailableSessions([]);
                  }}
                  style={{
                    padding: 'var(--space-4)',
                    background: isSelected ? 'var(--primary-soft)' : 'var(--surface-muted)',
                    border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-3)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--primary)' : 'var(--surface)',
                      color: isSelected ? 'white' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: isSelected ? 'var(--primary)' : 'var(--text)' }}>
                      {opt.label}
                    </div>
                    <div className="text-sm text-muted">{opt.helper}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Form Fields */}
          <div className="grid grid-3">
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
                  onChange={(e) => setCreationSchoolId(e.target.value)}
                  options={[{ value: '', label: 'Choisir une école' }, ...schools.map((s) => ({ value: s.id, label: s.name }))]}
                  disabled={!creationContestId}
                />
                <Select
                  label="Diplôme"
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

          <Button
            type="button"
            onClick={handleCreate}
            loading={isCreating}
            disabled={
              creationType === CandidatureType.Concours
                ? !creationContestId || !creationSession
                : !creationContestId || !creationSchoolId || !creationDiploma || !creationSession
            }
            iconLeft={<Plus size={18} />}
          >
            Créer la candidature
          </Button>
        </Card>

        {/* Candidatures List */}
        <Card
          title="Mes candidatures"
          description="Gère le type, le diplôme et synchronise les échéances officielles."
          icon={<FolderKanban size={20} />}
        >
          {candidatures.length === 0 ? (
            <EmptyState title="Aucune candidature" description="Crée une candidature pour commencer à suivre tes dossiers." />
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="stack-lg">
              {[CandidatureType.Concours, CandidatureType.Diplome].map((type) => {
                const typeCandidatures = candidaturesByType[type];
                if (typeCandidatures.length === 0) return null;

                return (
                  <div key={type} className="stack-md">
                    <h3 className="flex items-center gap-2" style={{ fontSize: 'var(--text-lg)' }}>
                      {type === CandidatureType.Concours ? <FileText size={20} /> : <GraduationCap size={20} />}
                      {type === CandidatureType.Concours ? 'Concours' : 'Dépôt de dossier'}
                      <span className="badge">{typeCandidatures.length}</span>
                    </h3>

                    <div className="list">
                      {typeCandidatures.map((cand) => {
                        const isExpanded = expandedCandidatures.has(cand.id);
                        const completedTasks = cand.tasks.filter((t) => t.status === 'done').length;
                        const progress = cand.tasks.length > 0 ? Math.round((completedTasks / cand.tasks.length) * 100) : 0;

                        return (
                          <motion.div key={cand.id} variants={item} className="card card-nested">
                            <div
                              role="button"
                              tabIndex={0}
                              className="flex items-center justify-between"
                              style={{ cursor: 'pointer' }}
                              onClick={() => toggleExpanded(cand.id)}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleExpanded(cand.id); }}
                            >
                              <div className="stack-xs" style={{ flex: 1 }}>
                                <div className="flex items-center gap-2">
                                  <span className="badge primary">
                                    {cand.type === CandidatureType.Concours ? 'Concours' : 'Diplôme'}
                                  </span>
                                  <strong>
                                    {cand.contest.name} {cand.contest.year}
                                  </strong>
                                </div>
                                <div className="text-sm text-muted">
                                  {cand.school?.name || 'Sans école'} · {cand.tasks.length} tâches · {progress}% terminé
                                </div>
                                {/* Progress bar */}
                                <div
                                  style={{
                                    height: 4,
                                    background: 'var(--border)',
                                    borderRadius: 'var(--radius-full)',
                                    overflow: 'hidden',
                                    maxWidth: 200,
                                  }}
                                >
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5 }}
                                    style={{
                                      height: '100%',
                                      background: 'var(--success)',
                                      borderRadius: 'var(--radius-full)',
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  loading={isSyncing === cand.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSync(cand.id);
                                  }}
                                  iconLeft={<RefreshCw size={14} />}
                                >
                                  Sync
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpanded(cand.id);
                                  }}
                                >
                                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </Button>
                              </div>
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  style={{ overflow: 'hidden', marginTop: 'var(--space-4)' }}
                                >
                                  {cand.tasks.length === 0 ? (
                                    <EmptyState
                                      title="Aucune tâche"
                                      description="Synchronise pour récupérer les deadlines officielles."
                                    />
                                  ) : (
                                    <div className="list">
                                      {cand.tasks.map((task) => (
                                        <div key={task.id} className="list-item">
                                          <div className="list-item-content">
                                            <div className="list-item-title">{task.title}</div>
                                            {task.deadline?.dueAt && (
                                              <div className="list-item-subtitle">
                                                Échéance : {new Date(task.deadline.dueAt).toLocaleDateString('fr-FR')}
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
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  <div className="flex gap-2" style={{ marginTop: 'var(--space-4)' }}>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => handleDelete(cand.id)}
                                      iconLeft={<Trash2 size={14} />}
                                    >
                                      Supprimer
                                    </Button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </Card>
      </div>
    </Protected>
  );
}
