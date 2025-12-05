import { IsDateString, IsEnum, IsString } from 'class-validator';
import { ReminderChannel } from '@dossiertracker/shared';

export class CreateReminderDto {
  @IsString()
  deadlineId!: string;

  @IsEnum(ReminderChannel)
  channel!: ReminderChannel;

  @IsDateString()
  sendAt!: string;
}

