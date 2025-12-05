import { Controller, Get, Query } from '@nestjs/common';

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

  @Get('deadlines')
  getDeadlines(@Query('contestId') contestId?: string, @Query('schoolId') schoolId?: string) {
    return this.catalogService.listDeadlines({ contestId, schoolId });
  }
}

