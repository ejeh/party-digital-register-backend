import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Request,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateCompanyDto } from './create-company.dto';
import { SignUpDto } from 'src/auth/auth.interface';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/users/users.role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { TenantAuthenticationGuard } from 'src/common/guards/tenent.auth.guard';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Tenant } from './tenant.schema';
import { ApproveMembershipDto } from 'src/users/users.dto';
import { User } from 'src/users/users.schema';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller('api/tenant')
@ApiTags('Tenant.controller')
export class TenantController {
  constructor(
    private readonly tenantService: TenantService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // @Post('create-company')
  // // @UseInterceptors(
  // //   FilesInterceptor('files', 2, {
  // //     limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
  // //     fileFilter: (req, file, cb) => {
  // //       const allowedTypes = [
  // //         'image/jpeg',
  // //         'image/png',
  // //         'image/jpg',
  // //         'application/pdf',
  // //       ];
  // //       if (allowedTypes.includes(file.mimetype)) {
  // //         cb(null, true);
  // //       } else {
  // //         cb(
  // //           new HttpException('Invalid file type', HttpStatus.BAD_REQUEST),
  // //           false,
  // //         );
  // //       }
  // //     },
  // //   }),
  // // )
  // @UseInterceptors(
  //   FileFieldsInterceptor(
  //     [
  //       { name: 'votersCard', maxCount: 1 },
  //       { name: 'logo', maxCount: 1 },
  //     ],
  //     {
  //       limits: { fileSize: 1024 * 1024 * 5 },
  //       fileFilter: (req, file, cb) => {
  //         const allowedTypes = [
  //           'image/jpeg',
  //           'image/png',
  //           'image/jpg',
  //           'application/pdf',
  //         ];
  //         if (allowedTypes.includes(file.mimetype)) {
  //           cb(null, true);
  //         } else {
  //           cb(
  //             new HttpException('Invalid file type', HttpStatus.BAD_REQUEST),
  //             false,
  //           );
  //         }
  //       },
  //     },
  //   ),
  // )
  // async createCompany(
  //   @Body() createCompanyDto: any,
  //   @UploadedFiles() files: Array<Express.Multer.File>,
  //   @Req() req: any,
  // ) {
  //   console.log(files);
  //   if (!files) {
  //     throw new HttpException(
  //       "Voter's card file is required",
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   const [votersCardUrl, logoUrl] = await Promise.all([
  //     this.cloudinaryService.uploadFile(files[0], 'users/votersCard'),
  //     this.cloudinaryService.uploadFile(files[1], 'users/logo'),
  //   ]);

  //   // const votersCardUrl = await this.cloudinaryService.uploadFile(
  //   //   file,
  //   //   'users/votersCard',
  //   //   ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  //   // );

  //   // const logoUrl = await this.cloudinaryService.uploadFile(
  //   //   file,
  //   //   'users/logo',
  //   //   ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  //   // );

  //   // Parse user data if it's a JSON string
  //   let parsedUserData;
  //   if (typeof createCompanyDto.user === 'string') {
  //     try {
  //       parsedUserData = JSON.parse(createCompanyDto.user);
  //       console.log('Parsed user data:', parsedUserData);
  //     } catch (error) {
  //       throw new HttpException(
  //         'Invalid user data format',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }
  //   } else {
  //     parsedUserData = createCompanyDto.user;
  //   }

  //   // Create the properly structured DTO
  //   const transformedData: CreateCompanyDto = {
  //     party: createCompanyDto.party,
  //     state: createCompanyDto.state,
  //     user: {
  //       ...parsedUserData, // Use the parsed object, not the original string
  //       votersCard: votersCardUrl,
  //       logo: logoUrl,
  //     },
  //   };

  //   return this.tenantService.createCompany(transformedData, req);
  // }
  @Post('create-company')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'votersCard', maxCount: 1 },
        { name: 'logo', maxCount: 1 },
      ],
      {
        limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
        fileFilter: (req, file, cb) => {
          const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'application/pdf',
          ];
          if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(
              new HttpException('Invalid file type', HttpStatus.BAD_REQUEST),
              false,
            );
          }
        },
      },
    ),
  )
  async createCompany(
    @Body() createCompanyDto: any,
    @UploadedFiles()
    files: { votersCard?: Express.Multer.File[]; logo?: Express.Multer.File[] },
    @Req() req: any,
  ) {
    // Check if files exist and have the expected structure
    if (!files.votersCard || files.votersCard.length === 0) {
      throw new HttpException(
        "Voter's card file is required",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!files.logo || files.logo.length === 0) {
      throw new HttpException('Logo file is required', HttpStatus.BAD_REQUEST);
    }

    const [votersCardUrl, logoUrl] = await Promise.all([
      this.cloudinaryService.uploadFile(
        files.votersCard[0],
        'users/votersCard',
      ),
      this.cloudinaryService.uploadFile(files.logo[0], 'users/logo'),
    ]);

    // Parse user data if it's a JSON string
    let parsedUserData;
    if (typeof createCompanyDto.user === 'string') {
      try {
        parsedUserData = JSON.parse(createCompanyDto.user);
        console.log('Parsed user data:', parsedUserData);
      } catch (error) {
        throw new HttpException(
          'Invalid user data format',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      parsedUserData = createCompanyDto.user;
    }

    // Create the properly structured DTO
    const transformedData: CreateCompanyDto = {
      party: createCompanyDto.party,
      state: createCompanyDto.state,
      logo: logoUrl,
      user: {
        ...parsedUserData,
        votersCard: votersCardUrl,
      },
    };

    return this.tenantService.createCompany(transformedData, req);
  }

  @Post('users/register')
  @UseInterceptors(
    FileInterceptor('votersCard', {
      limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'application/pdf',
        ];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new HttpException('Invalid file type', HttpStatus.BAD_REQUEST),
            false,
          );
        }
      },
    }),
  )
  async createUser(
    @Body() body: SignUpDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new HttpException(
        'Voter’s card file is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userData = { ...body };
    if (file) {
      try {
        const votersCardUrl = await this.cloudinaryService.uploadFile(
          file,
          'users/votersCard',
          ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
        );

        userData.votersCard = votersCardUrl;
      } catch (error) {
        throw new HttpException(
          `Passport upload failed: ${error.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return await this.tenantService.addUserToTenant(userData, req);
  }

  @Post(':tenantId/users')
  @UseGuards(TenantAuthenticationGuard)
  @Roles(UserRole.REGISTRATION_AGENT)
  async addUsers(
    @Param('tenantId') tenantId: string,
    @Body() userData: SignUpDto,
    @Req() req: any,
  ) {
    return await this.tenantService.addUsersToTenant(tenantId, userData, req);
  }

  @Get(':tenantId/member-stats')
  @ApiResponse({
    status: 200,
    description: 'Returns paginated member statistics for the tenant',
    type: Tenant,
    isArray: false,
  })
  @UseGuards(TenantAuthenticationGuard)
  @Roles(UserRole.STATE_CHAIRMAN, UserRole.NATIONAL_CHAIRMAN)
  async getPaginatedData(@Param('tenantId') tenantId: string) {
    return this.tenantService.getMemberStats(tenantId);
  }

  @Get(':id')
  @UseGuards(TenantAuthenticationGuard, RolesGuard)
  @Roles(UserRole.STATE_CHAIRMAN, UserRole.NATIONAL_CHAIRMAN)
  @ApiResponse({ type: Tenant, isArray: false })
  async getTenantById(@Param('id') id: string, @Body() body: any) {
    return await this.tenantService.findOne(id);
  }

  @Patch(':tenantId/:userId/membership/approve')
  @UseGuards(TenantAuthenticationGuard)
  @Roles(UserRole.STATE_CHAIRMAN)
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'Membership status updated successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Invalid status change attempt' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async approveMembership(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,

    // @Body() approveDto: ApproveMembershipDto,
    @Request() req,
  ) {
    return this.tenantService.approveMember(
      // approveDto.status,
      userId,
      tenantId,
      req.user._id, // Track who made the change
    );
  }

  @Patch(':tenantId/:userId/membership/reject')
  @UseGuards(TenantAuthenticationGuard)
  @Roles(UserRole.STATE_CHAIRMAN)
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'Membership status updated successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Invalid status change attempt' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async rejectMembership(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,
    @Body() body: { reason: string },
    @Request() req,
  ) {
    if (!body.reason) throw new BadRequestException('Reason is required.');
    return this.tenantService.rejectMember(
      userId,
      tenantId,
      req.user._id, // Track who made the change
      body.reason,
    );
  }

  @Get(':tenantId/pending-members')
  @UseGuards(TenantAuthenticationGuard)
  @Roles(UserRole.STATE_CHAIRMAN)
  @ApiResponse({
    status: 200,
    description: 'Pending membership status ',
    type: [User],
  })
  async getPendingMembers(@Param('tenantId') tenantId: string, @Request() req) {
    return this.tenantService.getPendingMembers(tenantId, req.user.state);
  }
}
