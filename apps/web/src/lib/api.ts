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

type AuthPayload = { email: string; password: string; firstName?: string; lastName?: string };

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

export function login(payload: AuthPayload) {
  return apiFetch<{ accessToken: string; userId: string; role: string }>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export function signup(payload: AuthPayload & { firstName: string; lastName: string }) {
  return apiFetch<{ accessToken: string; userId: string; role: string }>('/auth/signup', {
    method: 'POST',
    body: payload,
  });
}

export function fetchMe(token: string) {
  return apiFetch<{ id: string; email: string; firstName: string; lastName: string; role: string; createdAt: string }>(
    '/auth/me',
    { token },
  );
}

export function updateProfile(token: string, payload: { firstName?: string; lastName?: string }) {
  return apiFetch<{ id: string; email: string; firstName: string; lastName: string; role: string; createdAt: string }>(
    '/auth/me',
    { method: 'PATCH', body: payload, token },
  );
}

export function fetchCandidatures(token: string) {
  return apiFetch<
    {
      id: string;
      contest: { name: string; year: number };
      school?: { name: string };
      tasks: { id: string; title: string; status: string }[];
    }[]
  >('/candidatures', { token });
}

export function syncCandidatureDeadlines(token: string, candidatureId: string) {
  return apiFetch<{ created: number }>(`/candidatures/${candidatureId}/sync-deadlines`, {
    method: 'POST',
    token,
  });
}

