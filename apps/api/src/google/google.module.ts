import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { PrismaService } from '../prisma.service';

import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';

@Module({
  imports: [PassportModule],
  controllers: [GoogleController],
  providers: [GoogleService, PrismaService],
  exports: [GoogleService],
})
export class GoogleModule {}

