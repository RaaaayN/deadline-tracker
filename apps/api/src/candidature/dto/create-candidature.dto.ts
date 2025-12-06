import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

import { CandidatureType } from '@prisma/client';

class InitialTaskDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  deadlineId?: string;
}

export class CreateCandidatureDto {
  @IsEnum(CandidatureType)
  type!: CandidatureType;

  @IsString()
  contestId!: string;

  @IsOptional()
  @IsString()
  schoolId?: string;

  @IsString()
  sessionLabel!: string;

  @IsOptional()
  @IsString()
  diplomaName?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InitialTaskDto)
  initialTasks?: InitialTaskDto[];
}

