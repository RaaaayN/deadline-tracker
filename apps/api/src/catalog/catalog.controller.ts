import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';

import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('contests')
  getContests() {
    return this.catalogService.listContests();
  }

  @Get('schools')
  getSchools(@Query('contestId') contestId?: string) {
    return this.catalogService.listSchools(contestId);
  }

  @Get('leaderboards')
  getLeaderboards() {
    return this.catalogService.listLeaderboards();
  }

  @Get('leaderboards/:slug')
  async getLeaderboard(@Param('slug') slug: string) {
    const leaderboard = await this.catalogService.getLeaderboard(slug);
    if (!leaderboard) {
      throw new NotFoundException('Classement introuvable');
    }
    return leaderboard;
  }

  @Get('programs')
  getPrograms(
    @Query('domain') domain?: string,
    @Query('campus') campus?: string,
    @Query('type') type?: string,
    @Query('format') format?: string,
  ) {
    return this.catalogService.listPrograms({ domain, campus, type, format });
  }

  @Get('programs/:slug')
  async getProgram(@Param('slug') slug: string) {
    const program = await this.catalogService.getProgram(slug);
    if (!program) {
      throw new NotFoundException('Programme introuvable');
    }
    return program;
  }

  @Get('deadlines')
  getDeadlines(
    @Query('contestId') contestId?: string,
    @Query('schoolId') schoolId?: string,
    @Query('programId') programId?: string,
  ) {
    return this.catalogService.listDeadlines({ contestId, schoolId, programId });
  }
}

