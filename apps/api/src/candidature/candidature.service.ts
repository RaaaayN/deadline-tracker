import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus as SharedTaskStatus } from '@dossiertracker/shared';
import { TaskStatus as PrismaTaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateCandidatureDto } from './dto/create-candidature.dto';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class CandidatureService {
  constructor(private readonly prisma: PrismaService) {}

  listForUser(userId: string) {
    return this.prisma.candidature.findMany({
      where: { userId },
      include: { tasks: true, school: true, contest: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateCandidatureDto) {
    const created = await this.prisma.candidature.create({
      data: {
        userId,
        contestId: dto.contestId,
        schoolId: dto.schoolId,
        status: 'draft',
        tasks: {
          create: dto.initialTasks?.map((task) => ({
            title: task.title,
            status: PrismaTaskStatus.todo,
            deadlineId: task.deadlineId,
          })),
        },
      },
      include: { tasks: true },
    });

    await this.syncDeadlines(userId, created.id);
    return this.prisma.candidature.findUnique({
      where: { id: created.id },
      include: { tasks: true, school: true, contest: true },
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

    const deadlines = await this.prisma.deadline.findMany({
      where: {
        contestId: candidature.contestId,
        OR: [
          { schoolId: null },
          ...(candidature.schoolId ? [{ schoolId: candidature.schoolId }] : []),
        ],
      },
    });

    const existing = await this.prisma.task.findMany({
      where: { candidatureId, deadlineId: { not: null } },
      select: { deadlineId: true },
    });
    const existingIds = new Set(existing.map((t) => t.deadlineId).filter(Boolean));
    const toCreate = deadlines.filter((d) => !existingIds.has(d.id));

    if (toCreate.length === 0) {
      return { created: 0 };
    }

    await this.prisma.task.createMany({
      data: toCreate.map((dl) => ({
        title: dl.title,
        status: PrismaTaskStatus.todo,
        candidatureId,
        deadlineId: dl.id,
      })),
      skipDuplicates: true,
    });

    return { created: toCreate.length };
  }

  private async assertOwnership(userId: string, candidatureId: string) {
    const cand = await this.prisma.candidature.findUnique({ where: { id: candidatureId } });
    if (!cand || cand.userId !== userId) {
      throw new ForbiddenException();
    }
  }
}

