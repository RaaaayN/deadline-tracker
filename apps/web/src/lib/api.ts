import type {
  CandidatureType,
  Contest,
  Deadline,
  Leaderboard,
  LeaderboardEntry,
  Program,
  ProgramFormat,
  ProgramType,
  School,
  TaskStatus,
} from '@dossiertracker/shared';

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
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

export type ApiTask = {
  id: string;
  title: string;
  status: TaskStatus;
  suggestion?: string;
  deadlineId?: string;
  candidatureId?: string;
  deadline?: Deadline;
};

export type ApiCandidature = {
  id: string;
  contest: Contest & { year: number };
  school?: { id?: string; name: string };
  diplomaName?: string;
  sessionLabel: string;
  type: CandidatureType;
  tasks: ApiTask[];
};

export function fetchContests(filters?: { year?: number }) {
  const params = new URLSearchParams();
  if (filters?.year) params.set('year', filters.year.toString());
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<Contest[]>(`/catalog/contests${query}`);
}

export function fetchSchools(contestId: string) {
  const query = contestId ? `?contestId=${contestId}` : '';
  return apiFetch<School[]>(`/catalog/schools${query}`);
}

export function fetchDeadlines(contestId?: string, schoolId?: string, programId?: string) {
  const params = new URLSearchParams();
  if (contestId) params.append('contestId', contestId);
  if (schoolId) params.append('schoolId', schoolId);
  if (programId) params.append('programId', programId);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<Deadline[]>(`/catalog/deadlines${query}`);
}

export function fetchPrograms(filters?: { domain?: string; campus?: string; type?: ProgramType; format?: ProgramFormat }) {
  const params = new URLSearchParams();
  if (filters?.domain) params.set('domain', filters.domain);
  if (filters?.campus) params.set('campus', filters.campus);
  if (filters?.type) params.set('type', filters.type);
  if (filters?.format) params.set('format', filters.format);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<Program[]>(`/catalog/programs${query}`);
}

export function fetchProgram(slug: string) {
  return apiFetch<Program>(`/catalog/programs/${slug}`);
}

export function fetchLeaderboards() {
  return apiFetch<Leaderboard[]>('/catalog/leaderboards');
}

export function fetchLeaderboard(slug: string) {
  return apiFetch<Leaderboard & { entries: LeaderboardEntry[] }>(`/catalog/leaderboards/${slug}`);
}

export function createCandidature(
  token: string,
  payload: { contestId: string; type: CandidatureType; sessionLabel: string; schoolId?: string; diplomaName?: string },
) {
  return apiFetch('/candidatures', { method: 'POST', body: payload, token });
}

export function updateCandidature(
  token: string,
  candidatureId: string,
  payload: {
    contestId?: string;
    schoolId?: string;
    diplomaName?: string;
    sessionLabel?: string;
    status?: string;
    type?: CandidatureType;
  },
) {
  return apiFetch(`/candidatures/${candidatureId}`, { method: 'PATCH', body: payload, token });
}

export function deleteCandidature(token: string, candidatureId: string) {
  return apiFetch<{ deleted: true }>(`/candidatures/${candidatureId}`, { method: 'DELETE', token });
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
  return apiFetch<ApiCandidature[]>('/candidatures', { token });
}

export function syncCandidatureDeadlines(token: string, candidatureId: string) {
  return apiFetch<{ created: number }>(`/candidatures/${candidatureId}/sync-deadlines`, {
    method: 'POST',
    token,
  });
}

export function updateTaskStatus(token: string, taskId: string, status: TaskStatus) {
  return apiFetch(`/candidatures/tasks/${taskId}/status`, {
    method: 'PATCH',
    body: { status },
    token,
  });
}

export function deleteTask(token: string, taskId: string) {
  return apiFetch<{ deleted: true }>(`/candidatures/tasks/${taskId}`, { method: 'DELETE', token });
}

export function getGoogleAuthUrl(token: string) {
  return apiFetch<{ url: string }>('/google/oauth/url', { token });
}

export function exchangeGoogleCode(token: string, code: string) {
  return apiFetch<{ connected: true }>('/google/oauth/exchange', { method: 'POST', body: { code }, token });
}

export function purgeGoogleCalendar(token: string) {
  return apiFetch<{ deleted: number }>('/google/calendar/purge-dossiertracker', { method: 'POST', token });
}

export function fetchGoogleStatus(token: string) {
  return apiFetch<{ connected: boolean; scopes?: string[]; expiryDate?: string }>('/google/status', { token });
}

export function listInbox(token: string) {
  return apiFetch<{ id: string; snippet: string; subject?: string; from?: string; date?: string }[]>(
    '/google/gmail/messages',
    { token },
  );
}

export function createDraft(token: string, payload: { to: string; subject: string; text: string }) {
  return apiFetch<{ draftId: string }>('/google/gmail/drafts', { method: 'POST', body: payload, token });
}

