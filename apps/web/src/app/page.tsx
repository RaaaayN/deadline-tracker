"use client";

import React, { useEffect, useMemo, useState } from 'react';

import {
  createCandidature,
  fetchCandidatures,
  fetchContests,
  fetchDeadlines,
  fetchMe,
  fetchSchools,
  login,
  signup,
  syncCandidatureDeadlines,
  updateProfile,
  updateTaskStatus,
} from '../lib/api';

type Contest = { id: string; name: string; year: number };
type School = { id: string; name: string; contestId: string };
type Deadline = { id: string; title: string; type: string; dueAt: string; schoolId?: string };
type User = { id: string; email: string; firstName: string; lastName: string; role: string };
type Task = { id: string; title: string; status: 'todo' | 'doing' | 'done'; suggestion?: string };
type BannerTone = 'info' | 'success' | 'error';
type BannerState = { message: string; tone: BannerTone };

const TOKEN_KEY = 'dossiertracker_token';
const TASK_STATUSES: Array<Task['status']> = ['todo', 'doing', 'done'];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(value));

function Banner({ banner }: { banner: BannerState | null }) {
  if (!banner) {
    return null;
  }
  return (
    <div className={`banner ${banner.tone}`} role="status" aria-live="polite">
      {banner.message}
    </div>
  );
}

function Pill({ status }: { status: Task['status'] }) {
  return <span className={`pill ${status}`}>{status}</span>;
}

export default function HomePage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [contestId, setContestId] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [candidatures, setCandidatures] = useState<
    { id: string; contest: { name: string; year: number }; school?: { name: string }; tasks: Task[] }[]
  >([]);
  const [banner, setBanner] = useState<BannerState | null>(null);

  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [isDeadlinesLoading, setIsDeadlinesLoading] = useState(false);
  const [authAction, setAuthAction] = useState<'login' | 'signup' | null>(null);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupFirst, setSignupFirst] = useState('');
  const [signupLast, setSignupLast] = useState('');
  const [profileFirst, setProfileFirst] = useState('');
  const [profileLast, setProfileLast] = useState('');

  useEffect(() => {
    setIsCatalogLoading(true);
    fetchContests()
      .then(setContests)
      .catch((err) => setBanner({ tone: 'error', message: err.message }))
      .finally(() => setIsCatalogLoading(false));
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null;
    if (saved) {
      setToken(saved);
    }
  }, []);

  useEffect(() => {
    if (!contestId) {
      setSchools([]);
      setDeadlines([]);
      return;
    }
    setIsDeadlinesLoading(true);
    Promise.all([fetchSchools(contestId), fetchDeadlines(contestId, schoolId)])
      .then(([nextSchools, nextDeadlines]) => {
        setSchools(nextSchools);
        setDeadlines(nextDeadlines);
      })
      .catch((err) => setBanner({ tone: 'error', message: err.message }))
      .finally(() => setIsDeadlinesLoading(false));
  }, [contestId, schoolId]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setCandidatures([]);
      return;
    }
    fetchMe(token)
      .then((currentUser) => {
        setUser(currentUser);
        setProfileFirst(currentUser.firstName);
        setProfileLast(currentUser.lastName);
      })
      .catch((err) => setBanner({ tone: 'error', message: err.message }));
    fetchCandidatures(token)
      .then(setCandidatures)
      .catch((err) => setBanner({ tone: 'error', message: err.message }));
  }, [token]);

  const selectedContest = useMemo(
    () => contests.find((contest) => contest.id === contestId),
    [contestId, contests],
  );

  const saveToken = (jwt: string) => {
    setToken(jwt);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TOKEN_KEY, jwt);
    }
  };

  const handleSignup = async () => {
    setBanner(null);
    setAuthAction('signup');
    try {
      const res = await signup({
        email: signupEmail,
        password: signupPassword,
        firstName: signupFirst,
        lastName: signupLast,
      });
      saveToken(res.accessToken);
      setBanner({ tone: 'success', message: 'Compte créé. Bienvenue !' });
    } catch (err) {
      setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Erreur signup' });
    } finally {
      setAuthAction(null);
    }
  };

  const handleLogin = async () => {
    setBanner(null);
    setAuthAction('login');
    try {
      const res = await login({ email: loginEmail, password: loginPassword });
      saveToken(res.accessToken);
      setBanner({ tone: 'success', message: 'Connexion réussie.' });
    } catch (err) {
      setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Erreur login' });
    } finally {
      setAuthAction(null);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setCandidatures([]);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  };

  const handleUpdateProfile = async () => {
    if (!token) return;
    setIsProfileSaving(true);
    try {
      const updated = await updateProfile(token, { firstName: profileFirst, lastName: profileLast });
      setUser(updated);
      setBanner({ tone: 'success', message: 'Profil mis à jour.' });
    } catch (err) {
      setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Erreur profil' });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleCreate = async () => {
    setBanner(null);
    if (!token) {
      setBanner({ tone: 'error', message: 'Connecte-toi d’abord pour créer une candidature.' });
      return;
    }
    if (!contestId) {
      setBanner({ tone: 'error', message: 'Choisis un concours avant de créer.' });
      return;
    }
    setIsCreating(true);
    try {
      await createCandidature(token, { contestId, schoolId: schoolId || undefined });
      const list = await fetchCandidatures(token);
      setCandidatures(list);
      setBanner({ tone: 'success', message: 'Candidature créée et checklist importée.' });
    } catch (err) {
      setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Erreur inconnue' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSync = async (id: string) => {
    if (!token) return;
    setSyncingId(id);
    try {
      const res = await syncCandidatureDeadlines(token, id);
      setBanner({ tone: 'success', message: `Synchronisation terminée : ${res.created} tâches ajoutées.` });
      const list = await fetchCandidatures(token);
      setCandidatures(list);
    } catch (err) {
      setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Erreur sync' });
    } finally {
      setSyncingId(null);
    }
  };

  const handleTaskStatusChange = async (taskId: string, status: Task['status']) => {
    if (!token) return;
    setUpdatingTaskId(taskId);
    try {
      await updateTaskStatus(token, taskId, status);
      const list = await fetchCandidatures(token);
      setCandidatures(list);
      setBanner({ tone: 'success', message: 'Statut mis à jour.' });
    } catch (err) {
      setBanner({ tone: 'error', message: err instanceof Error ? err.message : 'Erreur statut tâche' });
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <main className="app-shell">
      <section className="card hero stack">
        <div className="card-header">
          <div className="stack">
            <span className="badge">Dashboard clair</span>
            <div className="stack-sm">
              <h1 className="section-title">DossierTracker</h1>
              <p className="muted">
                Centralise tes échéances AST, gère tes candidatures et coche ta checklist sans friction.
              </p>
            </div>
            <div className="controls">
              <button className="btn btn-primary" type="button" onClick={() => setBanner(null)}>
                Commencer maintenant
              </button>
              <span className="subtle">Mode clair, sections nettes, actions guidées.</span>
            </div>
          </div>
          <div className="stack-sm" style={{ minWidth: 220 }}>
            <span className="badge">Concours {selectedContest?.year ?? 'AST'}</span>
            <p className="muted">
              Vue unifiée des échéances officielles, filtres par école et progression par statut.
            </p>
          </div>
        </div>
      </section>

      <Banner banner={banner} />

      {!user ? (
        <section className="grid-2">
          <div className="card stack">
            <div className="card-header">
              <div>
                <h2 className="section-title">Créer un compte</h2>
                <p className="muted">On prépare ton espace dès la validation.</p>
              </div>
            </div>
            <div className="controls">
              <div className="field">
                <label htmlFor="signup-first">Prénom</label>
                <input
                  id="signup-first"
                  placeholder="Prénom"
                  value={signupFirst}
                  onChange={(e) => setSignupFirst(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="signup-last">Nom</label>
                <input
                  id="signup-last"
                  placeholder="Nom"
                  value={signupLast}
                  onChange={(e) => setSignupLast(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  placeholder="Email"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="signup-password">Mot de passe</label>
                <input
                  id="signup-password"
                  placeholder="Mot de passe"
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" type="button" onClick={handleSignup} disabled={authAction === 'signup'}>
                {authAction === 'signup' ? 'Création...' : 'S’inscrire'}
              </button>
            </div>
          </div>
          <div className="card stack">
            <div className="card-header">
              <div>
                <h2 className="section-title">Se connecter</h2>
                <p className="muted">Reprends ta checklist là où tu l’as laissée.</p>
              </div>
            </div>
            <div className="controls">
              <div className="field">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  placeholder="Email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="login-password">Mot de passe</label>
                <input
                  id="login-password"
                  placeholder="Mot de passe"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <button className="btn btn-secondary" type="button" onClick={handleLogin} disabled={authAction === 'login'}>
                {authAction === 'login' ? 'Connexion...' : 'Connexion'}
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="card stack">
          <div className="card-header">
            <div>
              <h2 className="section-title">Mon compte</h2>
              <p className="muted">
                {user.email} · rôle : {user.role}
              </p>
            </div>
            <button className="btn btn-ghost" type="button" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
          <div className="controls" style={{ maxWidth: 420 }}>
            <div className="field">
              <label htmlFor="profile-first">Prénom</label>
              <input
                id="profile-first"
                value={profileFirst}
                onChange={(e) => setProfileFirst(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="profile-last">Nom</label>
              <input
                id="profile-last"
                value={profileLast}
                onChange={(e) => setProfileLast(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" type="button" onClick={handleUpdateProfile} disabled={isProfileSaving}>
              {isProfileSaving ? 'Enregistrement...' : 'Mettre à jour le profil'}
            </button>
          </div>
        </section>
      )}

      <section className="card stack">
        <div className="card-header">
          <div>
            <h2 className="section-title">Échéances officielles</h2>
            <p className="muted">Filtre par concours et école pour garder l’essentiel.</p>
          </div>
          {selectedContest && <span className="badge">{selectedContest.name} · {selectedContest.year}</span>}
        </div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="contest-select">Concours</label>
            <select
              id="contest-select"
              value={contestId}
              onChange={(e) => {
                setContestId(e.target.value);
                setSchoolId('');
              }}
              disabled={isCatalogLoading}
            >
              <option value="">Choisis un concours</option>
              {contests.map((contest) => (
                <option key={contest.id} value={contest.id}>
                  {contest.name} ({contest.year})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="school-select">École (optionnel)</label>
            <select
              id="school-select"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              disabled={!contestId || isDeadlinesLoading}
            >
              <option value="">Toutes</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="timeline">
          {isDeadlinesLoading && <p className="muted">Chargement des échéances...</p>}
          {!isDeadlinesLoading && deadlines.length === 0 && (
            <p className="muted">Aucune échéance pour ces filtres. Sélectionne un concours pour commencer.</p>
          )}
          {deadlines.map((deadline) => (
            <div key={deadline.id} className="timeline-item">
              <div className="card-header">
                <div className="stack-sm">
                  <strong>{deadline.title}</strong>
                  <span className="muted">{formatDate(deadline.dueAt)}</span>
                </div>
                <span className="badge">{deadline.type}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card stack">
        <div className="card-header">
          <div>
            <h2 className="section-title">Créer une candidature</h2>
            <p className="muted">On ajoute la checklist liée automatiquement.</p>
          </div>
        </div>
        <div className="controls">
          <button className="btn btn-primary" type="button" onClick={handleCreate} disabled={isCreating}>
            {isCreating ? 'Ajout en cours...' : 'Ajouter à ma checklist'}
          </button>
          {!token && <p className="muted">Connecte-toi pour créer une candidature.</p>}
          {token && !contestId && <p className="muted">Choisis un concours pour activer le bouton.</p>}
        </div>
      </section>

      {user && (
        <section className="card stack">
          <div className="card-header">
            <div>
              <h2 className="section-title">Mes candidatures & checklist</h2>
              <p className="muted">Synchronise les échéances et coche chaque étape.</p>
            </div>
          </div>
          {candidatures.length === 0 && <p className="muted">Aucune candidature pour le moment.</p>}
          <div className="stack">
            {candidatures.map((cand) => (
              <div key={cand.id} className="card stack" style={{ boxShadow: 'none', borderColor: '#e2e8f0' }}>
                <div className="card-header">
                  <div className="stack-sm">
                    <strong>
                      {cand.contest.name} {cand.contest.year}
                    </strong>
                    {cand.school && <span className="muted">{cand.school.name}</span>}
                  </div>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => handleSync(cand.id)}
                    disabled={syncingId === cand.id}
                  >
                    {syncingId === cand.id ? 'Synchronisation...' : 'Resynchroniser les échéances'}
                  </button>
                </div>
                <div className="table">
                  {cand.tasks.map((task) => (
                    <div key={task.id} className="table-row">
                      <div className="stack-sm">
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <Pill status={task.status} />
                          <span>{task.title}</span>
                        </div>
                        {task.suggestion && <span className="subtle">{task.suggestion}</span>}
                      </div>
                      <select
                        value={task.status}
                        onChange={(e) => handleTaskStatusChange(task.id, e.target.value as Task['status'])}
                        disabled={updatingTaskId === task.id}
                      >
                        {TASK_STATUSES.map((statusOption) => (
                          <option key={statusOption} value={statusOption}>
                            {statusOption}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  {cand.tasks.length === 0 && <span className="subtle">Aucune tâche encore.</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

