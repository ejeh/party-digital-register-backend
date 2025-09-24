import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsArray } from 'class-validator';
import { CircularAudience } from '../constants/news.constants';

export class CreateCircularDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ enum: CircularAudience })
  @IsEnum(CircularAudience)
  audience: CircularAudience;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  specificRoles?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  requiresAcknowledgement?: boolean;
}
