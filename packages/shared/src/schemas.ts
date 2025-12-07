import { z } from 'zod';

import {
  CandidatureType,
  DeadlineType,
  ProgramFormat,
  ProgramType,
  ReminderChannel,
  TaskStatus,
  TestType,
  UserRole,
} from './types';

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const deadlineSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  type: z.nativeEnum(DeadlineType),
  dueAt: z.string().datetime(),
  sessionLabel: z.string().min(1),
  contestId: z.string(),
  schoolId: z.string().optional(),
  programId: z.string().optional(),
  diplomaName: z.string().optional(),
  createdByAdmin: z.boolean(),
});

export const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  status: z.nativeEnum(TaskStatus),
  deadlineId: z.string().optional(),
  candidatureId: z.string(),
  tips: z.string().optional(),
});

export const reminderSchema = z.object({
  id: z.string(),
  deadlineId: z.string(),
  channel: z.nativeEnum(ReminderChannel),
  sendAt: z.string().datetime(),
  userId: z.string(),
  status: z.enum(['pending', 'sent', 'error']),
  sentAt: z.string().datetime().optional(),
  lastError: z.string().optional(),
});

export const candidatureSchema = z.object({
  id: z.string(),
  userId: z.string(),
  contestId: z.string(),
  schoolId: z.string().optional(),
  programId: z.string().optional(),
  diplomaName: z.string().optional(),
  sessionLabel: z.string().min(1),
  type: z.nativeEnum(CandidatureType),
  status: z.enum(['draft', 'submitted']),
});

export const leaderboardSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  source: z.string(),
  category: z.string().optional(),
  region: z.string().optional(),
  year: z.number().int(),
  url: z.string().url().optional(),
  description: z.string().optional(),
});

export const leaderboardEntrySchema = z.object({
  id: z.string(),
  rank: z.number().int(),
  score: z.number().optional(),
  notes: z.string().optional(),
  schoolId: z.string().optional(),
  programId: z.string().optional(),
  leaderboardId: z.string(),
  school: z
    .object({
      id: z.string(),
      name: z.string(),
      contestId: z.string(),
      city: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  program: z
    .object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      schoolId: z.string(),
    })
    .optional(),
  leaderboard: leaderboardSchema.optional(),
});

export const programCourseSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  category: z.string().optional(),
  description: z.string().optional(),
});

export const programCareerSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
});

export const programSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  type: z.nativeEnum(ProgramType),
  domain: z.string(),
  description: z.string().optional(),
  objectives: z.string().optional(),
  outcomes: z.array(z.string()),
  durationMonths: z.number().int().optional(),
  ects: z.number().int().optional(),
  format: z.nativeEnum(ProgramFormat),
  campuses: z.array(z.string()),
  languages: z.array(z.string()),
  startPeriods: z.array(z.string()),
  tuitionCents: z.number().int().optional(),
  applicationFeeCents: z.number().int().optional(),
  currency: z.string().default('EUR'),
  financing: z.string().optional(),
  admissionPrerequisites: z.array(z.string()),
  admissionTests: z.array(z.string()),
  admissionDocuments: z.array(z.string()),
  admissionProcess: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  website: z.string().url().optional(),
  schoolId: z.string(),
  contestId: z.string().optional(),
  school: z
    .object({
      id: z.string(),
      name: z.string(),
      city: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  contest: z
    .object({
      id: z.string(),
      name: z.string(),
      year: z.number().int(),
    })
    .optional(),
  courses: z.array(programCourseSchema).optional(),
  careers: z.array(programCareerSchema).optional(),
  leaderboardEntries: z.array(leaderboardEntrySchema).optional(),
  deadlines: z.array(deadlineSchema).optional(),
});

export const contestTestRequirementSchema = z.object({
  id: z.string(),
  test: z.nativeEnum(TestType),
  minimumScore: z.number().optional(),
  recommendedScore: z.number().optional(),
  weightPercent: z.number().int().optional(),
  validityMonths: z.number().int().optional(),
  sections: z.array(z.string()),
  notes: z.string().optional(),
  registrationUrl: z.string().url().optional(),
});

export const contestSchema = z.object({
  id: z.string(),
  name: z.string(),
  year: z.number().int(),
  url: z.string().url().optional(),
  description: z.string().optional(),
  examFormat: z.string().optional(),
  feesCents: z.number().int().optional(),
  currency: z.string().default('EUR'),
  registrationUrl: z.string().url().optional(),
  languages: z.array(z.string()),
  examLocations: z.array(z.string()),
  durationMinutes: z.number().int().optional(),
  scoreScale: z.string().optional(),
  maxAttempts: z.number().int().optional(),
  testRequirements: z.array(contestTestRequirementSchema).optional(),
  deadlines: z.array(deadlineSchema).optional(),
});

export type UserInput = z.infer<typeof userSchema>;
export type DeadlineInput = z.infer<typeof deadlineSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type ReminderInput = z.infer<typeof reminderSchema>;
export type CandidatureInput = z.infer<typeof candidatureSchema>;
export type ProgramInput = z.infer<typeof programSchema>;
export type LeaderboardInput = z.infer<typeof leaderboardSchema>;
export type LeaderboardEntryInput = z.infer<typeof leaderboardEntrySchema>;
export type ContestInput = z.infer<typeof contestSchema>;
export type ContestTestRequirementInput = z.infer<typeof contestTestRequirementSchema>;

