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

const TOKEN_KEY = 'dossiertracker_token';
const TASK_STATUSES: Array<Task['status']> = ['todo', 'doing', 'done'];

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
  const [status, setStatus] = useState<string | null>(null);

  // Auth forms
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupFirst, setSignupFirst] = useState('');
  const [signupLast, setSignupLast] = useState('');
  const [profileFirst, setProfileFirst] = useState('');
  const [profileLast, setProfileLast] = useState('');

  useEffect(() => {
    fetchContests().then(setContests).catch((err) => setStatus(err.message));
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null;
    if (saved) {
      setToken(saved);
    }
  }, []);

  useEffect(() => {
    if (!contestId) return;
    fetchSchools(contestId).then(setSchools).catch((err) => setStatus(err.message));
    fetchDeadlines(contestId, schoolId).then(setDeadlines).catch((err) => setStatus(err.message));
  }, [contestId, schoolId]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setCandidatures([]);
      return;
    }
    fetchMe(token)
      .then((u) => {
        setUser(u);
        setProfileFirst(u.firstName);
        setProfileLast(u.lastName);
      })
      .catch((err) => setStatus(err.message));
    fetchCandidatures(token)
      .then(setCandidatures)
      .catch((err) => setStatus(err.message));
  }, [token]);

  const selectedContest = useMemo(
    () => contests.find((c) => c.id === contestId),
    [contestId, contests],
  );

  const saveToken = (jwt: string) => {
    setToken(jwt);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TOKEN_KEY, jwt);
    }
  };

  const handleSignup = async () => {
    setStatus(null);
    try {
      const res = await signup({
        email: signupEmail,
        password: signupPassword,
        firstName: signupFirst,
        lastName: signupLast,
      });
      saveToken(res.accessToken);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Erreur signup');
    }
  };

  const handleLogin = async () => {
    setStatus(null);
    try {
      const res = await login({ email: loginEmail, password: loginPassword });
      saveToken(res.accessToken);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Erreur login');
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
    try {
      const updated = await updateProfile(token, { firstName: profileFirst, lastName: profileLast });
      setUser(updated);
      setStatus('Profil mis à jour.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Erreur profil');
    }
  };

  const handleCreate = async () => {
    if (!token) {
      setStatus('Connecte-toi d’abord pour créer une candidature.');
      return;
    }
    if (!contestId) {
      setStatus('Choisis un concours.');
      return;
    }
    try {
      await createCandidature(token, { contestId, schoolId: schoolId || undefined });
      const list = await fetchCandidatures(token);
      setCandidatures(list);
      setStatus('Candidature créée et checklist importée.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const handleSync = async (id: string) => {
    if (!token) return;
    try {
      const res = await syncCandidatureDeadlines(token, id);
      setStatus(`Synchronisation terminée : ${res.created} tâches ajoutées.`);
      const list = await fetchCandidatures(token);
      setCandidatures(list);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Erreur sync');
    }
  };

  const handleTaskStatusChange = async (taskId: string, status: Task['status']) => {
    if (!token) return;
    try {
      await updateTaskStatus(token, taskId, status);
      const list = await fetchCandidatures(token);
      setCandidatures(list);
      setStatus('Statut mis à jour.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Erreur statut tâche');
    }
  };

  return (
    <main style={{ padding: '32px', maxWidth: '1080px', margin: '0 auto', display: 'grid', gap: 24 }}>
      <header>
        <h1 style={{ marginBottom: 8 }}>DossierTracker</h1>
        <p>Centralise tes échéances AST, gère ton compte, tes candidatures et ta checklist.</p>
      </header>

      {!user && (
        <section style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ border: '1px solid #e2e8f0', padding: 16, borderRadius: 8 }}>
            <h3>Créer un compte</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              <input placeholder="Prénom" value={signupFirst} onChange={(e) => setSignupFirst(e.target.value)} />
              <input placeholder="Nom" value={signupLast} onChange={(e) => setSignupLast(e.target.value)} />
              <input placeholder="Email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
              <input
                placeholder="Mot de passe"
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
              />
              <button onClick={handleSignup} style={{ padding: 10, background: '#0f172a', color: 'white' }}>
                S’inscrire
              </button>
            </div>
          </div>
          <div style={{ border: '1px solid #e2e8f0', padding: 16, borderRadius: 8 }}>
            <h3>Se connecter</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              <input placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
              <input
                placeholder="Mot de passe"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <button onClick={handleLogin} style={{ padding: 10, background: '#0f172a', color: 'white' }}>
                Connexion
              </button>
            </div>
          </div>
        </section>
      )}

      {user && (
        <section style={{ border: '1px solid #e2e8f0', padding: 16, borderRadius: 8, display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Mon compte</h3>
              <p style={{ margin: 0 }}>{user.email} · rôle : {user.role}</p>
            </div>
            <button onClick={handleLogout} style={{ padding: '8px 12px' }}>
              Déconnexion
            </button>
          </div>
          <div style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
            <label htmlFor="profile-first">Prénom</label>
            <input
              id="profile-first"
              value={profileFirst}
              onChange={(e) => setProfileFirst(e.target.value)}
            />
            <label htmlFor="profile-last">Nom</label>
            <input
              id="profile-last"
              value={profileLast}
              onChange={(e) => setProfileLast(e.target.value)}
            />
            <button onClick={handleUpdateProfile} style={{ padding: 10, background: '#0f172a', color: 'white' }}>
              Mettre à jour le profil
            </button>
          </div>
        </section>
      )}

      <section style={{ border: '1px solid #e2e8f0', padding: 16, borderRadius: 8, display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }} htmlFor="contest-select">
              Concours
            </label>
            <select
              id="contest-select"
              value={contestId}
              onChange={(e) => setContestId(e.target.value)}
              style={{ width: '100%', padding: 8 }}
            >
              <option value="">Choisis un concours</option>
              {contests.map((contest) => (
                <option key={contest.id} value={contest.id}>
                  {contest.name} ({contest.year})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }} htmlFor="school-select">
              École (optionnel)
            </label>
            <select
              id="school-select"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              style={{ width: '100%', padding: 8 }}
              disabled={!contestId}
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

        <div>
          <h4>Échéances officielles</h4>
          {selectedContest ? (
            <p>
              {selectedContest.name} · {selectedContest.year}
            </p>
          ) : (
            <p>Sélectionne un concours pour voir les échéances.</p>
          )}
          <div style={{ display: 'grid', gap: 8 }}>
            {deadlines.map((deadline) => (
              <div
                key={deadline.id}
                style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6 }}
              >
                <div style={{ fontWeight: 600 }}>{deadline.title}</div>
                <div style={{ color: '#555' }}>{new Date(deadline.dueAt).toLocaleString()}</div>
                <div style={{ fontSize: 12 }}>Type: {deadline.type}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4>Créer une candidature</h4>
          <button
            type="button"
            onClick={handleCreate}
            style={{
              padding: '10px 12px',
              background: '#0f172a',
              color: 'white',
              border: 'none',
              borderRadius: 6,
            }}
          >
            Ajouter à ma checklist
          </button>
          {!token && <p style={{ color: '#c026d3' }}>Connecte-toi pour créer une candidature.</p>}
        </div>
      </section>

      {user && (
        <section style={{ border: '1px solid #e2e8f0', padding: 16, borderRadius: 8, display: 'grid', gap: 12 }}>
          <h3>Mes candidatures & checklist</h3>
          {candidatures.length === 0 && <p>Aucune candidature pour le moment.</p>}
          <div style={{ display: 'grid', gap: 12 }}>
            {candidatures.map((cand) => (
              <div key={cand.id} style={{ border: '1px solid #e2e8f0', padding: 12, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>
                      {cand.contest.name} {cand.contest.year}
                    </strong>
                    {cand.school && <span> · {cand.school.name}</span>}
                  </div>
                  <button onClick={() => handleSync(cand.id)} style={{ padding: '6px 10px' }}>
                    Resynchroniser les échéances
                  </button>
                </div>
                <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
                  {cand.tasks.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 180px',
                        alignItems: 'center',
                        gap: 8,
                        border: '1px solid #e2e8f0',
                        padding: 8,
                        borderRadius: 6,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{t.title}</div>
                        {t.suggestion && (
                          <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{t.suggestion}</div>
                        )}
                      </div>
                      <select
                        value={t.status}
                        onChange={(e) => handleTaskStatusChange(t.id, e.target.value as Task['status'])}
                        style={{ padding: 8, borderRadius: 6 }}
                      >
                        {TASK_STATUSES.map((statusOption) => (
                          <option key={statusOption} value={statusOption}>
                            {statusOption}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  {cand.tasks.length === 0 && <span style={{ color: '#475569' }}>Aucune tâche encore.</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {status && <p style={{ color: '#0f172a' }}>{status}</p>}
    </main>
  );
}

