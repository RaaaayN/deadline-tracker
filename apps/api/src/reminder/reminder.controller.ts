import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { CreateReminderDto } from './dto/create-reminder.dto';
import { ReminderService } from './reminder.service';

interface AuthedRequest extends Request {
  user: { userId: string };
}

@Controller('reminders')
@UseGuards(AuthGuard('jwt'))
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Get()
  list(@Req() req: AuthedRequest) {
    return this.reminderService.listForUser(req.user.userId);
  }

  @Post()
  create(@Req() req: AuthedRequest, @Body() body: CreateReminderDto) {
    return this.reminderService.create(req.user.userId, body);
  }
}

