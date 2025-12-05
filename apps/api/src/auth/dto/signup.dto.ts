import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString, IsIn } from 'class-validator';

const allowedRoles = ['student', 'parent', 'mentor', 'campus_admin', 'super_admin'] as const;

export class SignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsString()
  @IsIn(allowedRoles)
  @Type(() => String)
  role?: (typeof allowedRoles)[number];
}

