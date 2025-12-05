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
  contestId: string;
  schoolId?: string;
  createdByAdmin: boolean;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  deadlineId?: string;
  candidatureId: string;
  tips?: string;
}

export interface Reminder {
  id: string;
  deadlineId: string;
  channel: ReminderChannel;
  sendAt: string;
  userId: string;
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
  status: 'draft' | 'submitted';
}

