import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../prisma.service';
import { ReminderController } from './reminder.controller';
import { ReminderService } from './reminder.service';

@Module({
  imports: [PassportModule],
  controllers: [ReminderController],
  providers: [ReminderService, PrismaService],
})
export class ReminderModule {}

