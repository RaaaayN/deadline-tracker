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
    return this.prisma.candidature.create({
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

  private async assertOwnership(userId: string, candidatureId: string) {
    const cand = await this.prisma.candidature.findUnique({ where: { id: candidatureId } });
    if (!cand || cand.userId !== userId) {
      throw new ForbiddenException();
    }
  }
}

