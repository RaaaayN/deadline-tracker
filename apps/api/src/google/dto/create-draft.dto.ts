import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDraftDto {
  @IsEmail()
  to!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  subject!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  text!: string;
}

