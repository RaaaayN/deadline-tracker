import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, TextInput, Button, FlatList, View, StyleSheet } from 'react-native';

type Contest = { id: string; name: string; year: number };
type Deadline = { id: string; title: string; type: string; dueAt: string };

const API_URL = 'http://localhost:4000';

async function apiFetch<T>(path: string, options?: { token?: string; body?: unknown; method?: string }) {
  const res = await fetch(`${API_URL}${path}`, {
    method: options?.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return (await res.json()) as T;
}

export default function App() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [contestId, setContestId] = useState('');
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [token, setToken] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Contest[]>('/catalog/contests')
      .then(setContests)
      .catch((err) => setMessage(err.message));
  }, []);

  useEffect(() => {
    if (!contestId) return;
    apiFetch<Deadline[]>(`/catalog/deadlines?contestId=${contestId}`)
      .then(setDeadlines)
      .catch((err) => setMessage(err.message));
  }, [contestId]);

  const createReminder = async (deadlineId: string) => {
    if (!token) {
      setMessage('Renseigne un token JWT depuis /auth/login.');
      return;
    }
    try {
      const sendAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await apiFetch('/reminders', {
        method: 'POST',
        token,
        body: { deadlineId, channel: 'email', sendAt },
      });
      setMessage('Rappel créé (email).');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>DossierTracker Mobile</Text>
      <TextInput
        placeholder="Token JWT"
        value={token}
        onChangeText={setToken}
        style={styles.input}
        autoCapitalize="none"
      />
      <Text style={styles.subtitle}>Concours</Text>
      <FlatList
        data={contests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text
            style={[styles.card, contestId === item.id && styles.selected]}
            onPress={() => setContestId(item.id)}
          >
            {item.name} ({item.year})
          </Text>
        )}
      />

      <Text style={styles.subtitle}>Échéances</Text>
      <FlatList
        data={deadlines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={{ fontWeight: '600' }}>{item.title}</Text>
            <Text>{new Date(item.dueAt).toLocaleString()}</Text>
            <Button title="Rappel email J-1" onPress={() => createReminder(item.id)} />
          </View>
        )}
      />
      {message && <Text style={styles.message}>{message}</Text>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  subtitle: { marginTop: 12, marginBottom: 8, fontSize: 16, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', padding: 8, borderRadius: 6, marginBottom: 12 },
  card: { padding: 12, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 6, marginBottom: 8 },
  selected: { backgroundColor: '#e2e8f0' },
  message: { marginTop: 12, color: '#0f172a' },
});

