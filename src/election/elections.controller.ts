import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
  Patch,
  HttpStatus,
  BadRequestException,
  HttpException,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ElectionsService } from './elections.service';
import { CreateElectionDto } from './dtos/create-election.dto';
import {
  ElectionResultResponseDto,
  SubmitResultDto,
} from './dtos/submit-result.dto';

import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '../users/users.role.enum';
import { ElectionLevel } from './constants/election.constants';
import { ElectionQueryDto } from './dtos/election-query.dto';
import { TenantAuthenticationGuard } from 'src/common/guards/tenent.auth.guard';
import { CreateCandidateDto } from './dtos/create-candidate.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CreatePollingUnitDto,
  UpdatePollingUnitDto,
} from './dtos/polling-unit.dto';
import { isValidObjectId } from 'mongoose';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import mongoose from 'mongoose';

@Controller('api/election')
export class ElectionsController {
  constructor(
    private readonly electionsService: ElectionsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('create-election')
  @UseGuards(TenantAuthenticationGuard)
  @Roles(UserRole.NATIONAL_CHAIRMAN, UserRole.STATE_CHAIRMAN)
  async createElection(@Body() createElectionDto: CreateElectionDto) {
    return this.electionsService.createElection(createElectionDto);
  }

  // @Post('results/:electionId')
  // @UseGuards(TenantAuthenticationGuard)
  // @Roles(UserRole.DELEGATE, UserRole.STATE_CHAIRMAN)
  // @ApiOperation({ summary: 'Submit election results for a polling unit' })
  // @ApiResponse({
  //   status: HttpStatus.CREATED,
  //   description: 'Election results submitted successfully',
  //   type: ElectionResultResponseDto,
  // })
  // @ApiResponse({
  //   status: HttpStatus.BAD_REQUEST,
  //   description: 'Invalid input data',
  // })

  // async submitResult(
  //   @Body() submitResultDto: SubmitResultDto,
  //   @Param('electionId') electionId: string,
  //   @Request() req,
  // ) {
  //   // Verify the polling unit exists and belongs to the delegate's state
  //   const pollingUnit = await this.electionsService.getPollingUnitByCode(
  //     submitResultDto.pollingUnitCode,
  //   );

  //   if (
  //     req.user.role === UserRole.DELEGATE &&
  //     pollingUnit.data.location.state.toLowerCase() !==
  //       req.user.state.toLowerCase()
  //   ) {
  //     throw new ForbiddenException(
  //       'You can only submit results for polling units in your state',
  //     );
  //   }

  //   return this.electionsService.submitResult(
  //     submitResultDto,
  //     req.user._id,
  //     electionId,
  //   );
  // }

  // @Post('results/:electionId')
  // @UseGuards(TenantAuthenticationGuard)
  // @Roles(UserRole.DELEGATE, UserRole.STATE_CHAIRMAN)
  // @ApiOperation({ summary: 'Submit election results for a polling unit' })
  // @ApiResponse({
  //   status: HttpStatus.CREATED,
  //   description: 'Election results submitted successfully',
  //   type: ElectionResultResponseDto,
  // })
  // @ApiResponse({
  //   status: HttpStatus.BAD_REQUEST,
  //   description: 'Invalid input data',
  // })
  // @UseInterceptors(
  //   FileFieldsInterceptor(
  //     [
  //       { name: 'images', maxCount: 5 }, // Allow multiple images
  //       { name: 'videos', maxCount: 3 }, // Allow multiple videos
  //       { name: 'documents', maxCount: 3 }, // Allow supporting documents
  //     ],
  //     {
  //       limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max file size
  //       fileFilter: (req, file, cb) => {
  //         // Allow images, videos, and documents
  //         const allowedImageTypes = [
  //           'image/jpeg',
  //           'image/png',
  //           'image/jpg',
  //           'image/webp',
  //         ];
  //         const allowedVideoTypes = [
  //           'video/mp4',
  //           'video/quicktime',
  //           'video/x-msvideo',
  //           'video/mpeg',
  //         ];
  //         const allowedDocumentTypes = [
  //           'application/pdf',
  //           'application/msword',
  //           'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  //         ];

  //         if (
  //           allowedImageTypes.includes(file.mimetype) ||
  //           allowedVideoTypes.includes(file.mimetype) ||
  //           allowedDocumentTypes.includes(file.mimetype)
  //         ) {
  //           cb(null, true);
  //         } else {
  //           cb(
  //             new BadRequestException(
  //               'Only JPEG, PNG, JPG, WebP images; MP4, MOV, AVI, MPEG videos; and PDF, DOC, DOCX documents are allowed',
  //             ),
  //             false,
  //           );
  //         }
  //       },
  //     },
  //   ),
  // )
  // async submitResult(
  //   @Body() submitResultDto: SubmitResultDto,
  //   @Param('electionId') electionId: string,
  //   @Request() req,
  //   @UploadedFiles()
  //   files: {
  //     images?: Express.Multer.File[];
  //     videos?: Express.Multer.File[];
  //     documents?: Express.Multer.File[];
  //   },
  // ) {
  //   try {
  //     // Verify the polling unit exists and belongs to the delegate's state
  //     const pollingUnit = await this.electionsService.getPollingUnitByCode(
  //       submitResultDto.pollingUnitCode,
  //     );

  //     if (
  //       req.user.role === UserRole.DELEGATE &&
  //       pollingUnit.data.location.state.toLowerCase() !==
  //         req.user.state.toLowerCase()
  //     ) {
  //       throw new ForbiddenException(
  //         'You can only submit results for polling units in your state',
  //       );
  //     }

  //     // Process uploaded files
  //     const uploadedFiles = {
  //       images: [],
  //       videos: [],
  //       documents: [],
  //     };

  //     // Process images
  //     if (files?.images && files.images.length > 0) {
  //       for (const image of files.images) {
  //         try {
  //           const imageUrl = await this.cloudinaryService.uploadFile(
  //             image,
  //             `election-results/${electionId}/images`,
  //           );
  //           uploadedFiles.images.push(imageUrl);
  //         } catch (error) {
  //           throw new HttpException(
  //             `Image upload failed: ${error.message}`,
  //             HttpStatus.BAD_REQUEST,
  //           );
  //         }
  //       }
  //     }

  //     // Process videos
  //     if (files?.videos && files.videos.length > 0) {
  //       for (const video of files.videos) {
  //         try {
  //           const videoUrl = await this.cloudinaryService.uploadFile(
  //             video,
  //             `election-results/${electionId}/videos`,
  //           );
  //           uploadedFiles.videos.push(videoUrl);
  //         } catch (error) {
  //           throw new HttpException(
  //             `Video upload failed: ${error.message}`,
  //             HttpStatus.BAD_REQUEST,
  //           );
  //         }
  //       }
  //     }

  //     // Process documents
  //     if (files?.documents && files.documents.length > 0) {
  //       for (const document of files.documents) {
  //         try {
  //           const documentUrl = await this.cloudinaryService.uploadFile(
  //             document,
  //             `election-results/${electionId}/documents`,
  //           );
  //           uploadedFiles.documents.push(documentUrl);
  //         } catch (error) {
  //           throw new HttpException(
  //             `Document upload failed: ${error.message}`,
  //             HttpStatus.BAD_REQUEST,
  //           );
  //         }
  //       }
  //     }

  //     // Merge file URLs with the DTO
  //     const resultData = {
  //       ...submitResultDto,
  //       images: [...(submitResultDto.images || []), ...uploadedFiles.images],
  //       videos: [...(submitResultDto.videos || []), ...uploadedFiles.videos],
  //       documents: uploadedFiles.documents,
  //     };

  //     return this.electionsService.submitResult(
  //       resultData,
  //       req.user._id,
  //       electionId,
  //     );
  //   } catch (error) {
  //     if (error instanceof ForbiddenException) {
  //       throw error;
  //     }
  //     throw new HttpException(
  //       error.message || 'Failed to submit election results',
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  // }

  @Post('results/:electionId')
  @UseGuards(TenantAuthenticationGuard)
  @Roles(UserRole.DELEGATE)
  @ApiOperation({ summary: 'Submit election results for a polling unit' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Election results submitted successfully',
    type: ElectionResultResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'images', maxCount: 5 },
        { name: 'videos', maxCount: 3 },
        { name: 'documents', maxCount: 3 },
      ],
      {
        limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max file size
        fileFilter: (req, file, cb) => {
          // Allow images, videos, and documents
          const allowedImageTypes = [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'image/webp',
          ];
          const allowedVideoTypes = [
            'video/mp4',
            'video/quicktime',
            'video/x-msvideo',
            'video/mpeg',
          ];
          const allowedDocumentTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ];

          if (
            allowedImageTypes.includes(file.mimetype) ||
            allowedVideoTypes.includes(file.mimetype) ||
            allowedDocumentTypes.includes(file.mimetype)
          ) {
            cb(null, true);
          } else {
            cb(
              new BadRequestException(
                'Only JPEG, PNG, JPG, WebP images; MP4, MOV, AVI, MPEG videos; and PDF, DOC, DOCX documents are allowed',
              ),
              false,
            );
          }
        },
      },
    ),
  )
  async submitResult(
    @Body() submitResultDto: SubmitResultDto,
    @Param('electionId') electionId: string,
    @Request() req,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
      videos?: Express.Multer.File[];
      documents?: Express.Multer.File[];
    },
  ) {
    try {
      // Parse candidateResults if it's a string
      if (typeof submitResultDto.candidateResults === 'string') {
        try {
          submitResultDto.candidateResults = JSON.parse(
            submitResultDto.candidateResults,
          );
        } catch (parseError) {
          throw new BadRequestException('Invalid candidateResults format');
        }
      }

      // Validate candidate IDs format
      if (submitResultDto.candidateResults) {
        const invalidCandidateIds = Object.keys(
          submitResultDto.candidateResults,
        ).filter((id) => !mongoose.Types.ObjectId.isValid(id));

        if (invalidCandidateIds.length > 0) {
          throw new BadRequestException(
            `Invalid candidate ID format: ${invalidCandidateIds.join(', ')}`,
          );
        }
      }

      // Verify the polling unit exists and belongs to the delegate's state
      const pollingUnit = await this.electionsService.getPollingUnitByCode(
        submitResultDto.pollingUnitCode,
      );

      if (
        req.user.role === UserRole.DELEGATE &&
        pollingUnit.data.location.state.toLowerCase() !==
          req.user.state.toLowerCase()
      ) {
        throw new ForbiddenException(
          'You can only submit results for polling units in your state',
        );
      }

      // Process uploaded files
      const uploadedFiles = {
        images: [],
        videos: [],
        documents: [],
      };

      // Process images
      if (files?.images && files.images.length > 0) {
        for (const image of files.images) {
          try {
            const imageUrl = await this.cloudinaryService.uploadFile(
              image,
              `election-results/${electionId}/images`,
            );
            uploadedFiles.images.push(imageUrl);
          } catch (error) {
            throw new HttpException(
              `Image upload failed: ${error.message}`,
              HttpStatus.BAD_REQUEST,
            );
          }
        }
      }

      // Process videos
      if (files?.videos && files.videos.length > 0) {
        for (const video of files.videos) {
          try {
            const videoUrl = await this.cloudinaryService.uploadFile(
              video,
              `election-results/${electionId}/videos`,
            );
            uploadedFiles.videos.push(videoUrl);
          } catch (error) {
            throw new HttpException(
              `Video upload failed: ${error.message}`,
              HttpStatus.BAD_REQUEST,
            );
          }
        }
      }

      // Process documents
      if (files?.documents && files.documents.length > 0) {
        for (const document of files.documents) {
          try {
            const documentUrl = await this.cloudinaryService.uploadFile(
              document,
              `election-results/${electionId}/documents`,
            );
            uploadedFiles.documents.push(documentUrl);
          } catch (error) {
            throw new HttpException(
              `Document upload failed: ${error.message}`,
              HttpStatus.BAD_REQUEST,
            );
          }
        }
      }

      // Merge file URLs with the DTO
      const resultData = {
        ...submitResultDto,
        images: [...(submitResultDto.images || []), ...uploadedFiles.images],
        videos: [...(submitResultDto.videos || []), ...uploadedFiles.videos],
        documents: [
          ...(submitResultDto.documents || []),
          ...uploadedFiles.documents,
        ],
      };

      return this.electionsService.submitResult(
        resultData,
        req.user._id,
        electionId,
      );
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to submit election results',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('results/:electionId')
  @UseGuards(TenantAuthenticationGuard)
  @ApiOperation({ summary: 'Get election results by level' })
  @ApiResponse({ status: 200, description: 'Returns aggregated results' })
  @ApiResponse({ status: 404, description: 'Election not found' })
  async getResults(
    @Param('electionId') electionId: string,
    @Query('level') level: ElectionLevel,
    @Query('locationId') locationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (!isValidObjectId(electionId)) {
      throw new BadRequestException('Invalid electionId format');
    }

    return this.electionsService.getResultsWithTotals(
      electionId,
      level,
      locationId,
      Number(page),
      Number(limit),
    );
  }

  @Post('results/:resultId/approve')
  @UseGuards(TenantAuthenticationGuard)
  @Roles(UserRole.STATE_CHAIRMAN)
  async approveResult(@Param('resultId') resultId: string, @Request() req) {
    return this.electionsService.approveResult(resultId, req.user._id);
  }

  // @Get(':electionId/candidates')
  // @UseGuards(TenantAuthenticationGuard)
  // @Roles(UserRole.STATE_CHAIRMAN, UserRole.NATIONAL_CHAIRMAN)
  // async getCandidates(
  //   @Param('electionId') electionId: string,
  //   @Query('position') position?: string,
  // ) {
  //   return this.electionsService.getElectionCandidates(electionId, position);
  // }

  @Post(':electionId/candidates/datatables')
  @UseGuards(TenantAuthenticationGuard)
  async getCandidatesDT(
    @Param('electionId') electionId: string,
    @Body() params: any,
  ) {
    return this.electionsService.getElectionCandidatesDT(electionId, params);
  }

  @Post('create-polling-unit')
  @UseGuards(TenantAuthenticationGuard)
  @Roles(UserRole.STATE_CHAIRMAN)
  @ApiOperation({ summary: 'Create a new polling unit' })
  @ApiResponse({
    status: 201,
    description: 'Polling unit created successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Polling unit already exists' })
  async createPollingUnit(
    @Body() createPollingUnitDto: CreatePollingUnitDto,
    @Request() req,
  ) {
    // State chairmen can only create in their state
    if (
      req.user.role === UserRole.STATE_CHAIRMAN &&
      createPollingUnitDto.location.state.toUpperCase() !==
        req.user.state.toUpperCase()
    ) {
      throw new ForbiddenException(
        'You can only create polling units in your state',
      );
    }

    return this.electionsService.createPollingUnit(
      createPollingUnitDto,
      req.user._id,
    );
  }

  @Patch('polling-units/:code')
  @UseGuards(TenantAuthenticationGuard)
  @Roles(UserRole.STATE_CHAIRMAN)
  @ApiOperation({ summary: 'Update a polling unit' })
  async updatePollingUnit(
    @Param('code') code: string,
    @Body() updateDto: UpdatePollingUnitDto,
    @Request() req,
  ) {
    // Verify state chairman has permission
    if (req.user.role === UserRole.STATE_CHAIRMAN) {
      const unit = await this.electionsService.getPollingUnitByCode(code);
      if (unit.data.location.state !== req.user.state) {
        throw new ForbiddenException(
          'You can only update polling units in your state',
        );
      }
    }

    return this.electionsService.updatePollingUnit(
      code,
      updateDto,
      req.user._id,
    );
  }

  @Get('polling-units/:state/:lga/:ward')
  async getPollingUnits(
    @Param('state') state: string,
    @Param('lga') lga: string,
    @Param('ward') ward: string,
  ) {
    return this.electionsService.getPollingUnits(state, lga, ward);
  }

  @Post('get-polling-units')
  async getAllPollingUnits(@Body() body: any) {
    return this.electionsService.getAllPollingUnits(body);
  }

  @Get()
  @UseGuards(TenantAuthenticationGuard)
  async getElections(@Query() query: ElectionQueryDto, @Request() req) {
    // Add user scope filtering based on their role/location
    // if (req.user.role === UserRole.STATE_CHAIRMAN) {
    //   query.level = ElectionLevel.STATE;
    //   query.location = req.user.state;
    // }

    return this.electionsService.queryElections(query);
  }

  @Post('elections')
  @UseGuards(TenantAuthenticationGuard)
  async getAllElections(@Body() body: any) {
    return this.electionsService.getAllElections(body);
  }

  @Get(':id')
  @UseGuards(TenantAuthenticationGuard)
  async getElection(@Param('id') id: string) {
    return this.electionsService.getElectionById(id);
  }

  // @Post('register-candidate/:userId/:electionId')
  // @UseGuards(TenantAuthenticationGuard)
  // @Roles(UserRole.STATE_CHAIRMAN)
  // async registerCandidate(
  //   @Body() createCandidateDto: CreateCandidateDto,
  //   @Param('electionId') electionId: string,
  //   @Param('userId') userId: string,
  // ) {
  //   return this.electionsService.registerCandidate(
  //     userId,
  //     electionId,
  //     createCandidateDto,
  //   );
  // }

  @Post(':electionId/candidates')
  @UseGuards(TenantAuthenticationGuard)
  @ApiOperation({ summary: 'Register a candidate for an election' })
  @ApiResponse({
    status: 201,
    description: 'Candidate successfully registered',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Election or user not found' })
  @ApiResponse({ status: 409, description: 'Candidate already exists' })
  async registerCandidate(
    @Body() createCandidateDto: CreateCandidateDto,
    @Param('electionId') electionId: string,
    @Query('userId') userId: string, // Using query parameter instead of path
  ) {
    return this.electionsService.registerCandidate(
      userId,
      electionId,
      createCandidateDto,
    );
  }

  @Patch(':id/archive')
  async archive(@Param('id') id: string) {
    return this.electionsService.updateStatus(id, true);
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string) {
    return this.electionsService.updateStatus(id, false);
  }
  @Patch(':id/archive-pu')
  async archivePU(@Param('id') id: string) {
    return this.electionsService.updatePUStatus(id, true);
  }

  @Patch(':id/restore-pu')
  async restorePU(@Param('id') id: string) {
    return this.electionsService.updatePUStatus(id, false);
  }

  @Patch(':id/archive-candidate')
  async archiveCandidate(@Param('id') id: string) {
    return this.electionsService.updateCandidateStatus(id, true);
  }

  @Patch(':id/restore-candidate')
  async restoreCandidate(@Param('id') id: string) {
    return this.electionsService.updateCandidateStatus(id, false);
  }
}
