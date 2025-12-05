import { TaskStatus as PrismaTaskStatus } from '@prisma/client';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { PrismaService } from '../prisma.service';

import { CandidatureService } from './candidature.service';

class MockPrisma {
  candidature = {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
  };
  deadline = {
    findMany: vi.fn(),
  };
  task = {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    createMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
  reminder = {
    createMany: vi.fn(),
  };
}

describe('CandidatureService syncDeadlines', () => {
  let prisma: MockPrisma;
  let service: CandidatureService;

  beforeEach(() => {
    prisma = new MockPrisma();
    service = new CandidatureService(prisma as unknown as PrismaService);
  });

  it('creates tasks for missing deadlines', async () => {
    prisma.candidature.findUnique.mockResolvedValue({
      id: 'cand1',
      userId: 'user1',
      contestId: 'contest1',
      schoolId: 'school1',
    });
    prisma.deadline.findMany.mockResolvedValue([
      {
        id: 'd1',
        title: 'Inscription',
        contestId: 'contest1',
        schoolId: null,
        dueAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'd2',
        title: 'Oral',
        contestId: 'contest1',
        schoolId: 'school1',
        dueAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
    ]);
    prisma.task.findMany.mockResolvedValue([{ deadlineId: 'd1' }]);

    const res = await service.syncDeadlines('user1', 'cand1');
    expect(res).toEqual({ created: 1 });
    expect(prisma.task.createMany).toHaveBeenCalledWith({
      data: [
        {
          title: 'Oral',
          status: PrismaTaskStatus.todo,
          candidatureId: 'cand1',
          deadlineId: 'd2',
        },
      ],
      skipDuplicates: true,
    });
    expect(prisma.reminder.createMany).toHaveBeenCalled();
  });

  it('creates none when all deadlines already have tasks', async () => {
    prisma.candidature.findUnique.mockResolvedValue({
      id: 'cand1',
      userId: 'user1',
      contestId: 'contest1',
      schoolId: null,
    });
    prisma.deadline.findMany.mockResolvedValue([
      { id: 'd1', title: 'Inscription', dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    ]);
    prisma.task.findMany.mockResolvedValue([{ deadlineId: 'd1' }]);

    const res = await service.syncDeadlines('user1', 'cand1');
    expect(res).toEqual({ created: 0 });
    expect(prisma.task.createMany).not.toHaveBeenCalled();
    expect(prisma.reminder.createMany).toHaveBeenCalled();
  });
});

describe('CandidatureService suggestions and status', () => {
  let prisma: MockPrisma;
  let service: CandidatureService;

  beforeEach(() => {
    prisma = new MockPrisma();
    service = new CandidatureService(prisma as unknown as PrismaService);
  });

  it('adds suggestions to tasks in listForUser', async () => {
    prisma.candidature.findMany.mockResolvedValue([
      {
        id: 'cand1',
        userId: 'user1',
        contest: { name: 'Contest', year: 2025 },
        school: null,
        tasks: [
          {
            id: 't1',
            title: 'TOEFL réservation',
            status: PrismaTaskStatus.todo,
            candidatureId: 'cand1',
            deadline: { id: 'd1', type: 'test', title: 'TOEFL', contestId: 'c1', dueAt: new Date(), schoolId: null, createdAt: new Date() },
          },
        ],
      },
    ]);

    const res = await service.listForUser('user1');
    expect(res[0].tasks[0].suggestion).toContain('Réserve');
  });

  it('updates task status when ownership is valid', async () => {
    prisma.task.findUnique.mockResolvedValue({ id: 't1', candidatureId: 'cand1' });
    prisma.candidature.findUnique.mockResolvedValue({ id: 'cand1', userId: 'user1' });
    prisma.task.update.mockResolvedValue({ id: 't1', status: PrismaTaskStatus.doing });

    const updated = await service.updateTaskStatus('user1', 't1', PrismaTaskStatus.doing);
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: 't1' },
      data: { status: PrismaTaskStatus.doing },
    });
    expect(updated.status).toBe(PrismaTaskStatus.doing);
  });
});

