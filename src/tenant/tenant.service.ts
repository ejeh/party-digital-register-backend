import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tenant } from './tenant.schema'; // Adjust the path as necessary
import { Model, Types } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';
import { CreateCompanyDto } from './create-company.dto';
import { nanoid } from 'nanoid';
import { SignUpDto } from 'src/auth/auth.interface';
import { getOriginHeader } from 'src/auth/auth';
import { User } from 'src/users/users.schema';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly notificationsGateway: NotificationsGateway,
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantModel.findOne({ _id: id });

    return tenant;
  }

  async getTenantBydId(tenantId: string): Promise<Tenant> {
    return await this.tenantModel.findOne({ tenantId }).exec();
  }

  async createCompany(companyData: CreateCompanyDto, req: any) {
    this.logger.log(
      `Creating company with data: ${JSON.stringify(companyData)}`,
    );
    try {
      this.logger.log(
        `Received request to create party: ${JSON.stringify(companyData)}`,
      );

      // Validate input data
      if (!companyData) {
        throw new BadRequestException('Party data is missing in request.');
      }

      if (!companyData.user.email) {
        throw new BadRequestException('User email is missing in request.');
      }

      if (!companyData.party.toLocaleLowerCase()) {
        throw new BadRequestException('Party name is missing in request.');
      }

      if (
        companyData.party.toLocaleLowerCase() !==
        companyData.user.party.toLocaleLowerCase()
      ) {
        this.logger.warn(
          `${companyData.party} does match: ${companyData.user.party}`,
        );
        throw new BadRequestException(
          'The party being registered must match the party you belong to!',
        );
      }

      if (
        companyData.state.toLocaleLowerCase() !==
        companyData.user.state.toLocaleLowerCase()
      ) {
        this.logger.warn(
          `${companyData.state} does match: ${companyData.user.state}`,
        );
        throw new BadRequestException(
          'The state being registered must match the state you belong to!',
        );
      }

      // Check if company name already exists
      const existingCompany = await this.tenantModel
        .findOne({
          party: companyData.party.toLowerCase(),
          state: companyData.state.toLowerCase(),
        })
        .exec();

      this.logger.log(
        `Checking for existing company with party: ${companyData.party.toLocaleLowerCase()}`,
      );
      this.logger.log(
        `Checking for existing company with state: ${companyData.state.toLocaleLowerCase()}`,
      );
      this.logger.log(`Existing company found: ${!!existingCompany}`);

      // If company already exists, throw an error
      if (existingCompany) {
        this.logger.warn(`Party name already exists: ${companyData.party}`);
        throw new BadRequestException(
          'State and Party with this name already exists',
        );
      }

      // Check if user exists
      const user = await this.userService.getUserBymail(companyData.user.email);
      if (user) {
        this.logger.warn(`User ${companyData.user.email} already exists`);
        throw new BadRequestException(
          'User exists and belongs to a company...',
        );
      }

      // Generate tenant ID
      const tenantId = nanoid(12);
      this.logger.log(`Generated tenantId: ${tenantId}`);

      if (!tenantId) {
        throw new Error('Failed to generate tenant ID.');
      }

      // Create tenant secret
      await this.authService.createSecretKeyForNewTenant(tenantId);

      this.logger.log(
        `Signing up user ${companyData.user.email} with tenantId: ${tenantId}`,
      );

      // Create user
      const newUser = await this.authService.signUpUser(
        companyData.user,
        tenantId,
        getOriginHeader(req),
        // 'member',
      );
      this.logger.log(`User signup successful: ${companyData.user.email}`);

      // Create and save tenant
      const tenant = new this.tenantModel({
        party: companyData.party.toLowerCase(),
        state: companyData.state.toLowerCase(),
        logo: companyData.logo || '',
        tenantId,
      });

      // Validate tenant model before saving
      const validationError = tenant.validateSync();
      if (validationError) {
        throw new Error(`Tenant validation failed: ${validationError.message}`);
      }

      const savedTenant = await tenant.save();
      if (!savedTenant) {
        throw new Error('Failed to save tenant to database');
      }

      this.logger.log(
        `Company created successfully: ${companyData.party}, tenantId: ${tenantId}`,
      );
      return newUser;
    } catch (error) {
      this.logger.error(
        `Error creating company: ${error.message}`,
        error.stack,
      );

      // Add specific error handling
      if (
        error.name === 'ValidationError' ||
        error.message.includes('tenant')
      ) {
        this.logger.error('Tenant model validation or save failed', error);
        throw new BadRequestException(
          'Failed to create company: ' + error.message,
        );
      }

      // Re-throw the error if it's already an HTTP exception
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to create company: ' + error.message,
      );
    }
  }

  async addUsersToTenant(tenantId: string, userData: SignUpDto, req: any) {
    try {
      this.logger.log(`Adding user ${userData.email} to tenant ${tenantId}`);

      // Validate if tenant exists
      const tenant = await this.getTenantBydId(tenantId);
      if (!tenant) {
        throw new BadRequestException('Tenant not found');
      }

      if (
        userData.party.toLocaleLowerCase() !== tenant.party.toLocaleLowerCase()
      ) {
        throw new BadRequestException(
          `Only ${tenant.party} members allowed to be registered here!`,
        );
      }
      // Check if user already exists
      const existingUser = await this.userService.getUserBymail(userData.email);
      if (existingUser) {
        this.logger.warn(`User ${userData.email} already exists`);
        throw new BadRequestException('User already exists in another tenant');
      }

      // Register the user under the existing tenant
      const newUser = await this.authService.signUpUser(
        userData,
        tenantId,
        getOriginHeader(req),
        // 'membber', // Default role
      );

      this.logger.log(`Member ${userData.email} added to tenant ${tenantId}`);
      return newUser;
    } catch (error) {
      this.logger.error(
        `Error adding user to tenant ${tenantId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async addUserToTenant(userData: any, req: any) {
    try {
      const party = userData.party?.toLowerCase().trim();
      if (!party) {
        throw new BadRequestException('Party is required');
      }

      this.logger.log(`Fetching tenant by party: ${party}`);

      // Find tenant by party (assuming party is unique)
      const tenant = await this.tenantModel.findOne({
        party: { $regex: new RegExp(`^${party}$`, 'i') },
      });

      if (!tenant) {
        throw new BadRequestException(
          `Tenant for party "${userData.party}" not found`,
        );
      }

      const tenantId = tenant.tenantId;

      // Check if user already exists
      const existingUser = await this.userService.getUserBymail(userData.email);
      if (existingUser) {
        this.logger.warn(`User ${userData.email} already exists`);
        throw new BadRequestException('User already exists in another tenant');
      }

      // Register the user under the existing tenant
      const newUser = await this.authService.signUpUser(
        userData,
        tenantId,
        getOriginHeader(req),
      );

      this.logger.log(`User ${userData.email} added to tenant ${tenantId}`);
      return newUser;
    } catch (error) {
      this.logger.error(`Error adding user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getMemberStats(tenantId: string) {
    const totalRequest = await this.userModel.countDocuments({
      tenantId,
      role: 'member',
    });
    const pendingRequests = await this.userModel.countDocuments({
      tenantId,
      membership_status: 'pending',
    });
    const rejectedRequests = await this.userModel.countDocuments({
      tenantId,
      membership_status: 'rejected',
    });
    console.log(rejectedRequests, pendingRequests);

    return { totalRequest, pendingRequests, rejectedRequests };
  }

  async approveMember(
    // status: 'approved' | 'rejected',
    userId: string,
    tenantId: string,
    updatedBy: string,
  ): Promise<User> {
    try {
      const user = await this.userModel.findOne({ _id: userId, tenantId });

      if (!user) {
        throw new NotFoundException(
          `User ${userId} not found in tenant ${tenantId}`,
        );
      }

      if (user.membership_status !== 'pending') {
        throw new BadRequestException(
          'User membership is not in pending status',
        );
      }

      user.membership_status = 'approved';
      const updateFields: any = {
        membership_status: 'approved',
        updatedAt: new Date(),
        updatedBy,
      };

      if (user.membership_status === 'approved') {
        updateFields.approvalDate = new Date();
      }

      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true },
      );

      // Emit WebSocket notification
      this.notificationsGateway.emitStatusUpdate(userId, 'approved', '');

      return updatedUser;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update membership status',
      );
    }
  }

  async rejectMember(
    userId: string,
    tenantId: string,
    updatedBy: string,
    reason: string,
  ): Promise<User> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid member ID.');
    }
    try {
      const user = await this.userModel.findOne({ _id: userId, tenantId });
      console.log(userId);

      if (!user) {
        throw new NotFoundException(
          `User ${userId} not found in tenant ${tenantId}`,
        );
      }

      if (user.membership_status !== 'pending') {
        throw new BadRequestException(
          'User membership is not in pending status',
        );
      }

      user.membership_status = 'rejected';
      const updateFields: any = {
        membership_status: 'rejected',
        rejectionReason: reason,
        rejectedAt: new Date(),
        updatedBy,
      };

      if (user.membership_status === 'rejected') {
        updateFields.approvalDate = new Date();
      }

      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true },
      );
      console.log(updatedUser, userId);
      // Emit WebSocket notification
      this.notificationsGateway.emitStatusUpdate(userId, 'rejected', reason);

      return updatedUser;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update membership status',
      );
    }
  }

  async getPendingMembers(tenantId: string, state: string): Promise<User[]> {
    try {
      return await this.userModel
        .find({
          tenantId,
          membership_status: 'pending',
        })
        .sort({ createdAt: 1 })
        .exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch pending members');
    }
  }
}
