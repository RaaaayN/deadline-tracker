"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { fetchContests, fetchDeadlines, fetchSchools, createCandidature } from '../lib/api';

type Contest = { id: string; name: string; year: number };
type School = { id: string; name: string; contestId: string };
type Deadline = { id: string; title: string; type: string; dueAt: string; schoolId?: string };

export default function HomePage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [contestId, setContestId] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchContests().then(setContests).catch((err) => setStatus(err.message));
  }, []);

  useEffect(() => {
    if (!contestId) return;
    fetchSchools(contestId).then(setSchools).catch((err) => setStatus(err.message));
    fetchDeadlines(contestId, schoolId).then(setDeadlines).catch((err) => setStatus(err.message));
  }, [contestId, schoolId]);

  const selectedContest = useMemo(
    () => contests.find((c) => c.id === contestId),
    [contestId, contests],
  );

  const handleCreate = async () => {
    if (!token) {
      setStatus('Ajoute un token JWT via /auth/login pour créer une candidature.');
      return;
    }
    if (!contestId) {
      setStatus('Choisis un concours.');
      return;
    }
    try {
      await createCandidature(token, { contestId, schoolId: schoolId || undefined });
      setStatus('Candidature créée. Rafraîchis la liste sur l’app mobile ou via API.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  return (
    <main style={{ padding: '32px', maxWidth: '960px', margin: '0 auto' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '8px' }}>DossierTracker</h1>
        <p>Centralise tes échéances AST, configure des rappels et suis ta checklist.</p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4 }}>Concours</label>
          <select
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
          <label style={{ display: 'block', marginBottom: 4 }}>École (optionnel)</label>
          <select
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
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Échéances officielles</h3>
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
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Créer une candidature</h3>
        <div style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
          <input
            placeholder="Token JWT (depuis /auth/login)"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            style={{ padding: 8 }}
          />
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
          {status && <p style={{ color: '#0f172a' }}>{status}</p>}
        </div>
      </section>
    </main>
  );
}

