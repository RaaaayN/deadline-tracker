import { IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  deadlineId?: string;

  @IsOptional()
  @IsString()
  tips?: string;
}

