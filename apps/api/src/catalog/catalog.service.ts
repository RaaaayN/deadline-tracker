import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';

interface DeadlineFilter {
  contestId?: string;
  schoolId?: string;
}

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  listContests() {
    return this.prisma.contest.findMany({ orderBy: { year: 'desc' } });
  }

  listSchools(contestId?: string) {
    return this.prisma.school.findMany({
      where: contestId ? { contestId } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  listDeadlines(filter: DeadlineFilter) {
    return this.prisma.deadline.findMany({
      where: {
        contestId: filter.contestId,
        schoolId: filter.schoolId,
      },
      orderBy: { dueAt: 'asc' },
    });
  }
}

