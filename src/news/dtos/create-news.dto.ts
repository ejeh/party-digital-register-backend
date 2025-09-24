import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsArray } from 'class-validator';
import { NewsScope, NewsStatus } from '../constants/news.constants';

export class CreateNewsDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ enum: NewsScope })
  @IsEnum(NewsScope)
  scope: NewsScope;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ enum: NewsStatus, required: false })
  @IsEnum(NewsStatus)
  @IsOptional()
  status?: NewsStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  attachments?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  expiryDate?: Date;
}
