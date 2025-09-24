// import { ApiProperty } from '@nestjs/swagger';
// import {
//   IsString,
//   IsNotEmpty,
//   IsOptional,
//   IsUrl,
//   IsEnum,
// } from 'class-validator';
// import { ElectionType } from '../constants/election.constants';

// export class CreateCandidateDto {
//   @ApiProperty({
//     description: 'Position the candidate is contesting for',
//     example: 'Chairman',
//   })
//   @IsString()
//   @IsNotEmpty()
//   position: string;

//   @ApiProperty({
//     description: 'Political party of the candidate',
//     example: 'APC',
//     default: 'APC',
//   })
//   @IsString()
//   @IsNotEmpty()
//   party: string;

//   @ApiProperty({
//     description: 'Candidate manifesto or agenda',
//     example: 'Improve party internal democracy',
//     required: false,
//   })
//   @IsString()
//   @IsOptional()
//   manifesto?: string;

//   @ApiProperty({
//     description: 'URL to candidate profile image',
//     example: 'https://example.com/profile.jpg',
//     required: false,
//   })
//   @IsUrl()
//   @IsOptional()
//   imageUrl?: string;

//   @ApiProperty({
//     description: 'Type of election',
//     enum: ElectionType,
//     example: ElectionType.GENERAL,
//   })
//   @IsEnum(ElectionType)
//   electionType: ElectionType;

//   @ApiProperty({
//     description:
//       'State where candidate is contesting (for state-level elections)',
//     example: 'Lagos',
//     required: false,
//   })
//   @IsString()
//   @IsOptional()
//   state?: string;

//   @ApiProperty({
//     description: 'LGA where candidate is contesting (for local elections)',
//     example: 'Ikeja',
//     required: false,
//   })
//   @IsString()
//   @IsOptional()
//   lga?: string;

//   @ApiProperty({
//     description:
//       'Ward where candidate is contesting (for ward-level elections)',
//     example: 'Ward A',
//     required: false,
//   })
//   @IsString()
//   @IsOptional()
//   ward?: string;
// }

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsEnum,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { ElectionType } from '../constants/election.constants';

export class CreateCandidateDto {
  @ApiProperty({
    description: 'Position the candidate is contesting for',
    example: 'Chairman',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  position: string;

  @ApiProperty({
    description: 'Political party of the candidate',
    example: 'APC',
    enum: ['APC', 'PDP', 'LP', 'NNPP', 'OTHER'],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['APC', 'PDP', 'LP', 'NNPP', 'OTHER'])
  party: string;

  @ApiProperty({
    description: 'Candidate manifesto or agenda',
    example: 'Improve party internal democracy',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  manifesto?: string;

  @ApiProperty({
    description: 'URL to candidate profile image',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsOptional()
  // @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    description: 'Type of election',
    enum: ElectionType,
    example: ElectionType.GENERAL,
  })
  @IsEnum(ElectionType)
  electionType: ElectionType;

  @ApiProperty({
    description:
      'State where candidate is contesting (for state-level elections)',
    example: 'Lagos',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @ApiProperty({
    description: 'LGA where candidate is contesting (for local elections)',
    example: 'Ikeja',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lga?: string;

  @ApiProperty({
    description:
      'Ward where candidate is contesting (for ward-level elections)',
    example: 'Ward A',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  ward?: string;
}

export class ApproveCandidateDto {
  @ApiProperty({
    description: 'Whether to approve the candidate',
    example: true,
  })
  @IsBoolean()
  approved: boolean;

  @ApiProperty({
    description: 'Reason for rejection if applicable',
    example: 'Incomplete documentation',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  rejectionReason?: string;
}
