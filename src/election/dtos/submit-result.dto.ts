import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNumber,
  IsString,
  IsArray,
  IsOptional,
  Min,
  IsObject,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { PollingUnitLocationDto } from './polling-unit.dto';

// export class SubmitResultDto {
//   @ApiProperty({ description: 'Polling unit code' })
//   @IsString()
//   @IsNotEmpty()
//   pollingUnitCode: string;

//   @ApiProperty({ description: 'Position being contested' })
//   @IsString()
//   @IsNotEmpty()
//   position: string;

//   @ApiProperty({ description: 'Number of votes for candidate', minimum: 0 })
//   @IsNumber()
//   @IsOptional()
//   @Min(0)
//   votes: number; // For single candidate submissions

//   @ApiProperty({ description: 'Total votes cast', minimum: 0 })
//   @IsNumber()
//   @Min(0)
//   votesCast: number;

//   @ApiProperty({ description: 'Total valid votes', minimum: 0 })
//   @IsNumber()
//   @Min(0)
//   validVotes: number;

//   @ApiProperty({ description: 'Total rejected votes', minimum: 0 })
//   @IsNumber()
//   @Min(0)
//   rejectedVotes: number;

//   @ApiProperty({
//     description: 'Map of candidate IDs to their votes',
//     additionalProperties: { type: 'number' },
//     required: false,
//   })
//   // @ValidateNested()
//   @IsOptional()
//   candidateResults?: Record<string, number>; // For multiple candidates

//   @IsOptional()
//   @IsString()
//   candidateId?: string; // For single candidate submissions

//   @ApiProperty({
//     description: 'Array of image URLs as evidence',
//     type: [String],
//     required: false,
//   })
//   @IsArray()
//   @IsOptional()
//   images?: string[];

//   @ApiProperty({
//     description: 'Array of video URLs as evidence',
//     type: [String],
//     required: false,
//   })
//   @IsArray()
//   @IsOptional()
//   videos?: string[];

//   @ApiProperty({
//     description: 'Array of document URLs as evidence',
//     type: [String],
//     required: false,
//   })
//   @IsArray()
//   @IsOptional()
//   documents?: string[];

//   @ApiProperty({ description: 'Additional notes', required: false })
//   @IsString()
//   @IsOptional()
//   notes?: string;

//   @ApiProperty()
//   createdAt: Date;

//   @ApiProperty()
//   updatedAt: Date;
// }
export class SubmitResultDto {
  @ApiProperty({ description: 'Polling unit code' })
  @IsString()
  @IsNotEmpty()
  pollingUnitCode: string;

  @ApiProperty({ description: 'Position being contested' })
  @IsString()
  @IsNotEmpty()
  position: string;

  @ApiProperty({ description: 'Number of votes for candidate', minimum: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number) // Add this decorator
  votes: number; // For single candidate submissions

  @ApiProperty({ description: 'Total votes cast', minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number) // Add this decorator
  votesCast: number;

  @ApiProperty({ description: 'Total valid votes', minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number) // Add this decorator
  validVotes: number;

  @ApiProperty({ description: 'Total rejected votes', minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number) // Add this decorator
  rejectedVotes: number;

  // @ApiProperty({
  //   description: 'Map of candidate IDs to their votes',
  //   additionalProperties: { type: 'number' },
  //   required: false,
  // })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsOptional()
  candidateResults?: Record<string, number>; // For multiple candidates

  @IsOptional()
  @IsString()
  candidateId?: string; // For single candidate submissions

  @ApiProperty({
    description: 'Array of image URLs as evidence',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiProperty({
    description: 'Array of video URLs as evidence',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  videos?: string[];

  @ApiProperty({
    description: 'Array of document URLs as evidence',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  documents?: string[];

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ElectionResultResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  electionId: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PollingUnitLocationDto)
  location: PollingUnitLocationDto;

  @ApiProperty()
  position: string;

  @ApiProperty()
  candidateId: string;

  @ApiProperty()
  @Type(() => Number) //
  votes: number;

  @ApiProperty()
  submittedBy: string;

  @ApiProperty()
  registeredVoters: number;

  @ApiProperty()
  accreditedVoters: number;

  @ApiProperty()
  votesCast: number;

  @ApiProperty()
  validVotes: number;

  @ApiProperty()
  rejectedVotes: number;

  @ApiProperty()
  candidateResults: Record<string, number>;

  @ApiProperty()
  images: string[];

  @ApiProperty()
  videos: string[];

  @ApiProperty()
  documents: string[];

  @ApiProperty()
  notes: string;

  @ApiProperty()
  isApproved: boolean;
}
