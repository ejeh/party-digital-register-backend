import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsNumber } from 'class-validator';

export class CreateRegistrationLinkDto {
  @IsEmail()
  email: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  expiration?: number; // in hours, default 48
}
