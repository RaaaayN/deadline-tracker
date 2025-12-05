import { Injectable } from '@nestjs/common';
import { ReminderChannel } from '@dossiertracker/shared';
import { ReminderChannel as PrismaReminderChannel } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateReminderDto } from './dto/create-reminder.dto';

@Injectable()
export class ReminderService {
  constructor(private readonly prisma: PrismaService) {}

  listForUser(userId: string) {
    return this.prisma.reminder.findMany({
      where: { userId },
      orderBy: { sendAt: 'asc' },
    });
  }

  async create(userId: string, dto: CreateReminderDto) {
    return this.prisma.reminder.create({
      data: {
        userId,
        deadlineId: dto.deadlineId,
        channel: dto.channel as PrismaReminderChannel,
        sendAt: dto.sendAt,
      },
    });
  }

  // Placeholder for async scheduling worker (BullMQ/cron) to be added when infra is wired.
}

