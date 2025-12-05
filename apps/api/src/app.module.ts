import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { CandidatureModule } from './candidature/candidature.module';
import { ReminderModule } from './reminder/reminder.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CatalogModule,
    CandidatureModule,
    ReminderModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}

