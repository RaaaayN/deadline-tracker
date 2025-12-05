import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { GoogleModule } from '../google/google.module';
import { PrismaService } from '../prisma.service';

import { ReminderController } from './reminder.controller';
import { ReminderService } from './reminder.service';

@Module({
  imports: [PassportModule, GoogleModule],
  controllers: [ReminderController],
  providers: [ReminderService, PrismaService],
})
export class ReminderModule {}

