// import { ApiProperty } from '@nestjs/swagger';
// import { IsEnum, IsArray, IsDateString, IsString } from 'class-validator';
// import { ElectionLevel, ElectionType } from '../constants/election.constants';

// export class CreateElectionDto {
//   @ApiProperty()
//   @IsString()
//   title: string;

//   @ApiProperty({ enum: Object.values(ElectionType) })
//   @IsEnum(ElectionType)
//   type: ElectionType;

//   @ApiProperty({ enum: Object.values(ElectionLevel) })
//   @IsEnum(ElectionLevel)
//   level: ElectionLevel;

//   @ApiProperty()
//   @IsDateString()
//   startDate: Date;

//   @ApiProperty()
//   @IsString()
//   location: string;

//   @ApiProperty()
//   @IsDateString()
//   endDate: Date;

//   @ApiProperty({ type: [String] })
//   @IsArray()
//   positions: string[];

//   @ApiProperty({ required: false })
//   @IsString()
//   description?: string;
// }

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsDateString,
  IsEnum,
  MinLength,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { ElectionLevel, ElectionType } from '../constants/election.constants';

export class CreateElectionDto {
  @ApiProperty({
    description: 'Title of the election',
    example: '2023 General Elections',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Type of election',
    enum: ElectionType,
    example: ElectionType.GENERAL,
  })
  @IsEnum(ElectionType)
  type: ElectionType;

  @ApiProperty({ enum: Object.values(ElectionLevel) })
  @IsEnum(ElectionLevel)
  level: ElectionLevel;

  @ApiProperty({
    description: 'Election start date and time',
    example: '2023-02-25T08:00:00.000Z',
  })
  @IsDateString()
  startDate: Date;

  @ApiProperty({
    description: 'Election end date and time',
    example: '2023-02-25T17:00:00.000Z',
  })
  @IsDateString()
  endDate: Date;

  @ApiProperty({
    description: 'Candidate registration start date',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsDateString()
  candidateRegistrationStart: Date;

  @ApiProperty({
    description: 'Candidate registration end date',
    example: '2023-01-31T23:59:59.000Z',
  })
  @IsDateString()
  candidateRegistrationEnd: Date;

  @ApiProperty({
    description: 'List of positions being contested',
    example: ['President', 'Governor', 'Senator'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MinLength(3, { each: true })
  positions: string[];

  @ApiProperty({
    description: 'Description of the election',
    required: false,
    example: 'General elections for all positions',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'State where election is held (for state-level elections)',
    required: false,
    example: 'Lagos',
  })
  @IsOptional()
  @IsString()
  state?: string;

  // @ApiProperty({
  //   description:
  //     'LGA where election is held (for local government-level elections)',
  //   required: false,
  //   example: 'Ikeja',
  // })
  // @IsOptional()
  // @IsString()
  // lga?: string;

  // @ApiProperty({
  //   description: 'Ward where election is held (for ward-level elections)',
  //   required: false,
  //   example: 'ward 1',
  // })
  // @IsOptional()
  // @IsString()
  // ward?: string;
}
