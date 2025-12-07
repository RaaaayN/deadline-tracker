import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';

interface DeadlineFilter {
  contestId?: string;
  schoolId?: string;
  programId?: string;
  diplomaName?: string;
}

interface ProgramFilters {
  domain?: string;
  campus?: string;
  type?: string;
  format?: string;
}

interface ContestFilters {
  year?: number;
}

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  listContests(filters: ContestFilters = {}) {
    return this.prisma.contest.findMany({
      where: {
        year: filters.year,
      },
      orderBy: [{ year: 'desc' }, { name: 'asc' }],
      include: {
        deadlines: {
          where: { schoolId: null, programId: null },
          orderBy: { dueAt: 'asc' },
        },
      },
    });
  }

  listSchools(contestId?: string) {
    return this.prisma.school.findMany({
      where: contestId ? { contestId } : undefined,
      orderBy: { name: 'asc' },
      include: {
        contest: { select: { id: true, name: true, year: true } },
        leaderboardEntries: {
          orderBy: { rank: 'asc' },
          take: 1,
          include: { leaderboard: true },
        },
      },
    });
  }

  listPrograms(filters: ProgramFilters) {
    return this.prisma.program.findMany({
      where: {
        domain: filters.domain ? { contains: filters.domain, mode: 'insensitive' } : undefined,
        type: filters.type ? (filters.type as any) : undefined,
        format: filters.format ? (filters.format as any) : undefined,
        campuses: filters.campus ? { has: filters.campus } : undefined,
      },
      orderBy: [{ name: 'asc' }],
      include: {
        school: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
        contest: { select: { id: true, name: true, year: true } },
        leaderboardEntries: {
          orderBy: { rank: 'asc' },
          take: 1,
          include: { leaderboard: true },
        },
      },
    });
  }

  getProgram(slugOrId: string) {
    return this.prisma.program.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
      },
      include: {
        school: {
          include: {
            leaderboardEntries: {
              orderBy: { rank: 'asc' },
              include: { leaderboard: true },
            },
          },
        },
        contest: true,
        courses: {
          orderBy: { title: 'asc' },
        },
        careers: true,
        leaderboardEntries: {
          orderBy: { rank: 'asc' },
          include: { leaderboard: true },
        },
        deadlines: {
          orderBy: { dueAt: 'asc' },
        },
      },
    });
  }

  listDeadlines(filter: DeadlineFilter) {
    return this.prisma.deadline.findMany({
      where: {
        contestId: filter.contestId,
        schoolId: filter.schoolId,
        programId: filter.programId,
        diplomaName: filter.diplomaName,
      },
      orderBy: { dueAt: 'asc' },
    });
  }

  listLeaderboards() {
    return this.prisma.leaderboard.findMany({
      orderBy: [{ year: 'desc' }, { name: 'asc' }],
      include: {
        entries: {
          orderBy: { rank: 'asc' },
          take: 3,
          include: { school: true, program: true },
        },
      },
    });
  }

  getLeaderboard(slugOrId: string) {
    return this.prisma.leaderboard.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
      },
      include: {
        entries: {
          orderBy: { rank: 'asc' },
          include: {
            school: true,
            program: true,
          },
        },
      },
    });
  }
}

