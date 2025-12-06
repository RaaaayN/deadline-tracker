import { TaskStatus as SharedTaskStatus } from '@dossiertracker/shared';
import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  CandidatureType as PrismaCandidatureType,
  ReminderChannel as PrismaReminderChannel,
  ReminderStatus as PrismaReminderStatus,
  TaskStatus as PrismaTaskStatus,
} from '@prisma/client';

import { GoogleService } from '../google/google.service';
import { PrismaService } from '../prisma.service';

import { CreateCandidatureDto } from './dto/create-candidature.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateCandidatureDto } from './dto/update-candidature.dto';
import { getSuggestionForTask } from './suggestions';

@Injectable()
export class CandidatureService {
  private readonly logger = new Logger(CandidatureService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly google: GoogleService,
  ) {}

  async listForUser(userId: string) {
    const candidatures = await this.prisma.candidature.findMany({
      where: { userId },
      include: {
        tasks: {
          include: { deadline: true },
        },
        school: true,
        contest: true,
        program: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return candidatures.map((candidature) => ({
      ...candidature,
      tasks: candidature.tasks.map((task) => ({
        ...task,
        suggestion: getSuggestionForTask(task.title, task.deadline),
      })),
    }));
  }

  async create(userId: string, dto: CreateCandidatureDto) {
    this.assertTypeRules(dto.type, dto.diplomaName, dto.schoolId, dto.programId);
    const created = await this.prisma.candidature.create({
      data: {
        userId,
        contestId: dto.contestId,
        type: dto.type,
        schoolId: dto.type === PrismaCandidatureType.concours ? null : dto.schoolId,
        programId: dto.type === PrismaCandidatureType.concours ? null : dto.programId,
        diplomaName: dto.diplomaName,
        sessionLabel: dto.sessionLabel,
        status: 'draft',
        tasks: {
          create: dto.initialTasks?.map((task) => ({
            title: task.title,
            status: PrismaTaskStatus.todo,
            deadlineId: task.deadlineId,
          })),
        },
      },
      include: { tasks: true, school: true, contest: true, program: true },
    });

    await this.syncDeadlines(userId, created.id);
    return this.prisma.candidature.findUnique({
      where: { id: created.id },
      include: { tasks: true, school: true, contest: true, program: true },
    });
  }

  async addTask(userId: string, candidatureId: string, dto: CreateTaskDto) {
    await this.assertOwnership(userId, candidatureId);
    return this.prisma.task.create({
      data: {
        title: dto.title,
        status: PrismaTaskStatus.todo,
        candidatureId,
        deadlineId: dto.deadlineId,
        tips: dto.tips,
      },
    });
  }

  async updateCandidature(userId: string, candidatureId: string, dto: UpdateCandidatureDto) {
    const existing = await this.prisma.candidature.findUnique({ where: { id: candidatureId } });
    if (!existing || existing.userId !== userId) {
      throw new ForbiddenException();
    }

    const nextType = dto.type ?? (existing.type as PrismaCandidatureType);
    const nextDiplomaName = dto.diplomaName ?? existing.diplomaName;
    const nextSchoolId = nextType === PrismaCandidatureType.concours ? null : dto.schoolId ?? existing.schoolId;
    const nextProgramId = nextType === PrismaCandidatureType.concours ? null : dto.programId ?? existing.programId;
    const nextSessionLabel = dto.sessionLabel ?? existing.sessionLabel;

    this.assertTypeRules(nextType, nextDiplomaName, nextSchoolId, nextProgramId);

    return this.prisma.candidature.update({
      where: { id: candidatureId },
      data: {
        type: nextType,
        contestId: dto.contestId,
        schoolId: nextSchoolId,
        programId: nextProgramId,
        diplomaName: nextDiplomaName,
        sessionLabel: nextSessionLabel,
        status: dto.status,
      },
      include: { tasks: true, school: true, contest: true, program: true },
    });
  }

  async deleteCandidature(userId: string, candidatureId: string) {
    await this.assertOwnership(userId, candidatureId);
    await this.prisma.candidature.delete({ where: { id: candidatureId } });
    return { deleted: true };
  }

  async updateTaskStatus(userId: string, taskId: string, status: SharedTaskStatus) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    await this.assertOwnership(userId, task.candidatureId);
    return this.prisma.task.update({
      where: { id: taskId },
      data: { status: status as PrismaTaskStatus },
    });
  }

  async deleteTask(userId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId }, select: { candidatureId: true } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    await this.assertOwnership(userId, task.candidatureId);
    await this.prisma.task.delete({ where: { id: taskId } });
    return { deleted: true };
  }

  async listSuggestions(userId: string, candidatureId: string) {
    await this.assertOwnership(userId, candidatureId);
    const tasks = await this.prisma.task.findMany({
      where: { candidatureId },
      include: { deadline: true },
      orderBy: { createdAt: 'asc' },
    });

    return tasks.map((task) => ({
      taskId: task.id,
      suggestion: getSuggestionForTask(task.title, task.deadline),
    }));
  }

  /**
   * Synchronise les échéances officielles (concours + éventuelle école) en tâches TODO pour la candidature.
   * Évite les doublons lorsqu’une tâche est déjà liée à une deadline.
   */
  async syncDeadlines(userId: string, candidatureId: string) {
    const candidature = await this.prisma.candidature.findUnique({
      where: { id: candidatureId },
      include: { contest: true, school: true },
    });
    if (!candidature || candidature.userId !== userId) {
      throw new ForbiddenException();
    }

    const diplomaFilter =
      candidature.type === PrismaCandidatureType.diplome && candidature.diplomaName
        ? { OR: [{ diplomaName: candidature.diplomaName }, { diplomaName: null }] }
        : {};
    const programFilter =
      candidature.type === PrismaCandidatureType.diplome && candidature.programId
        ? { OR: [{ programId: candidature.programId }, { programId: null }] }
        : {};

    const deadlines =
      candidature.type === PrismaCandidatureType.concours
        ? await this.prisma.deadline.findMany({
            where: { contestId: candidature.contestId, schoolId: null, sessionLabel: candidature.sessionLabel },
          })
        : await this.prisma.deadline.findMany({
            where: {
              contestId: candidature.contestId,
              OR: [{ schoolId: null }, { schoolId: candidature.schoolId }],
              sessionLabel: candidature.sessionLabel,
              ...diplomaFilter,
              ...programFilter,
            },
          });

    const existing = await this.prisma.task.findMany({
      where: { candidatureId, deadlineId: { not: null } },
      select: { deadlineId: true },
    });
    const existingIds = new Set(existing.map((t) => t.deadlineId).filter(Boolean));
    const toCreate = deadlines.filter((d) => !existingIds.has(d.id));

    if (toCreate.length > 0) {
      await this.prisma.task.createMany({
        data: toCreate.map((dl) => ({
          title: dl.title,
          status: PrismaTaskStatus.todo,
          candidatureId,
          deadlineId: dl.id,
        })),
        skipDuplicates: true,
      });
    }

    await this.createReminders(userId, deadlines);
    await this.syncDeadlinesToCalendar(userId, deadlines, candidatureId);
    return { created: toCreate.length };
  }

  private async assertOwnership(userId: string, candidatureId: string) {
    const cand = await this.prisma.candidature.findUnique({ where: { id: candidatureId } });
    if (!cand || cand.userId !== userId) {
      throw new ForbiddenException();
    }
  }

  private assertTypeRules(
    type: PrismaCandidatureType,
    diplomaName?: string | null,
    schoolId?: string | null,
    programId?: string | null,
  ) {
    if (type === PrismaCandidatureType.concours && schoolId) {
      throw new BadRequestException('Une candidature concours ne peut pas être liée à une école.');
    }
    if (type === PrismaCandidatureType.concours && programId) {
      throw new BadRequestException('Une candidature concours ne peut pas être liée à un diplôme/programme.');
    }
    if (type === PrismaCandidatureType.diplome) {
      if (!schoolId) {
        throw new BadRequestException('Une candidature diplôme doit être liée à une école.');
      }
      if (!diplomaName || diplomaName.trim() === '') {
        throw new BadRequestException('Un diplôme est requis pour une candidature de type diplôme.');
      }
    }
  }

  private async createReminders(userId: string, deadlines: { id: string; dueAt: Date }[]) {
    const now = new Date();
    const reminders = deadlines.flatMap((deadline) => {
      const anchorDays = [30, 7, 1];
      return anchorDays
        .map((days) => {
          const sendAt = new Date(deadline.dueAt.getTime() - days * 24 * 60 * 60 * 1000);
          return { sendAt };
        })
        .filter(({ sendAt }) => sendAt > now)
        .map(({ sendAt }) => ({
          userId,
          deadlineId: deadline.id,
          channel: PrismaReminderChannel.email,
          sendAt,
          status: PrismaReminderStatus.pending,
        }));
    });

    if (reminders.length === 0) {
      return;
    }

    await this.prisma.reminder.createMany({
      data: reminders,
      skipDuplicates: true,
    });
  }

  private async syncDeadlinesToCalendar(
    userId: string,
    deadlines: { id: string; title: string; dueAt: Date }[],
    candidatureId: string,
  ) {
    if (deadlines.length === 0) {
      return;
    }
    try {
      await this.google.syncDeadlinesToCalendar(
        userId,
        deadlines.map((dl) => ({ ...dl, candidatureId })),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google Calendar sync failed';
      this.logger.warn(`[Calendar] sync skipped for user ${userId}: ${message}`);
    }
  }
}

