import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './auth/auth.module';
import { CandidatureModule } from './candidature/candidature.module';
import { CatalogModule } from './catalog/catalog.module';
import { NotificationModule } from './notification/notification.module';
import { PrismaService } from './prisma.service';
import { ReminderModule } from './reminder/reminder.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AuthModule,
    CatalogModule,
    CandidatureModule,
    ReminderModule,
    NotificationModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}

