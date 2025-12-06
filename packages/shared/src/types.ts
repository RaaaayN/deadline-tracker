export enum UserRole {
  Student = 'student',
  Parent = 'parent',
  Mentor = 'mentor',
  CampusAdmin = 'campus_admin',
  SuperAdmin = 'super_admin',
}

export enum TaskStatus {
  Todo = 'todo',
  Doing = 'doing',
  Done = 'done',
}

export enum ReminderChannel {
  Email = 'email',
  Sms = 'sms',
  Push = 'push',
}

export enum ReminderStatus {
  Pending = 'pending',
  Sent = 'sent',
  Error = 'error',
}

export enum CandidatureType {
  Concours = 'concours',
  Diplome = 'diplome',
}

export enum DeadlineType {
  Registration = 'registration',
  Test = 'test',
  Oral = 'oral',
  Result = 'result',
  Other = 'other',
}

export interface Deadline {
  id: string;
  title: string;
  type: DeadlineType;
  dueAt: string;
  sessionLabel: string;
  contestId: string;
  schoolId?: string;
  diplomaName?: string;
  createdByAdmin: boolean;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  deadlineId?: string;
  candidatureId: string;
  tips?: string;
  suggestion?: string;
}

export interface TaskSuggestion {
  taskId: string;
  suggestion: string;
}

export interface Reminder {
  id: string;
  deadlineId: string;
  channel: ReminderChannel;
  sendAt: string;
  userId: string;
  status: ReminderStatus;
  sentAt?: string;
  lastError?: string;
}

export interface Contest {
  id: string;
  name: string;
  year: number;
  url?: string;
}

export interface School {
  id: string;
  name: string;
  contestId: string;
}

export interface Candidature {
  id: string;
  userId: string;
  contestId: string;
  schoolId?: string;
  diplomaName?: string;
  sessionLabel: string;
  type: CandidatureType;
  status: 'draft' | 'submitted';
}

