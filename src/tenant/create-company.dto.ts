// import { SignUpDto } from 'src/auth/auth.interface';

// import { IsString, ValidateNested } from 'class-validator';
// import { Type } from 'class-transformer';

// export class CreateCompanyDto {
//   @IsString()
//   party: string;

//   @IsString()
//   state: string;

//   @ValidateNested()
//   @Type(() => SignUpDto)
//   user: SignUpDto;
// }
import { SignUpDto } from 'src/auth/auth.interface';

// import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({})
  readonly firstname!: string;

  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({})
  readonly lastname!: string;

  @IsNotEmpty()
  @MaxLength(11)
  @ApiProperty({})
  readonly phone!: string;

  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({})
  readonly party!: string;

  @IsNotEmpty()
  @MaxLength(11)
  @ApiProperty({})
  readonly NIN!: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 'email@gmail.com',
    maxLength: 255,
  })
  @IsEmail()
  readonly email!: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'password', minLength: 8 })
  @MinLength(8)
  readonly password!: string;

  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({})
  readonly state!: string;

  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({})
  readonly lga!: string;

  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({})
  readonly ward!: string;

  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({})
  readonly polling_unit!: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  readonly votersCard?: string;
}

export class CreateCompanyDto {
  @IsString()
  party: string;

  @IsString()
  state: string;

  @ValidateNested()
  @Type(() => UserDto)
  // @IsNotEmpty()
  user: UserDto;

  @IsString()
  logo: string;
}
