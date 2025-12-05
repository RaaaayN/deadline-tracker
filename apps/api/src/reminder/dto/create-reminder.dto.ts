import { ReminderChannel } from '@dossiertracker/shared';
import { IsDateString, IsEnum, IsString } from 'class-validator';

export class CreateReminderDto {
  @IsString()
  deadlineId!: string;

  @IsEnum(ReminderChannel)
  channel!: ReminderChannel;

  @IsDateString()
  sendAt!: string;
}

