import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  HttpException,
  HttpStatus,
  NotFoundException,
  UploadedFiles,
  BadRequestException,
  Post,
  Delete,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './users.schema';
import { UpdateProfileDto, UpdateUserRoleDto } from './users.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from 'src/users/users.role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { TenantAuthenticationGuard } from 'src/common/guards/tenent.auth.guard';

@ApiTags('users-controller')
@ApiBearerAuth()
@Controller('api/users')
@UseGuards(TenantAuthenticationGuard)
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'passportPhoto', maxCount: 1 },
        { name: 'votersCard', maxCount: 1 },
      ],
      {
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        fileFilter: (req, file, cb) => {
          if (
            [
              'image/jpeg',
              'image/png',
              'image/jpg',
              'application/pdf',
            ].includes(file.mimetype)
          ) {
            cb(null, true);
          } else {
            cb(new BadRequestException('Only JPEG/PNG files allowed'), false);
          }
        },
      },
    ),
  )
  async updateUserProfile(
    @Param('id') id: string,
    @Body() body: UpdateProfileDto,
    @UploadedFiles()
    files: {
      passportPhoto?: Express.Multer.File[];
      votersCard?: Express.Multer.File[];
    },
  ) {
    try {
      const updatedData: any = { ...body };
      const userDoc = await this.userService.findById(id);

      // Process passport photo if uploaded
      if (files?.passportPhoto && files?.passportPhoto?.length > 0) {
        const passportFile = files.passportPhoto[0];
        const oldPassportUrl = userDoc.passportPhoto;

        if (oldPassportUrl) {
          const publicId =
            this.cloudinaryService.getFullPublicIdFromUrl(oldPassportUrl);

          if (publicId) {
            try {
              await this.cloudinaryService.deleteFile(publicId);
            } catch (err) {
              console.warn(`Failed to delete old passport: ${err.message}`);
            }
          }
        }
        try {
          const passportUrl = await this.cloudinaryService.uploadFile(
            passportFile,
            'users/passports',
          );
          updatedData.passportPhoto = passportUrl;
        } catch (error) {
          throw new HttpException(
            `Passport upload failed: ${error.message}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Process voter's card if uploaded
      if (files?.votersCard && files?.votersCard?.length > 0) {
        const votersCardFile = files.votersCard[0];
        const oldVotersCardUrl = userDoc.votersCard;

        if (oldVotersCardUrl) {
          const publicId =
            this.cloudinaryService.getFullPublicIdFromUrl(oldVotersCardUrl);

          if (publicId) {
            try {
              await this.cloudinaryService.deleteFile(publicId);
            } catch (err) {
              console.warn(`Failed to delete old passport: ${err.message}`);
            }
          }
        }

        try {
          const votersCardUrl = await this.cloudinaryService.uploadFile(
            votersCardFile,
            'users/voters-cards',
          );
          updatedData.votersCard = votersCardUrl;
        } catch (error) {
          throw new HttpException(
            `Voters card upload failed: ${error.message}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Update user in database
      const updatedUser = await this.userService.userModel.findByIdAndUpdate(
        id,
        updatedData,
        { new: true },
      );

      if (!updatedUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser.toObject(),
        url: updatedData.passportPhoto || updatedData.votersCard || null,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'An error occurred while updating the profile',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STATE_CHAIRMAN)
  @ApiResponse({ type: User, isArray: false })
  async updateUserRole(
    @Param('id') id: string,
    @Body() body: UpdateUserRoleDto,
  ) {
    return await this.userService.userModel.findByIdAndUpdate(
      id,
      { ...body },
      { new: true },
    );
  }
  // PUT /users/:id/role → update member role
  // @Put(':id/role')
  // async updateRole(@Param('id') id: string, @Body('role') role: string) {
  //   return await this.userService.updateRole(id, role);
  // }

  @Get(':id')
  @ApiResponse({ type: User, isArray: false })
  async getProfile(@Param('id') id: string, @Body() body: any) {
    const user = await this.userService.findById(id);

    if (!user) {
      throw new NotFoundException('User not found'); // Handle missing user
    }

    return {
      ...user.toObject(),
      DOB: user.DOB ? user.DOB.toISOString().split('T')[0] : '', // Check for null
    };
  }

  // @Get()
  // @UseGuards(RolesGuard)
  // @Roles(UserRole.STATE_CHAIRMAN, UserRole.NATIONAL_CHAIRMAN)
  // async getPaginatedData(
  //   @Query('page') page: number = 1,
  //   @Query('limit') limit: number = 10,
  // ) {
  //   return this.userService.getPaginatedData(page, limit);
  // }

  // @Post('datatables')
  // @UseGuards(TenantAuthenticationGuard)
  // @Roles(UserRole.STATE_CHAIRMAN, UserRole.NATIONAL_CHAIRMAN)
  // async getUsers(@Body() body: any) {
  //   return this.userService.getDataTable(body);
  // }

  @Post(':tenantId/datatables')
  @UseGuards(TenantAuthenticationGuard)
  @Roles(UserRole.STATE_CHAIRMAN, UserRole.NATIONAL_CHAIRMAN)
  async getUsers(
    @Param('tenantId') tenantId: string,
    @Request() req,
    @Body() body: any,
  ) {
    return this.userService.getDataTable(body, tenantId, req.user.state);
  }

  @Delete(':id')
  @UseGuards(TenantAuthenticationGuard)
  @Roles(UserRole.STATE_CHAIRMAN)
  async deleteItem(@Param('id') item: string): Promise<any> {
    return this.userService.deleteItem(item);
  }

  @Post('search')
  async getUser(@Body() body: any) {
    return this.userService.getDataTables(body);
  }
}
