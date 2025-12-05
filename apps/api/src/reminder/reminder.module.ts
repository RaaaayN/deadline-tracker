import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { NotificationModule } from '../notification/notification.module';
import { PrismaService } from '../prisma.service';

import { ReminderController } from './reminder.controller';
import { ReminderService } from './reminder.service';

@Module({
  imports: [PassportModule, NotificationModule],
  controllers: [ReminderController],
  providers: [ReminderService, PrismaService],
})
export class ReminderModule {}

