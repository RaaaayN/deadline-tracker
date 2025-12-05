import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskStatus as PrismaTaskStatus } from '@prisma/client';
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
    createMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
}

describe('CandidatureService syncDeadlines', () => {
  let prisma: MockPrisma;
  let service: CandidatureService;

  beforeEach(() => {
    prisma = new MockPrisma();
    service = new CandidatureService(prisma as unknown as any);
  });

  it('creates tasks for missing deadlines', async () => {
    prisma.candidature.findUnique.mockResolvedValue({
      id: 'cand1',
      userId: 'user1',
      contestId: 'contest1',
      schoolId: 'school1',
    });
    prisma.deadline.findMany.mockResolvedValue([
      { id: 'd1', title: 'Inscription', contestId: 'contest1', schoolId: null },
      { id: 'd2', title: 'Oral', contestId: 'contest1', schoolId: 'school1' },
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
  });

  it('creates none when all deadlines already have tasks', async () => {
    prisma.candidature.findUnique.mockResolvedValue({
      id: 'cand1',
      userId: 'user1',
      contestId: 'contest1',
      schoolId: null,
    });
    prisma.deadline.findMany.mockResolvedValue([{ id: 'd1', title: 'Inscription' }]);
    prisma.task.findMany.mockResolvedValue([{ deadlineId: 'd1' }]);

    const res = await service.syncDeadlines('user1', 'cand1');
    expect(res).toEqual({ created: 0 });
    expect(prisma.task.createMany).not.toHaveBeenCalled();
  });
});

