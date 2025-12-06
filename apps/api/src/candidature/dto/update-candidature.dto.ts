import { IsEnum, IsOptional, IsString } from 'class-validator';

import { CandidatureType } from '@prisma/client';

export class UpdateCandidatureDto {
  @IsOptional()
  @IsEnum(CandidatureType)
  type?: CandidatureType;

  @IsOptional()
  @IsString()
  contestId?: string;

  @IsOptional()
  @IsString()
  schoolId?: string;

  @IsOptional()
  @IsString()
  diplomaName?: string;

  @IsOptional()
  @IsString()
  sessionLabel?: string;

  @IsOptional()
  @IsString()
  status?: string;
}


