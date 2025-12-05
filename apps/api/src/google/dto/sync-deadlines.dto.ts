import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDate, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

class DeadlineDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @Type(() => Date)
  @IsDate()
  dueAt!: Date;
}

export class SyncDeadlinesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DeadlineDto)
  deadlines!: DeadlineDto[];
}

