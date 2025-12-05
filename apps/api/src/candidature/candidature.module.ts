import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { PrismaService } from '../prisma.service';

import { CandidatureController } from './candidature.controller';
import { CandidatureService } from './candidature.service';

@Module({
  imports: [PassportModule],
  controllers: [CandidatureController],
  providers: [CandidatureService, PrismaService],
})
export class CandidatureModule {}

