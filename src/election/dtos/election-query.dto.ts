import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import {
  ElectionLevel,
  ElectionStatus,
  ElectionType,
} from '../constants/election.constants';
import { Type } from 'class-transformer';

export class ElectionQueryDto {
  @ApiProperty({
    description: 'Level of election data to query',
    enum: ElectionLevel,
    example: ElectionLevel.STATE,
    required: false,
  })
  @IsEnum(ElectionLevel)
  @IsOptional()
  level?: ElectionLevel;

  @ApiProperty({
    description:
      'Location ID based on the level (stateId, lgaId, wardId, etc.)',
    example: 'LAGOS',
    required: false,
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({
    description: 'Type of election to filter by',
    enum: ElectionType,
    example: ElectionType.GENERAL,
    required: false,
  })
  @IsEnum(ElectionType)
  @IsOptional()
  type?: ElectionType;

  @ApiProperty({
    description: 'Status of elections to filter by',
    enum: ElectionStatus,
    example: ElectionStatus.COMPLETED,
    required: false,
  })
  @IsEnum(ElectionStatus)
  @IsOptional()
  status?: ElectionStatus;

  @ApiProperty({
    description: 'Position being contested to filter by',
    example: 'Governor',
    required: false,
  })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiProperty({
    description: 'Start date range for filtering elections',
    example: '2023-01-01',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'End date range for filtering elections',
    example: '2023-12-31',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    maximum: 100,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    description: 'Search term for election title or description',
    example: 'Primary',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Sort field (title, startDate, endDate)',
    example: 'startDate',
    required: false,
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'startDate';

  @ApiProperty({
    description: 'Sort order (asc or desc)',
    example: 'desc',
    required: false,
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
