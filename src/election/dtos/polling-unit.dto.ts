import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsObject,
  ValidateNested,
  IsString,
  IsNumber,
  Min,
  IsOptional,
  IsLatitude,
  IsLongitude,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PollingUnitLocationDto {
  @ApiProperty({
    description: 'State where the polling unit is located',
    example: 'LAGOS',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z\s]+$/, { message: 'State should contain only letters' })
  state: string;

  @ApiProperty({
    description: 'Local Government Area',
    example: 'IKEJA',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z\s]+$/, { message: 'LGA should contain only letters' })
  lga: string;

  @ApiProperty({
    description: 'Ward name',
    example: 'WARD_A',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9_]+$/, {
    message: 'Ward should contain only letters, numbers and underscores',
  })
  ward: string;

  @ApiProperty({
    description: 'Unique polling unit code (format: STATE_LGA_WARD_XXX)',
    example: 'LA_IK_WA_001',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  // @Matches(/^[A-Z]{2}_[A-Z]{2}_[A-Z]{2}_\d{3}$/, {
  //   message:
  //     'Polling unit code must follow format: STATE_LGA_WARD_XXX (e.g., LA_IK_WA_001)',
  // })
  pollingUnitCode: string;
}

export class CreatePollingUnitDto {
  @ApiProperty({
    description: 'User ID who created the polling unit',
    example: 'xxxxxx633373733838',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @ApiProperty({
    type: PollingUnitLocationDto,
    description: 'Location details of the polling unit',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => PollingUnitLocationDto)
  location: PollingUnitLocationDto;

  @ApiProperty({
    description: 'Name of the polling unit',
    example: 'Community Primary School',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Number of registered voters',
    example: 750,
    required: false,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  registeredVoters?: number;

  @ApiProperty({
    description: 'Number of accredited voters voters',
    example: 750,
    required: false,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  accreditedVoters?: number;

  @ApiProperty({
    description: 'Physical address of the polling unit',
    example: '123 Main Street, Off Marina Road',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'GPS coordinates in "latitude,longitude" format',
    example: '6.5244,3.3792',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^-?\d{1,3}\.\d+,-?\d{1,3}\.\d+$/, {
    message: 'GPS coordinates must be in "latitude,longitude" format',
  })
  gpsCoordinates?: string;
}

export class UpdatePollingUnitDto {
  @ApiProperty({
    description: 'Name of the polling unit',
    example: 'Updated School Name',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Number of registered voters',
    example: 800,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  registeredVoters?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  accreditedVoters?: number;

  @ApiProperty({
    description: 'Physical address of the polling unit',
    example: 'Updated Address',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'GPS coordinates in "latitude,longitude" format',
    example: '6.5245,3.3793',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^-?\d{1,3}\.\d+,-?\d{1,3}\.\d+$/, {
    message: 'GPS coordinates must be in "latitude,longitude" format',
  })
  gpsCoordinates?: string;
}
