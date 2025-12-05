import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { PrismaService } from '../prisma.service';
import { GoogleModule } from '../google/google.module';

import { CandidatureController } from './candidature.controller';
import { CandidatureService } from './candidature.service';

@Module({
  imports: [PassportModule, GoogleModule],
  controllers: [CandidatureController],
  providers: [CandidatureService, PrismaService],
})
export class CandidatureModule {}

