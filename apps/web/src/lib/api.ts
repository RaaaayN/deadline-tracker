type FetchOptions = {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
  token?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }
  return res.json() as Promise<T>;
}

export function fetchContests() {
  return apiFetch<{ id: string; name: string; year: number }[]>('/catalog/contests');
}

export function fetchSchools(contestId: string) {
  const query = contestId ? `?contestId=${contestId}` : '';
  return apiFetch<{ id: string; name: string; contestId: string }[]>(`/catalog/schools${query}`);
}

export function fetchDeadlines(contestId?: string, schoolId?: string) {
  const params = new URLSearchParams();
  if (contestId) params.append('contestId', contestId);
  if (schoolId) params.append('schoolId', schoolId);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<
    { id: string; title: string; type: string; dueAt: string; contestId: string; schoolId?: string }[]
  >(`/catalog/deadlines${query}`);
}

export function createCandidature(token: string, payload: { contestId: string; schoolId?: string }) {
  return apiFetch('/candidatures', { method: 'POST', body: payload, token });
}

