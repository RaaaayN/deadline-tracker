import { describe, expect, it, beforeEach, vi } from 'vitest';

import { CatalogService } from './catalog.service';

class MockPrisma {
  contest = { findMany: vi.fn() };
  school = { findMany: vi.fn() };
  program = { findMany: vi.fn(), findFirst: vi.fn() };
  deadline = { findMany: vi.fn() };
}

describe('CatalogService', () => {
  let prisma: MockPrisma;
  let service: CatalogService;

  beforeEach(() => {
    prisma = new MockPrisma();
    service = new CatalogService(prisma as any);
  });

  it('lists contests ordered by year then name', async () => {
    prisma.contest.findMany.mockResolvedValue([]);
    await service.listContests();
    expect(prisma.contest.findMany).toHaveBeenCalledWith({
      where: { year: undefined, testRequirements: undefined },
      orderBy: [{ year: 'desc' }, { name: 'asc' }],
      include: {
        deadlines: { where: { schoolId: null, programId: null }, orderBy: { dueAt: 'asc' } },
        testRequirements: { orderBy: { weightPercent: 'desc' } },
      },
    });
  });

  it('filters contests by year and test type', async () => {
    prisma.contest.findMany.mockResolvedValue([]);
    await service.listContests({ year: 2026, test: 'gmat' });
    expect(prisma.contest.findMany).toHaveBeenCalledWith({
      where: {
        year: 2026,
        testRequirements: { some: { test: 'gmat' as any } },
      },
      orderBy: [{ year: 'desc' }, { name: 'asc' }],
      include: {
        deadlines: { where: { schoolId: null, programId: null }, orderBy: { dueAt: 'asc' } },
        testRequirements: { orderBy: { weightPercent: 'desc' } },
      },
    });
  });

  it('filters schools by contest and returns rankings', async () => {
    prisma.school.findMany.mockResolvedValue([]);
    await service.listSchools('contest-1');
    expect(prisma.school.findMany).toHaveBeenCalledWith({
      where: { contestId: 'contest-1' },
      orderBy: { name: 'asc' },
      include: {
        contest: { select: { id: true, name: true, year: true } },
        leaderboardEntries: { orderBy: { rank: 'asc' }, take: 1, include: { leaderboard: true } },
      },
    });
  });

  it('builds program filters and includes school/contest/ranking', async () => {
    prisma.program.findMany.mockResolvedValue([]);
    await service.listPrograms({ domain: 'data', campus: 'Paris', type: 'msc', format: 'full_time' });
    expect(prisma.program.findMany).toHaveBeenCalledWith({
      where: {
        domain: { contains: 'data', mode: 'insensitive' },
        type: 'msc' as any,
        format: 'full_time' as any,
        campuses: { has: 'Paris' },
      },
      orderBy: [{ name: 'asc' }],
      include: {
        school: { select: { id: true, name: true, city: true, country: true } },
        contest: { select: { id: true, name: true, year: true } },
        leaderboardEntries: { orderBy: { rank: 'asc' }, take: 1, include: { leaderboard: true } },
      },
    });
  });

  it('gets program by slug or id with rich include', async () => {
    prisma.program.findFirst.mockResolvedValue(null);
    await service.getProgram('escp-msc-business-analytics-ai');
    expect(prisma.program.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [{ id: 'escp-msc-business-analytics-ai' }, { slug: 'escp-msc-business-analytics-ai' }],
      },
      include: {
        school: {
          include: {
            leaderboardEntries: { orderBy: { rank: 'asc' }, include: { leaderboard: true } },
          },
        },
        contest: true,
        courses: { orderBy: { title: 'asc' } },
        careers: true,
        leaderboardEntries: { orderBy: { rank: 'asc' }, include: { leaderboard: true } },
        deadlines: { orderBy: { dueAt: 'asc' } },
      },
    });
  });

  it('filters deadlines by contest/school/program/diploma', async () => {
    prisma.deadline.findMany.mockResolvedValue([]);
    await service.listDeadlines({
      contestId: 'c1',
      schoolId: 's1',
      programId: 'p1',
      diplomaName: 'MSc',
    });
    expect(prisma.deadline.findMany).toHaveBeenCalledWith({
      where: {
        contestId: 'c1',
        schoolId: 's1',
        programId: 'p1',
        diplomaName: 'MSc',
      },
      orderBy: { dueAt: 'asc' },
    });
  });

  it('lists leaderboards with top entries', async () => {
    prisma.leaderboard = { findMany: vi.fn() } as any;
    prisma.leaderboard.findMany.mockResolvedValue([]);
    await service.listLeaderboards();
    expect(prisma.leaderboard.findMany).toHaveBeenCalledWith({
      orderBy: [{ year: 'desc' }, { name: 'asc' }],
      include: {
        entries: { orderBy: { rank: 'asc' }, take: 3, include: { school: true, program: true } },
      },
    });
  });

  it('gets leaderboard by slug', async () => {
    prisma.leaderboard = { findFirst: vi.fn() } as any;
    prisma.leaderboard.findFirst.mockResolvedValue(null);
    await service.getLeaderboard('ft-eu');
    expect(prisma.leaderboard.findFirst).toHaveBeenCalledWith({
      where: { OR: [{ id: 'ft-eu' }, { slug: 'ft-eu' }] },
      include: {
        entries: { orderBy: { rank: 'asc' }, include: { school: true, program: true } },
      },
    });
  });
});


