import { TaskStatus } from '@dossiertracker/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { CandidatureService } from './candidature.service';
import { CreateCandidatureDto } from './dto/create-candidature.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateCandidatureDto } from './dto/update-candidature.dto';

interface AuthedRequest extends Request {
  user: { userId: string };
}

@Controller('candidatures')
@UseGuards(AuthGuard('jwt'))
export class CandidatureController {
  constructor(private readonly candidatureService: CandidatureService) {}

  @Get()
  list(@Req() req: AuthedRequest) {
    return this.candidatureService.listForUser(req.user.userId);
  }

  @Post()
  create(@Req() req: AuthedRequest, @Body() body: CreateCandidatureDto) {
    return this.candidatureService.create(req.user.userId, body);
  }

  @Post(':id/tasks')
  addTask(@Req() req: AuthedRequest, @Param('id') candidatureId: string, @Body() body: CreateTaskDto) {
    return this.candidatureService.addTask(req.user.userId, candidatureId, body);
  }

  @Patch(':id')
  updateCandidature(
    @Req() req: AuthedRequest,
    @Param('id') candidatureId: string,
    @Body() body: UpdateCandidatureDto,
  ) {
    return this.candidatureService.updateCandidature(req.user.userId, candidatureId, body);
  }

  @Delete(':id')
  deleteCandidature(@Req() req: AuthedRequest, @Param('id') candidatureId: string) {
    return this.candidatureService.deleteCandidature(req.user.userId, candidatureId);
  }

  @Patch('tasks/:id/status')
  updateTaskStatus(
    @Req() req: AuthedRequest,
    @Param('id') taskId: string,
    @Body('status') status: TaskStatus,
  ) {
    return this.candidatureService.updateTaskStatus(req.user.userId, taskId, status);
  }

  @Delete('tasks/:id')
  deleteTask(@Req() req: AuthedRequest, @Param('id') taskId: string) {
    return this.candidatureService.deleteTask(req.user.userId, taskId);
  }

  @Post(':id/sync-deadlines')
  syncDeadlines(@Req() req: AuthedRequest, @Param('id') candidatureId: string) {
    return this.candidatureService.syncDeadlines(req.user.userId, candidatureId);
  }

  @Get(':id/suggestions')
  suggestions(@Req() req: AuthedRequest, @Param('id') candidatureId: string) {
    return this.candidatureService.listSuggestions(req.user.userId, candidatureId);
  }
}

