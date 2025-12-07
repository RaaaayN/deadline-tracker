import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { CreateDraftDto } from './dto/create-draft.dto';
import { ExchangeCodeDto } from './dto/exchange-code.dto';
import { SyncDeadlinesDto } from './dto/sync-deadlines.dto';
import { GoogleService } from './google.service';

interface AuthedRequest extends Request {
  user: { userId: string };
}

@UseGuards(AuthGuard('jwt'))
@Controller('google')
export class GoogleController {
  constructor(private readonly google: GoogleService) {}

  @Get('oauth/url')
  getOAuthUrl() {
    return { url: this.google.buildAuthUrl() };
  }

  @Post('oauth/exchange')
  exchange(@Req() req: AuthedRequest, @Body() body: ExchangeCodeDto) {
    return this.google.exchangeCode(req.user.userId, body.code);
  }

  @Get('status')
  status(@Req() req: AuthedRequest) {
    return this.google.status(req.user.userId);
  }

  @Post('calendar/sync-deadlines')
  syncCalendar(@Req() req: AuthedRequest, @Body() body: SyncDeadlinesDto) {
    return this.google.syncDeadlinesToCalendar(
      req.user.userId,
      body.deadlines.map((d) => ({ ...d, dueAt: new Date(d.dueAt) })),
    );
  }

  @Post('calendar/purge-dossiertracker')
  purgeCalendar(@Req() req: AuthedRequest) {
    return this.google.purgeDossierTrackerEvents(req.user.userId);
  }

  @Get('gmail/messages')
  inbox(@Req() req: AuthedRequest) {
    return this.google.listInbox(req.user.userId);
  }

  @Post('gmail/drafts')
  createDraft(@Req() req: AuthedRequest, @Body() body: CreateDraftDto) {
    return this.google.createDraft(req.user.userId, body.to, body.subject, body.text);
  }
}

