import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  ReminderChannel as PrismaReminderChannel,
  ReminderStatus as PrismaReminderStatus,
} from '@prisma/client';

import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma.service';

import { CreateReminderDto } from './dto/create-reminder.dto';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
  ) {}

  listForUser(userId: string) {
    return this.prisma.reminder.findMany({
      where: { userId },
      include: { deadline: true },
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
        status: PrismaReminderStatus.pending,
      },
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async dispatchDue(): Promise<void> {
    const now = new Date();
    const pending = await this.prisma.reminder.findMany({
      where: {
        status: PrismaReminderStatus.pending,
        sendAt: { lte: now },
      },
      include: { user: true, deadline: true },
      orderBy: { sendAt: 'asc' },
      take: 50,
    });

    for (const reminder of pending) {
      if (reminder.channel === PrismaReminderChannel.email) {
        await this.sendEmail(reminder.id, reminder.user.email, reminder.deadline.title, reminder.deadline.dueAt);
        continue;
      }

      await this.markAsError(reminder.id, 'Channel not implemented');
    }
  }

  private async sendEmail(reminderId: string, to: string, deadlineTitle: string, deadlineAt: Date): Promise<void> {
    const subject = `Rappel : ${deadlineTitle}`;
    const text = [
      `Bonjour,`,
      '',
      `Rappel pour l’échéance "${deadlineTitle}".`,
      `Date limite : ${deadlineAt.toLocaleString()}.`,
      '',
      'Pense à valider ta checklist avant cette date.',
    ].join('\n');

    try {
      await this.notification.sendEmailReminder(to, subject, text);
      await this.prisma.reminder.update({
        where: { id: reminderId },
        data: { status: PrismaReminderStatus.sent, sentAt: new Date(), lastError: null },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown email error';
      this.logger.error(`Failed to send reminder ${reminderId}: ${message}`);
      await this.markAsError(reminderId, message);
    }
  }

  private async markAsError(reminderId: string, message: string): Promise<void> {
    await this.prisma.reminder.update({
      where: { id: reminderId },
      data: { status: PrismaReminderStatus.error, lastError: message },
    });
  }
}

