import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Election } from './schemas/election.schema';
import { ElectionResult } from './schemas/election-result.schema';
import { PollingUnit } from './schemas/polling-unit.schema';
import { Candidate } from './schemas/candidate.schema';
import { ElectionLevel, ElectionType } from './constants/election.constants';
import { CreateElectionDto } from './dtos/create-election.dto';
import {
  ElectionResultResponseDto,
  SubmitResultDto,
} from './dtos/submit-result.dto';
import { CreateCandidateDto } from './dtos/create-candidate.dto';
import { ElectionQueryDto } from './dtos/election-query.dto';
import {
  CreatePollingUnitDto,
  UpdatePollingUnitDto,
} from './dtos/polling-unit.dto';
import { PROVIDER } from 'src/constant/providers';
import { User } from 'src/users/users.schema';
import { UserNotFoundException } from 'src/common/exception';

@Injectable()
export class ElectionsService {
  constructor(
    @Inject(PROVIDER.ELECTION_MODEL)
    @InjectModel(Election.name)
    private electionModel: Model<Election>,

    @Inject(PROVIDER.ELECTIONRESULT_MODEL)
    @InjectModel(ElectionResult.name)
    private resultModel: Model<ElectionResult>,

    @Inject(PROVIDER.POLLING_UNIT)
    @InjectModel(PollingUnit.name)
    private pollingUnitModel: Model<PollingUnit>,

    @Inject(PROVIDER.CANDIDATE_MODEL)
    @InjectModel(Candidate.name)
    private candidateModel: Model<Candidate>,

    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  // async createElection(createElectionDto: CreateElectionDto) {
  //   try {
  //     // 1. Validate dates
  //     this.validateElectionDates(createElectionDto);

  //     // 2. Validate geographical scope based on election type
  //     this.validateGeographicalScope(createElectionDto);

  //     // 3. Check for duplicate election
  //     await this.checkForDuplicateElection(createElectionDto);

  //     // 4. Normalize data
  //     const normalizedDto = {
  //       ...createElectionDto,
  //       positions: createElectionDto.positions.map((pos) =>
  //         pos.trim().toLowerCase(),
  //       ),
  //       title: createElectionDto.title.trim(),
  //       description: createElectionDto.description?.trim(),
  //       state: createElectionDto.state?.trim(),
  //       lga: createElectionDto.lga?.trim(),
  //       ward: createElectionDto.ward?.trim(),
  //     };

  //     // 5. Create and save election
  //     const election = new this.electionModel(normalizedDto);
  //     const savedElection = await election.save();

  //     // 6. Return success response with populated data
  //     return {
  //       success: true,
  //       message: 'Election created successfully',
  //       data: await this.electionModel.findById(savedElection._id),
  //     };
  //   } catch (error) {
  //     if (
  //       error instanceof ConflictException ||
  //       error instanceof BadRequestException
  //     ) {
  //       throw error;
  //     }

  //     // Log unexpected errors for debugging
  //     console.error('Error creating election:', error);
  //     throw new InternalServerErrorException(
  //       'Failed to create election. Please try again later.',
  //     );
  //   }
  // }

  // private validateElectionDates(createElectionDto: CreateElectionDto) {
  //   const now = new Date();
  //   const startDate = new Date(createElectionDto.startDate);
  //   const endDate = new Date(createElectionDto.endDate);
  //   const regStart = new Date(createElectionDto.candidateRegistrationStart);
  //   const regEnd = new Date(createElectionDto.candidateRegistrationEnd);

  //   // Check if dates are valid
  //   if (
  //     isNaN(startDate.getTime()) ||
  //     isNaN(endDate.getTime()) ||
  //     isNaN(regStart.getTime()) ||
  //     isNaN(regEnd.getTime())
  //   ) {
  //     throw new BadRequestException('Invalid date format provided');
  //   }

  //   // Check if start date is in the future
  //   if (startDate <= now) {
  //     throw new BadRequestException(
  //       'Election start date must be in the future',
  //     );
  //   }

  //   // Check if end date is after start date
  //   if (endDate <= startDate) {
  //     throw new BadRequestException(
  //       'Election end date must be after start date',
  //     );
  //   }

  //   // Check if registration period is valid
  //   if (regEnd >= startDate) {
  //     throw new BadRequestException(
  //       'Candidate registration must end before election starts',
  //     );
  //   }

  //   if (regEnd <= regStart) {
  //     throw new BadRequestException(
  //       'Registration end date must be after registration start date',
  //     );
  //   }

  //   // Check if registration start is in the future
  //   if (regStart <= now) {
  //     throw new BadRequestException(
  //       'Registration start date must be in the future',
  //     );
  //   }
  // }

  // private validateGeographicalScope(createElectionDto: CreateElectionDto) {
  //   const { type, state, lga, ward } = createElectionDto;

  //   switch (type) {
  //     case ElectionType.OFF_CIRCLE_GUBERNATORIAL:
  //       if (!state) {
  //         throw new BadRequestException(
  //           'State is required for off-cycle gubernatorial elections',
  //         );
  //       }
  //       // Clear lower levels for state-level elections
  //       if (lga || ward) {
  //         throw new BadRequestException(
  //           'LGA and Ward should not be specified for state-level elections',
  //         );
  //       }
  //       break;

  //     case ElectionType.LOCAL_GOVERNMENT:
  //       if (!state || !lga) {
  //         throw new BadRequestException(
  //           'State and LGA are required for local government elections',
  //         );
  //       }
  //       // Clear ward for LGA-level elections
  //       if (ward) {
  //         throw new BadRequestException(
  //           'Ward should not be specified for LGA-level elections',
  //         );
  //       }
  //       break;

  //     case ElectionType.PRIMARY:
  //     case ElectionType.GENERAL:
  //     case ElectionType.BYE_ELECTION:
  //     case ElectionType.RE_RUN:
  //     case ElectionType.SUPPLEMENTARY:
  //       // National elections shouldn't have location specifics
  //       if (state || lga || ward) {
  //         throw new BadRequestException(
  //           'State, LGA, and Ward should not be specified for national elections',
  //         );
  //       }
  //       break;

  //     default:
  //       throw new BadRequestException('Invalid election type');
  //   }
  // }

  // private async checkForDuplicateElection(
  //   createElectionDto: CreateElectionDto,
  // ) {
  //   const { title, type, startDate, state, lga } = createElectionDto;

  //   const query: any = {
  //     title: new RegExp(`^${title.trim()}$`, 'i'), // Case-insensitive match
  //     type,
  //     startDate: { $gte: new Date(startDate).setHours(0, 0, 0, 0) },
  //   };

  //   // Add location to duplicate check for regional elections
  //   if (state) query.state = state;
  //   if (lga) query.lga = lga;

  //   const existingElection = await this.electionModel.findOne(query);

  //   if (existingElection) {
  //     const electionType = type
  //       .split('_')
  //       .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  //       .join(' ');

  //     throw new ConflictException(
  //       `An ${electionType} election with the title "${title}" already exists ` +
  //         `around the same time${state ? ` in ${state}` : ''}${lga ? `, ${lga}` : ''}.`,
  //     );
  //   }
  // }

  async createElection(createElectionDto: CreateElectionDto) {
    try {
      // 1. Validate dates
      this.validateElectionDates(createElectionDto);

      // 2. Validate geographical scope based on election type and level
      this.validateGeographicalScope(createElectionDto);

      // 3. Check for duplicate election
      await this.checkForDuplicateElection(createElectionDto);

      // 4. Normalize data
      const normalizedDto = {
        ...createElectionDto,
        positions: createElectionDto.positions.map((pos) =>
          pos.trim().toLowerCase(),
        ),
        title: createElectionDto.title.trim(),
        description: createElectionDto.description?.trim(),
        state: createElectionDto.state?.trim(),
        // Remove LGA and ward normalization since they're not part of election creation
        country: 'Nigeria', // Set default country
      };

      // 5. Create and save election
      const election = new this.electionModel(normalizedDto);
      const savedElection = await election.save();

      // 6. Return success response with populated data
      return {
        success: true,
        message: 'Election created successfully',
        data: await this.electionModel.findById(savedElection._id),
      };
    } catch (error) {
      // if (
      //   error instanceof ConflictException ||
      //   error instanceof BadRequestException
      // ) {
      //   throw error;
      // }
      if (error.code === 11000) {
        throw new ConflictException('Duplicate election detected.');
      }
      throw error;

      // Log unexpected errors for debugging
      // console.error('Error creating election:', error);
      // throw new InternalServerErrorException(
      //   'Failed to create election. Please try again later.',
      // );
    }
  }

  private validateElectionDates(createElectionDto: CreateElectionDto) {
    const now = new Date();
    const startDate = new Date(createElectionDto.startDate);
    const endDate = new Date(createElectionDto.endDate);
    const regStart = new Date(createElectionDto.candidateRegistrationStart);
    const regEnd = new Date(createElectionDto.candidateRegistrationEnd);

    // Check if dates are valid
    if (
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime()) ||
      isNaN(regStart.getTime()) ||
      isNaN(regEnd.getTime())
    ) {
      throw new BadRequestException('Invalid date format provided');
    }

    // Check if start date is in the future
    if (startDate <= now) {
      throw new BadRequestException(
        'Election start date must be in the future',
      );
    }

    // Check if end date is after start date
    if (endDate <= startDate) {
      throw new BadRequestException(
        'Election end date must be after start date',
      );
    }

    // Check if registration period is valid
    if (regEnd >= startDate) {
      throw new BadRequestException(
        'Candidate registration must end before election starts',
      );
    }

    if (regEnd <= regStart) {
      throw new BadRequestException(
        'Registration end date must be after registration start date',
      );
    }

    // Check if registration start is in the future
    if (regStart <= now) {
      throw new BadRequestException(
        'Registration start date must be in the future',
      );
    }
  }

  private validateGeographicalScope(createElectionDto: CreateElectionDto) {
    const { type, level, state } = createElectionDto;

    // Validate based on election type
    switch (type) {
      case ElectionType.OFF_CIRCLE_GUBERNATORIAL:
        if (!state) {
          throw new BadRequestException(
            'State is required for off-cycle gubernatorial elections',
          );
        }
        if (level !== 'state') {
          throw new BadRequestException(
            'Off-cycle gubernatorial elections must be at state level',
          );
        }
        break;

      case ElectionType.LOCAL_GOVERNMENT:
        if (!state) {
          throw new BadRequestException(
            'State is required for local government elections',
          );
        }
        if (level !== 'state') {
          throw new BadRequestException(
            'Local government elections must be at state level',
          );
        }
        break;

      case ElectionType.PRIMARY:
      case ElectionType.GENERAL:
      case ElectionType.BYE_ELECTION:
      case ElectionType.RE_RUN:
      case ElectionType.SUPPLEMENTARY:
        // National elections shouldn't have state specified
        if (state) {
          throw new BadRequestException(
            'State should not be specified for national elections',
          );
        }
        if (level !== 'national') {
          throw new BadRequestException(
            'National elections must be at national level',
          );
        }
        break;

      default:
        throw new BadRequestException('Invalid election type');
    }

    // Additional level-based validation
    if (level === 'state' && !state) {
      throw new BadRequestException(
        'State is required for state-level elections',
      );
    }
  }

  private async checkForDuplicateElection(
    createElectionDto: CreateElectionDto,
  ) {
    const { title, type, level, startDate, state } = createElectionDto;

    const query: any = {
      // title: new RegExp(`^${title.trim()}$`, 'i'), // Case-insensitive match
      type,
      level,
      startDate: { $gte: new Date(startDate).setHours(0, 0, 0, 0) },
    };

    // Add state to duplicate check for state-level elections
    if (state) {
      query.state = state;
    }

    const existingElection = await this.electionModel.findOne(query);

    if (existingElection) {
      const electionType = type
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      throw new ConflictException(
        // `An ${electionType} election with the title "${title}" already exists ` +
        //   `around the same time${state ? ` in ${state}` : ''}.`,
        `A ${electionType} election already exists at this level, state, and start date.`,
      );
    }
  }

  async submitResult(
    dto: SubmitResultDto,
    userId: string,
    electionId: string,
  ): Promise<ElectionResultResponseDto> {
    // Normalize polling unit code
    const pollingUnitCode = dto.pollingUnitCode.toUpperCase().trim();

    //   // 1. Find the polling unit
    const pollingUnit = await this.pollingUnitModel.findOne({
      'location.pollingUnitCode': pollingUnitCode,
    });

    if (!pollingUnit) {
      throw new NotFoundException('Polling unit not found');
    }

    // 2. Validate the election and position
    const election = await this.electionModel.findById(electionId);
    if (!election) {
      throw new NotFoundException('Election not found');
    }

    if (!election.positions.includes(dto.position.toLowerCase())) {
      throw new BadRequestException(
        `Position ${dto.position} is not valid for this election`,
      );
    }

    // 3. Validate we have either candidateResults or candidateId
    const hasCandidateResults =
      dto.candidateResults && Object.keys(dto.candidateResults).length > 0;
    const isSingleCandidate = !!dto.candidateId;

    if (!hasCandidateResults && !isSingleCandidate) {
      throw new BadRequestException(
        'Either candidateId or candidateResults must be provided',
      );
    }

    if (isSingleCandidate && hasCandidateResults) {
      throw new BadRequestException(
        'Cannot provide both candidateId and candidateResults - choose one submission method',
      );
    }

    // 4. Validate candidates
    if (isSingleCandidate) {
      // Single candidate validation
      const candidate = await this.candidateModel.findById(dto.candidateId);
      if (!candidate) {
        throw new NotFoundException('Candidate not found');
      }
      if (candidate.electionId.toString() !== electionId) {
        throw new BadRequestException(
          'Candidate does not belong to this election',
        );
      }
    } else {
      // Multiple candidates validation
      const candidateIds = Object.keys(dto.candidateResults);
      const candidates = await this.candidateModel.find({
        _id: { $in: candidateIds },
        electionId: new Types.ObjectId(electionId),
      });

      if (candidates.length !== candidateIds.length) {
        const foundIds = candidates.map((c) => c._id.toString());
        const missingIds = candidateIds.filter((id) => !foundIds.includes(id));
        throw new NotFoundException(
          `Some candidates not found or don't belong to this election: ${missingIds.join(', ')}`,
        );
      }
    }

    // 5. Check for existing results
    const existingQuery = {
      electionId: new Types.ObjectId(electionId),
      position: dto.position,
      'location.pollingUnitCode': pollingUnitCode,
    };

    const existingResult = await this.resultModel.findOne(existingQuery);

    if (existingResult) {
      throw new ConflictException(
        `Result for ${isSingleCandidate ? 'this candidate' : 'these candidates'} at this polling unit has already been submitted`,
      );
    }

    // 6. Validate votes
    if (dto.votesCast > pollingUnit.accreditedVoters) {
      throw new BadRequestException(
        'Votes cast cannot exceed accredited voters',
      );
    }

    if (dto.votesCast !== dto.validVotes + dto.rejectedVotes) {
      throw new BadRequestException(
        'Votes cast must equal the sum of valid votes and rejected votes',
      );
    }
    if (dto.validVotes < 0 || dto.rejectedVotes < 0) {
      throw new BadRequestException(
        'Valid and rejected votes cannot be negative',
      );
    }
    if (dto.votesCast < dto.validVotes + dto.rejectedVotes) {
      throw new BadRequestException(
        'Votes cast cannot be less than the sum of valid and rejected votes',
      );
    }
    // Validate candidate votes

    if (isSingleCandidate) {
      if (!dto.votes) {
        throw new BadRequestException(
          'Votes are required for single candidate submission',
        );
      }
      if (dto.votes > dto.votesCast) {
        throw new BadRequestException(
          'Votes for candidate cannot exceed total votes cast',
        );
      }
    } else {
      const totalCandidateVotes = Object.values(dto.candidateResults).reduce(
        (sum, votes) => sum + votes,
        0,
      );
      if (totalCandidateVotes > dto.votesCast) {
        throw new BadRequestException(
          'Sum of candidate votes cannot exceed total votes cast',
        );
      }
      if (totalCandidateVotes !== dto.validVotes) {
        throw new BadRequestException(
          'Sum of candidate votes must equal valid votes',
        );
      }
    }

    // 7. Normalize location
    const normalizedLocation = {
      state: pollingUnit.location.state.toUpperCase(),
      lga: pollingUnit.location.lga.toUpperCase(),
      ward: pollingUnit.location.ward.toUpperCase(),
      pollingUnitCode: pollingUnit.location.pollingUnitCode.toUpperCase(),
    };

    // 8. Create the result document
    const resultData: any = {
      electionId: new Types.ObjectId(electionId),
      submittedBy: new Types.ObjectId(userId),
      position: dto.position,
      location: normalizedLocation,
      registeredVoters: pollingUnit.registeredVoters,
      accreditedVoters: pollingUnit.accreditedVoters,
      votesCast: dto.votesCast,
      validVotes: dto.validVotes,
      rejectedVotes: dto.rejectedVotes,
      images: dto.images || [],
      videos: dto.videos || [],
      documents: dto.documents || [],
      notes: dto.notes,
      isApproved: false,
    };

    if (isSingleCandidate) {
      resultData.candidateId = new Types.ObjectId(dto.candidateId);
      resultData.votes = dto.votes;
    } else {
      resultData.candidateResults = new Map(
        Object.entries(dto.candidateResults),
      );
    }

    const result = new this.resultModel(resultData);
    await result.save();

    return this.mapToResponseDto(result);
  }

  private mapToResponseDto(result: ElectionResult): ElectionResultResponseDto {
    return {
      id: result._id.toString(),
      electionId: result.electionId.toString(),
      location: result.location,
      position: result.position,
      candidateId: result.candidateId,
      submittedBy: result.submittedBy.toString(),
      registeredVoters: result.registeredVoters,
      accreditedVoters: result.accreditedVoters,
      votesCast: result.votesCast,
      validVotes: result.validVotes,
      rejectedVotes: result.rejectedVotes,
      votes: result.votes, // For single candidate
      candidateResults: result.candidateResults
        ? Object.fromEntries(result.candidateResults)
        : undefined,
      images: result.images,
      videos: result.videos,
      documents: result.documents,
      notes: result.notes,
      isApproved: result.isApproved,
    };
  }

  async getResultsWithTotals(
    electionId: string,
    level: ElectionLevel,
    locationId: string,
    page: number = 1,
    limit: number = 1,
  ) {
    // 1. Get results with expanded candidateResults
    const results = await this.getResults(
      electionId,
      level,
      locationId,
      page,
      limit,
    );

    // 2. Extract all unique candidate IDs
    const candidateIds = this.extractAllCandidateIds(results);

    // 3. Update candidate totals in database
    await this.updateCandidateTotals(electionId, candidateIds);
    // 4. Get total count for pagination
    const total = await this.resultModel.countDocuments({
      electionId: new Types.ObjectId(electionId),
      isApproved: true,
      ...(level === ElectionLevel.STATE && {
        'location.state': { $regex: `^${locationId}$`, $options: 'i' },
      }),
      ...(level === ElectionLevel.LGA && {
        'location.lga': { $regex: `^${locationId}$`, $options: 'i' },
      }),
      ...(level === ElectionLevel.WARD && {
        'location.ward': { $regex: `^${locationId}$`, $options: 'i' },
      }),
      ...(level === ElectionLevel.POLLING_UNIT && {
        'location.pollingUnitCode': locationId.toUpperCase().trim(),
      }),
    });

    // return results;
    return {
      results: results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private extractAllCandidateIds(results: any[]): string[] {
    const ids = new Set<string>();

    results.forEach((result) => {
      if (result.candidateId) {
        ids.add(result.candidateId.toString());
      }

      if (result.candidateResults) {
        Object.keys(result.candidateResults).forEach((candidateId) => {
          ids.add(candidateId);
        });
      }
    });

    return Array.from(ids);
  }

  async updateCandidateTotals(electionId: string, candidateIds: string[]) {
    // Convert string IDs to ObjectIds
    const candidateObjectIds = candidateIds.map((id) => new Types.ObjectId(id));

    // Calculate totals from approved results
    const totals = await this.resultModel.aggregate([
      {
        $match: {
          electionId: new Types.ObjectId(electionId),
          isApproved: true,
          $or: [
            { candidateId: { $in: candidateObjectIds } },
            {
              $expr: {
                $gt: [{ $size: { $objectToArray: '$candidateResults' } }, 0],
              },
            },
          ],
        },
      },
      {
        $project: {
          singleCandidate: {
            candidateId: '$candidateId',
            votes: '$votes',
          },
          multipleCandidates: {
            $map: {
              input: { $objectToArray: '$candidateResults' },
              as: 'cr',
              in: {
                candidateId: { $toObjectId: '$$cr.k' },
                votes: '$$cr.v',
              },
            },
          },
        },
      },
      { $unwind: '$multipleCandidates' },
      {
        $replaceRoot: {
          newRoot: {
            $cond: [
              { $ifNull: ['$multipleCandidates', false] },
              '$multipleCandidates',
              '$singleCandidate',
            ],
          },
        },
      },
      {
        $group: {
          _id: '$candidateId',
          totalVotes: { $sum: '$votes' },
        },
      },
    ]);

    // Prepare bulk update operations
    const bulkOps = totals.map((total) => ({
      updateOne: {
        filter: {
          _id: total._id,
          electionId: new Types.ObjectId(electionId),
        },
        update: {
          $set: {
            totalVotes: total.totalVotes,
            updatedAt: new Date(),
          },
        },
      },
    }));

    if (bulkOps.length > 0) {
      await this.candidateModel.bulkWrite(bulkOps);
    }

    return totals;
  }

  async getResults(
    electionId: string,
    level: ElectionLevel,
    locationId: string,
    page: number = 1,
    limit: number = 1,
  ) {
    const matchStage: any = {
      electionId: new Types.ObjectId(electionId),
      isApproved: true,
    };

    // Location filtering
    switch (level) {
      case ElectionLevel.STATE:
        matchStage['location.state'] = {
          $regex: `^${locationId}$`,
          $options: 'i',
        };
        break;
      case ElectionLevel.LGA:
        matchStage['location.lga'] = {
          $regex: `^${locationId}$`,
          $options: 'i',
        };
        break;
      case ElectionLevel.WARD:
        matchStage['location.ward'] = {
          $regex: `^${locationId}$`,
          $options: 'i',
        };
        break;
      case ElectionLevel.POLLING_UNIT:
        matchStage['location.pollingUnitCode'] = locationId
          .toUpperCase()
          .trim();
        break;
    }

    // Add pagination stages
    const skip = (page - 1) * limit;

    // First get base results without user data
    const results = await this.resultModel.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          candidateResultsArray: {
            $map: {
              input: { $objectToArray: { $ifNull: ['$candidateResults', {}] } },
              as: 'cr',
              in: {
                k: '$$cr.k',
                v: '$$cr.v',
                candidateId: { $toObjectId: '$$cr.k' },
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'candidates',
          let: { candidateId: '$candidateId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$candidateId'] },
                electionId: new Types.ObjectId(electionId),
              },
            },
            { $project: { _id: 1, party: 1, userId: 1, totalVotes: 1 } },
          ],
          as: 'candidateData',
        },
      },
      { $unwind: { path: '$candidateData', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'candidates',
          let: { candidateIds: '$candidateResultsArray.candidateId' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$_id', '$$candidateIds'] },
                electionId: new Types.ObjectId(electionId),
              },
            },
            { $project: { _id: 1, party: 1, userId: 1, totalVotes: 1 } },
          ],
          as: 'candidateResultsCandidates',
        },
      },
      {
        $project: {
          _id: 1,
          electionId: 1,
          position: 1,
          votes: 1,
          location: 1,
          candidateId: 1,
          submittedBy: 1,
          registeredVoters: 1,
          accreditedVoters: 1,
          votesCast: 1,
          validVotes: 1,
          rejectedVotes: 1,
          candidateResults: {
            $arrayToObject: {
              $map: {
                input: '$candidateResultsArray',
                as: 'cr',
                in: { k: '$$cr.k', v: '$$cr.v' },
              },
            },
          },
          images: 1,
          videos: 1,
          isApproved: 1,
          notes: 1,
          createdAt: 1,
          updatedAt: 1,
          candidateData: 1,
          candidateResultsCandidates: 1,
          candidateResultsArray: 1,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    // Get all unique user IDs for lookup

    const userIds = [
      ...new Set(
        results.flatMap((r) =>
          [
            r.submittedBy?.toString(),
            r.candidateData?.userId?.toString(),
            ...(r.candidateResultsCandidates?.map((c) =>
              c.userId?.toString(),
            ) || []),
          ].filter(Boolean),
        ),
      ),
    ]
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    // Fetch users from master DB
    const users = await this.userModel
      .find({
        _id: { $in: userIds },
        // tenantId: tenantId, // Dynamic tenantId
      })
      .lean();

    // Create user map for quick lookup
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    // Enrich results with user data
    return results.map((r) => {
      const getUser = (id: any) =>
        id ? userMap.get(id.toString()) || null : null;

      return {
        ...r,
        candidate: r.candidateData
          ? {
              _id: r.candidateData._id,
              party: r.candidateData.party,
              userId: r.candidateData.userId,
              totalVotes: r.candidateData.totalVotes,
              user: getUser(r.candidateData.userId),
            }
          : null,
        candidateResultsDetails:
          r.candidateResultsCandidates?.map((c) => ({
            candidateId: c._id,
            party: c.party,
            userId: c.userId,
            totalVotes: c.totalVotes,
            user: getUser(c.userId),
            votes:
              r.candidateResultsArray.find(
                (cra) => cra.candidateId.toString() === c._id.toString(),
              )?.v || 0,
          })) || [],
        submitterInfo: getUser(r.submittedBy),
        users: Object.fromEntries(
          users.map((u) => [
            u._id.toString(),
            {
              _id: u._id,
              firstname: u.firstname,
              lastname: u.lastname,
              email: u.email,
              phone: u.phone,
            },
          ]),
        ),
      };
    });
    return results;
  }

  async approveResult(resultId: string, userId: string) {
    return this.resultModel.findByIdAndUpdate(
      resultId,
      { isApproved: true, approvedBy: userId },
      { new: true },
    );
  }
  async findById(id: string): Promise<ElectionResult> {
    const electionResult = await this.resultModel.findById(id);
    if (!electionResult) {
      throw new NotFoundException();
    }
    return electionResult;
  }

  // async registerCandidate(
  //   userId: string,
  //   electionId: string,
  //   createCandidateDto: CreateCandidateDto,
  // ) {
  //   const user = await this.userModel.findOne({ _id: userId });

  //   if (!user) {
  //     throw new NotFoundException(`User not found`);
  //   }

  //   const election = await this.electionModel.findOne({ _id: electionId });

  //   if (!election) {
  //     throw new NotFoundException(`Election not found`);
  //   }

  //   if (
  //     !election.positions.includes(createCandidateDto.position.toLowerCase())
  //   ) {
  //     throw new BadRequestException(
  //       `Position ${createCandidateDto.position} is not valid for this election`,
  //     );
  //   }
  //   // Validate that user's party matches the candidate's party
  //   if (user.party.toUpperCase() !== createCandidateDto.party.toUpperCase()) {
  //     throw new BadRequestException(
  //       `User's party (${user.party}) does not match the candidate party (${createCandidateDto.party})`,
  //     );
  //   }

  //   // Check if this user is already registered as a candidate in this election
  //   const candidateExist = await this.candidateModel.findOne({
  //     userId: new Types.ObjectId(userId),
  //     electionId: new Types.ObjectId(electionId),
  //   });

  //   if (candidateExist) {
  //     throw new ConflictException(
  //       'User is already registered as a candidate in this election',
  //     );
  //   }

  //   // Check if this party already has a candidate in this election
  //   const partyExist = await this.candidateModel.findOne({
  //     party: createCandidateDto.party,
  //     electionId: new Types.ObjectId(electionId),
  //   });

  //   if (partyExist) {
  //     throw new ConflictException(
  //       'This party already has a candidate in this election',
  //     );
  //   }

  //   const candidate = new this.candidateModel({
  //     ...createCandidateDto,
  //     electionId: new Types.ObjectId(electionId),
  //     userId: new Types.ObjectId(userId),
  //   });

  //   return candidate.save();
  // }
  async registerCandidate(
    userId: string,
    electionId: string,
    createCandidateDto: CreateCandidateDto,
  ) {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    if (!Types.ObjectId.isValid(electionId)) {
      throw new BadRequestException('Invalid election ID format');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const election = await this.electionModel.findById(electionId);
    if (!election) {
      throw new NotFoundException(`Election with ID ${electionId} not found`);
    }

    // Check if election is still open for candidate registration
    if (election.candidateRegistrationEnd < new Date()) {
      throw new BadRequestException(
        'Candidate registration has ended for this election',
      );
    }

    // Validate position
    const normalizedPosition = createCandidateDto.position.toLowerCase();
    if (!election.positions.includes(normalizedPosition)) {
      throw new BadRequestException(
        `Position "${createCandidateDto.position}" is not valid for this election. Valid positions: ${election.positions.join(', ')}`,
      );
    }

    // Validate that user's party matches the candidate's party
    if (user.party.toUpperCase() !== createCandidateDto.party.toUpperCase()) {
      throw new BadRequestException(
        `User's party (${user.party}) does not match the candidate party (${createCandidateDto.party})`,
      );
    }

    // Validate location fields based on election type
    this.validateLocationFields(
      createCandidateDto.electionType,
      createCandidateDto,
    );

    // ✅ Validate user’s location eligibility based on election.level
    this.validateUserLocationEligibility(user, election);

    // Check if this user is already registered as a candidate in this election
    const candidateExist = await this.candidateModel.findOne({
      userId: new Types.ObjectId(userId),
      electionId: new Types.ObjectId(electionId),
    });

    if (candidateExist) {
      throw new ConflictException(
        'User is already registered as a candidate in this election',
      );
    }

    // Check if this party already has a candidate for this position in this election
    const partyCandidateExist = await this.candidateModel.findOne({
      electionId: new Types.ObjectId(electionId),
      position: normalizedPosition,
      party: createCandidateDto.party.toUpperCase(),
    });

    if (partyCandidateExist) {
      throw new ConflictException(
        `This party already has a candidate for the ${createCandidateDto.position} position in this election`,
      );
    }

    const candidate = new this.candidateModel({
      ...createCandidateDto,
      position: normalizedPosition,
      party: createCandidateDto.party.toUpperCase(),
      electionId: new Types.ObjectId(electionId),
      userId: new Types.ObjectId(userId),
      status: 'pending',
    });

    await candidate.save();

    // Populate user details in response
    return this.candidateModel
      .findById(candidate._id)
      .populate('userId', 'firstname lastname email phoneNumber')
      .populate('electionId', 'title startDate endDate');
  }
  private validateLocationFields(
    electionType: ElectionType,
    dto: CreateCandidateDto,
  ) {
    switch (electionType) {
      case ElectionType.OFF_CIRCLE_GUBERNATORIAL:
        if (!dto.state) {
          throw new BadRequestException(
            'State is required for off-cycle gubernatorial elections',
          );
        }
        break;

      case ElectionType.LOCAL_GOVERNMENT:
        if (!dto.state || !dto.lga) {
          throw new BadRequestException(
            'State and LGA are required for local government elections',
          );
        }
        break;

      case ElectionType.PRIMARY:
      case ElectionType.GENERAL:
      case ElectionType.BYE_ELECTION:
      case ElectionType.RE_RUN:
      case ElectionType.SUPPLEMENTARY:
        // These election types don't require location fields
        break;

      default:
        throw new BadRequestException('Invalid election type');
    }
  }

  private validateUserLocationEligibility(user: any, election: any) {
    console.log('Validating user location eligibility...', user, election);
    switch (election.level) {
      case ElectionLevel.NATIONAL:
        // ✅ Anyone in Nigeria can contest
        return true;

      case ElectionLevel.STATE:
        if (
          !user.state ||
          user.state.toLowerCase() !== election.state?.toLowerCase()
        ) {
          throw new BadRequestException(
            `Candidate must be from ${election.state} to contest in this election.`,
          );
        }
        break;

      case ElectionLevel.LGA:
        if (
          !user.state ||
          user.state.toLowerCase() !== election.state?.toLowerCase()
        ) {
          throw new BadRequestException(
            `Candidate must be from ${election.state} to contest in this election.`,
          );
        }
        if (
          !user.lga ||
          user.lga.toLowerCase() !== election.lga?.toLowerCase()
        ) {
          throw new BadRequestException(
            `Candidate must be from ${election.lga} LGA to contest in this election.`,
          );
        }
        break;

      case ElectionLevel.WARD:
        if (
          !user.state ||
          user.state.toLowerCase() !== election.state?.toLowerCase()
        ) {
          throw new BadRequestException(
            `Candidate must be from ${election.state} to contest in this election.`,
          );
        }
        if (
          !user.lga ||
          user.lga.toLowerCase() !== election.lga?.toLowerCase()
        ) {
          throw new BadRequestException(
            `Candidate must be from ${election.lga} LGA to contest in this election.`,
          );
        }
        if (
          !user.ward ||
          user.ward.toLowerCase() !== election.ward?.toLowerCase()
        ) {
          throw new BadRequestException(
            `Candidate must be from ${election.ward} Ward to contest in this election.`,
          );
        }
        break;

      default:
        throw new BadRequestException('Invalid election level');
    }
  }
  async getElectionCandidatesDT(electionId: string, params: any) {
    // Check if electionId needs to be converted to ObjectId
    const mongoose = require('mongoose');
    let queryElectionId = electionId;

    try {
      // Try to convert to ObjectId if it's a string
      if (typeof electionId === 'string') {
        queryElectionId = new mongoose.Types.ObjectId(electionId);
      }
    } catch (error) {
      console.log('Could not convert electionId to ObjectId, using as string');
    }

    const { start, length, search, order, columns, draw, position, deleted } =
      params;

    const query: any = { electionId: queryElectionId };

    if (deleted === 'true') query.deleted = true;
    else if (deleted === 'false') query.deleted = false;
    // if undefined → default to only active
    else query.deleted = false;

    // 🔹 Extra filter: position (from dropdown)
    if (position && position !== 'all') {
      query.position = position;
    }

    // console.log('Final query:', query);

    // 📊 Counts
    const totalRecords = await this.candidateModel.countDocuments({
      electionId: queryElectionId,
    });
    const filteredRecords = await this.candidateModel.countDocuments(query);

    // 🔍 Search filter
    if (search?.value) {
      query.$or = [
        { firstname: { $regex: search.value, $options: 'i' } },
        { lastname: { $regex: search.value, $options: 'i' } },
        { position: { $regex: search.value, $options: 'i' } },
        { party: { $regex: search.value, $options: 'i' } },
      ];
    }
    // 🔽 Sorting
    let sort: any = {};
    if (order && order.length > 0) {
      const columnIndex = order[0].column;
      const columnName = columns[columnIndex].data;
      const dir = order[0].dir === 'asc' ? 1 : -1;

      if (columnName.includes('userId.')) {
        sort[columnName] = dir;
      } else {
        sort[columnName] = dir;
      }
    }

    // ⏳ Pagination
    const data = await this.candidateModel
      .find(query)
      .populate({
        path: 'userId',
        select: 'firstname lastname  imageUrl middlename passportPhoto',
      })
      .sort(sort)
      .skip(Number(start))
      .limit(Number(length));

    // console.log('Found data:', JSON.stringify(data, null, 2));

    // ✅ Response for DataTables
    return {
      draw: Number(draw),
      recordsTotal: totalRecords,
      recordsFiltered: filteredRecords,
      data: data.map((item) => ({
        ...item.toObject(), // This includes all fields including populated ones
      })),
    };
  }

  // async queryElections(query: ElectionQueryDto) {
  //   const {
  //     level,
  //     state,
  //     type,
  //     status,
  //     position,
  //     startDate,
  //     endDate,
  //     page,
  //     limit,
  //     search,
  //     sortBy,
  //     sortOrder,
  //   } = query;

  //   const filter: any = {};

  //   if (level) filter.level = level;
  //   if (state) filter.state = state;

  //   if (type) filter.type = type;
  //   if (status) filter.status = status;
  //   if (position) filter.positions = { $in: [position] };

  //   if (startDate || endDate) {
  //     filter.startDate = {};
  //     if (startDate) filter.startDate.$gte = new Date(startDate);
  //     if (endDate) filter.startDate.$lte = new Date(endDate);
  //   }

  //   if (search) {
  //     filter.$or = [
  //       { title: { $regex: search, $options: 'i' } },
  //       { description: { $regex: search, $options: 'i' } },
  //     ];
  //   }

  //   console.log(filter);

  //   return (
  //     this.electionModel
  //       .find(filter)
  //       .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
  //       // .sort({ startDate: -1 })
  //       .limit(2)
  //       .exec()
  //   );
  // }

  // ...existing code...
  async queryElections(query: ElectionQueryDto) {
    const {
      level,
      state,
      type,
      status,
      position,
      startDate,
      endDate,
      page = 1,
      limit = 1,
      search,
      sortBy = 'startDate',
      sortOrder = 'desc',
    } = query;

    const filter: any = {};

    if (level) filter.level = level;
    if (state) filter.state = state;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (position) filter.positions = { $in: [position] };

    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      this.electionModel
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.electionModel.countDocuments(filter),
    ]);

    // return results;
    return {
      results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getElectionById(id: string) {
    const election = await this.electionModel.findById(id).exec();

    if (!election) {
      throw new NotFoundException(`Election with ID ${id} not found`);
    }

    return election;
  }

  async getAllElections(params: any) {
    const { start, length, search, order, columns, draw, deleted } = params;

    const query: any = {};
    if (deleted === 'true') query.deleted = true;
    else if (deleted === 'false') query.deleted = false;
    // if undefined → default to only active
    else query.deleted = false;

    // 🔍 Search filter
    if (search?.value) {
      query.$or = [
        { title: { $regex: search.value, $options: 'i' } },
        { state: { $regex: search.value, $options: 'i' } },
        { position: { $regex: search.value, $options: 'i' } },
        { level: { $regex: search.value, $options: 'i' } },
        { type: { $regex: search.value, $options: 'i' } },
      ];
    }

    // 📊 Total records
    const totalRecords = await this.electionModel.countDocuments({});
    const filteredRecords = await this.electionModel.countDocuments(query);

    // 🔽 Sorting
    let sort: any = {};
    if (order && order.length > 0) {
      const columnName = columns[order[0].column].data;
      const dir = order[0].dir === 'asc' ? 1 : -1;
      sort[columnName] = dir;
    }

    // ⏳ Pagination + Fetch
    const data = await this.electionModel
      .find(query)
      .sort(sort)
      .skip(Number(start))
      .limit(Number(length));

    // ✅ DataTables JSON response
    return {
      draw: Number(draw),
      recordsTotal: totalRecords,
      recordsFiltered: filteredRecords,
      data,
    };
  }
  /**
   * Get polling units for a specific location
   * @param state State name or code
   * @param lga Local Government Area name
   * @param ward Ward name
   * @returns Array of polling units with details
   */
  async getPollingUnits(
    state: string,
    lga: string,
    ward: string,
  ): Promise<{ success: boolean; count: number; data: any[] }> {
    // Input validation
    if (!state || !lga || !ward) {
      throw new Error('State, LGA, and Ward parameters are required');
    }

    try {
      const pollingUnits = await this.pollingUnitModel
        .find({
          // 'location.state': state.toUpperCase(),
          'location.state': { $regex: new RegExp(state, 'i') },
          'location.lga': { $regex: new RegExp(lga, 'i') },
          'location.ward': { $regex: new RegExp(ward, 'i') },
        })
        .select('-__v -_id')
        .sort({ 'location.pollingUnitCode': 1 })
        .lean();

      return {
        success: true,
        count: pollingUnits.length,
        data: pollingUnits.map((unit) => ({
          ...unit,
          location: {
            ...unit.location,
            pollingUnitCode: unit.location.pollingUnitCode.toUpperCase(),
          },
        })),
      };
    } catch (error) {
      throw new Error(`Failed to fetch polling units: ${error.message}`);
    }
  }

  async getAllPollingUnits(params: any) {
    const { start, length, search, order, columns, draw, deleted } = params;

    const query: any = {};
    if (deleted === 'true') query.deleted = true;
    else if (deleted === 'false') query.deleted = false;
    // if undefined → default to only active
    else query.deleted = false;

    // 🔍 Search filter
    if (search?.value) {
      query.$or = [
        { name: { $regex: search.value, $options: 'i' } },
        { address: { $regex: search.value, $options: 'i' } },
      ];
    }

    // 📊 Total records
    const totalRecords = await this.pollingUnitModel.countDocuments({});
    const filteredRecords = await this.pollingUnitModel.countDocuments(query);

    // 🔽 Sorting
    let sort: any = {};
    if (order && order.length > 0) {
      const columnName = columns[order[0].column].data;
      const dir = order[0].dir === 'asc' ? 1 : -1;
      sort[columnName] = dir;
    }

    // ⏳ Pagination + Fetch
    const data = await this.pollingUnitModel
      .find(query)
      .sort(sort)
      .skip(Number(start))
      .limit(Number(length));

    // ✅ DataTables JSON response
    return {
      draw: Number(draw),
      recordsTotal: totalRecords,
      recordsFiltered: filteredRecords,
      data,
    };
  }

  /**
   * Get a single polling unit by its unique code
   * @param pollingUnitCode Unique polling unit code
   * @returns Polling unit details
   */
  async getPollingUnitByCode(
    pollingUnitCode: string,
  ): Promise<{ success: boolean; data: any }> {
    const unit = await this.pollingUnitModel
      .findOne({
        'location.pollingUnitCode': pollingUnitCode.toUpperCase(),
      })
      .lean();

    if (!unit) {
      throw new Error('Polling unit not found');
    }

    return {
      success: true,
      data: {
        ...unit,
        location: {
          ...unit.location,
          pollingUnitCode: unit.location.pollingUnitCode.toUpperCase(),
        },
      },
    };
  }

  async createPollingUnit(
    createPollingUnitDto: CreatePollingUnitDto,
    userId?: string,
  ): Promise<PollingUnit> {
    // Convert to uppercase for consistency
    const normalizedDto = {
      ...createPollingUnitDto,
      location: {
        state: createPollingUnitDto.location.state.toUpperCase(),
        lga: createPollingUnitDto.location.lga.toUpperCase(),
        ward: createPollingUnitDto.location.ward.toUpperCase(),
        pollingUnitCode:
          createPollingUnitDto.location.pollingUnitCode.toUpperCase(),
      },
    };

    // Check for existing polling unit
    const exists = await this.pollingUnitModel.findOne({
      'location.pollingUnitCode': normalizedDto.location.pollingUnitCode,
    });

    if (exists) {
      throw new ConflictException('Polling unit with this code already exists');
    }

    const pollingUnit = new this.pollingUnitModel({
      ...normalizedDto,
      createdBy: new Types.ObjectId(userId),
      isActive: true,
    });

    return pollingUnit.save();
  }

  async updatePollingUnit(
    code: string,
    updateDto: UpdatePollingUnitDto,
    userId: string,
  ): Promise<PollingUnit> {
    const pollingUnit = await this.pollingUnitModel.findOneAndUpdate(
      { 'location.pollingUnitCode': code.toUpperCase() },
      {
        ...updateDto,
        updatedAt: new Date(),
        updatedBy: userId,
      },
      { new: true },
    );

    if (!pollingUnit) {
      throw new NotFoundException('Polling unit not found');
    }

    return pollingUnit;
  }

  async updateStatus(id: string, deleted: boolean) {
    const updated = await this.electionModel.findByIdAndUpdate(
      id,
      { deleted },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Election not found');
    return updated;
  }

  async updatePUStatus(id: string, deleted: boolean) {
    const updated = await this.pollingUnitModel.findByIdAndUpdate(
      id,
      { deleted },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Election not found');
    return updated;
  }

  async updateCandidateStatus(id: string, deleted: boolean) {
    const updated = await this.candidateModel.findByIdAndUpdate(
      id,
      { deleted },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Election not found');
    return updated;
  }
}
