import { z } from 'zod';

import { DeadlineType, ReminderChannel, TaskStatus, UserRole } from './types';

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
  contestId: z.string(),
  schoolId: z.string().optional(),
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
  status: z.enum(['draft', 'submitted']),
});

export type UserInput = z.infer<typeof userSchema>;
export type DeadlineInput = z.infer<typeof deadlineSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type ReminderInput = z.infer<typeof reminderSchema>;
export type CandidatureInput = z.infer<typeof candidatureSchema>;

