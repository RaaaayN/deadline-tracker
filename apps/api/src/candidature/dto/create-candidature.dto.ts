import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class InitialTaskDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  deadlineId?: string;
}

export class CreateCandidatureDto {
  @IsString()
  contestId!: string;

  @IsOptional()
  @IsString()
  schoolId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InitialTaskDto)
  initialTasks?: InitialTaskDto[];
}

