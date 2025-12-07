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

export enum ProgramType {
  Bachelor = 'bachelor',
  Master = 'master',
  Msc = 'msc',
  Mba = 'mba',
  Emba = 'emba',
  SpecializedMsc = 'specialized_msc',
  ExecutiveMaster = 'executive_master',
  Certificate = 'certificate',
  Phd = 'phd',
  Other = 'other',
}

export enum ProgramFormat {
  FullTime = 'full_time',
  PartTime = 'part_time',
  Online = 'online',
  Hybrid = 'hybrid',
}

export enum TestType {
  Gmat = 'gmat',
  TageMage = 'tage_mage',
  Gre = 'gre',
  Toeic = 'toeic',
  Toefl = 'toefl',
  Ielts = 'ielts',
  Sat = 'sat',
  Other = 'other',
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
  programId?: string;
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
  description?: string;
  examFormat?: string;
  feesCents?: number;
  currency?: string;
  registrationUrl?: string;
  languages: string[];
  examLocations: string[];
  durationMinutes?: number;
  scoreScale?: string;
  maxAttempts?: number;
  testRequirements?: ContestTestRequirement[];
  deadlines?: Deadline[];
}

export interface ContestTestRequirement {
  id: string;
  test: TestType;
  minimumScore?: number;
  recommendedScore?: number;
  weightPercent?: number;
  validityMonths?: number;
  sections: string[];
  notes?: string;
  registrationUrl?: string;
}

export interface School {
  id: string;
  name: string;
  contestId: string;
  description?: string;
  website?: string;
  city?: string;
  country?: string;
  campuses?: string[];
  contactEmail?: string;
  contactPhone?: string;
  tuitionCents?: number;
  currency?: string;
  leaderboardEntries?: LeaderboardEntry[];
  programs?: Program[];
}

export interface Candidature {
  id: string;
  userId: string;
  contestId: string;
  schoolId?: string;
  programId?: string;
  diplomaName?: string;
  sessionLabel: string;
  type: CandidatureType;
  status: 'draft' | 'submitted';
}

export interface Leaderboard {
  id: string;
  slug: string;
  name: string;
  source: string;
  category?: string;
  region?: string;
  year: number;
  url?: string;
  description?: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  score?: number;
  notes?: string;
  schoolId?: string;
  programId?: string;
  leaderboardId: string;
  school?: School;
  program?: Program;
  leaderboard?: Leaderboard;
}

export interface ProgramCourse {
  id: string;
  title: string;
  category?: string;
  description?: string;
}

export interface ProgramCareer {
  id: string;
  title: string;
  description?: string;
}

export interface Program {
  id: string;
  slug: string;
  name: string;
  type: ProgramType;
  domain: string;
  description?: string;
  objectives?: string;
  outcomes: string[];
  durationMonths?: number;
  ects?: number;
  format: ProgramFormat;
  campuses: string[];
  languages: string[];
  startPeriods: string[];
  tuitionCents?: number;
  applicationFeeCents?: number;
  currency: string;
  financing?: string;
  admissionPrerequisites: string[];
  admissionTests: string[];
  admissionDocuments: string[];
  admissionProcess?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  schoolId: string;
  contestId?: string;
  school?: School;
  contest?: Contest;
  courses?: ProgramCourse[];
  careers?: ProgramCareer[];
  leaderboardEntries?: LeaderboardEntry[];
  deadlines?: Deadline[];
}

