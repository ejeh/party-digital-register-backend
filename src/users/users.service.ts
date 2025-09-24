import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model } from 'mongoose';
import { hashPassword } from 'src/auth/auth';
import { v4 as uuid } from 'uuid';
import config from 'src/config';
import {
  EmailAlreadyUsedException,
  UserNotFoundException,
} from 'src/common/exception';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) public readonly userModel: Model<UserDocument>,
    private readonly mailService: MailService,
  ) {}

  async getUserBymail(email: string) {
    return this.userModel.findOne({ email });
  }

  /**
   * Finds a user by their ID and tenant ID.
   * @param userId - The ID of the user.
   * @param tenantId - The ID of the tenant.
   * @returns The user document if found, otherwise null.
   */
  async findOne({
    where: { id, tenantId },
  }: {
    where: { id: string; tenantId: string };
  }): Promise<UserDocument | null> {
    try {
      const user = await this.userModel.findOne({ _id: id, tenantId }).exec();

      if (!user) {
        return null; // User not found
      }

      return user;
    } catch (error) {
      console.error(`Error finding user by ID: ${error.message}`);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Creates user
   * @throws duplicate key error when
   */

  async create(
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    phone: string,
    NIN: string,
    state: string,
    lga: string,
    ward: string,
    polling_unit: string,
    party: string,
    votersCard: string,
    logo: string,
    tenantId,
    origin,
  ): Promise<UserDocument> {
    try {
      const user = await this.userModel.create({
        email: email.toLocaleLowerCase(),
        firstname,
        lastname,
        phone,
        NIN,
        tenantId,
        state,
        lga,
        ward,
        polling_unit,
        party,
        votersCard,
        logo,
        origin,
        password: await hashPassword(password),
        activationToken: uuid(),
        activationExpires: Date.now() + config.auth.activationExpireInMs,
      });
      this.mailService.sendActivationMail(
        user.email,
        user.id,
        user.activationToken,
        'activate-account',
      );

      return user;
    } catch (error) {
      throw EmailAlreadyUsedException();
    }
  }
  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw UserNotFoundException();
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne(
      { email: email.toLowerCase() },
      // {password: 0}
      '+password',
    );
    if (!user) {
      throw UserNotFoundException();
    }
    return user;
  }

  async findAdminByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne(
      { email: email.toLowerCase() },
      // {password: 0}
      '+password',
    );

    return user;
  }

  async activate(userId: string, activationToken: string) {
    const user = await this.userModel
      .findOneAndUpdate(
        {
          _id: userId,
          activationToken,
        },
        {
          activationToken: null,
          activationExpires: null,
          isActive: true,
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .where('activationExpires')
      .gt(Date.now())
      .exec();

    return user;
  }

  async forgottenPassword(email: string, origin: string) {
    // Generate a 4-digit code as string, padded with zeros if needed
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    const user = await this.userModel.findOneAndUpdate(
      {
        email: email.toLowerCase(),
      },
      {
        passwordResetToken: code,
        passwordResetExpires: Date.now() + config.auth.passwordResetExpireInMs,
        otpVerified: false, // Reset OTP verification status
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!user) {
      throw UserNotFoundException();
    }

    // Send the 4-digit code to the user's email
    this.mailService.sendForgottenPasswordMail(user.email, code, origin);
  }

  async resetPassword(email: string, newPassword: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');

    if (!user.otpVerified) {
      throw new BadRequestException('OTP not verified');
    }

    user.password = await hashPassword(newPassword);
    user.passwordResetToken = null;
    user.otpVerified = false;
    user.passwordResetExpires = null;

    await user.save();

    this.mailService.sendResetPasswordMail(email);

    return { message: 'Password reset successful' };
  }

  // async resetPassword(
  //   email: string,
  //   passwordResetToken: string,
  //   password: string,
  // ) {
  //   // Only allow 4-digit code as passwordResetToken
  //   if (!/^\d{4}$/.test(passwordResetToken)) {
  //     throw PasswordResetTokenInvalidException();
  //   }

  //   const user = await this.userModel
  //     .findOneAndUpdate(
  //       {
  //         email: email.toLowerCase(),
  //         passwordResetToken,
  //       },
  //       {
  //         password: await hashPassword(password),
  //         passwordResetToken: null,
  //         passwordResetExpires: null,
  //       },
  //       {
  //         new: true,
  //         runValidators: true,
  //       },
  //     )
  //     .where('passwordResetExpires')
  //     .gt(Date.now())
  //     .exec();

  //   if (!user) {
  //     throw PasswordResetTokenInvalidException();
  //   }

  //   this.mailService.sendResetPasswordMail(user.email);

  //   return user;
  // }

  async getPaginatedData(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const data = await this.userModel.find().skip(skip).limit(limit).exec();
    const totalCount = await this.userModel.countDocuments().exec();
    return {
      data,
      hasNextPage: skip + limit < totalCount,
    };
  }

  async sendRequest(
    email: string,
    subject: string,
    body: string,
  ): Promise<UserDocument> {
    const user = await this.userModel.findOne(
      { email: email.toLowerCase() },
      // {password: 0}
      '+password',
    );
    if (!user) {
      throw UserNotFoundException();
    }

    this.mailService.sendMailRequest(user.email, subject, body);
    return user;
  }

  async getDataTable(params: any, tenantId: string, state: string) {
    const { start, length, search, order, columns, draw } = params;

    const query: any = {};

    // 🔍 Search filter
    if (search?.value) {
      query.$or = [
        { firstname: { $regex: search.value, $options: 'i' } },
        { lastname: { $regex: search.value, $options: 'i' } },
        { role: { $regex: search.value, $options: 'i' } },
        { state: { $regex: search.value, $options: 'i' } },
        { phone: { $regex: search.value, $options: 'i' } },
        { email: { $regex: search.value, $options: 'i' } }, // optional
      ];
    }

    // 📊 Total records
    const totalRecords = await this.userModel.countDocuments({});
    const filteredRecords = await this.userModel.countDocuments(query);

    // 🔽 Sorting
    let sort: any = {};
    if (order && order.length > 0) {
      const columnName = columns[order[0].column].data;
      const dir = order[0].dir === 'asc' ? 1 : -1;
      sort[columnName] = dir;
    }

    // ⏳ Pagination + Fetch
    const data = await this.userModel
      .find({ ...query, tenantId, membership_status: 'approved' })
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

  // Delete Certificate
  async deleteItem(id: string): Promise<any> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.userModel.deleteOne({ _id: id });
  }

  async updateRole(id: string, role: string) {
    const validRoles = [
      'national_chairman',
      'state_chairman',
      'registration_agent',
      'delegate',
      'member',
    ];
    if (!validRoles.includes(role)) {
      throw new BadRequestException('Invalid role');
    }

    return this.userModel.findByIdAndUpdate(id, { role }, { new: true });
  }

  async getDataTables(params: any) {
    const { start, length, search, order, columns, draw } = params;

    const query: any = {};

    // 🔍 Search filter
    if (search?.value) {
      query.$or = [
        { firstname: { $regex: search.value, $options: 'i' } },
        { lastname: { $regex: search.value, $options: 'i' } },
        { role: { $regex: search.value, $options: 'i' } },
        { state: { $regex: search.value, $options: 'i' } },
        { phone: { $regex: search.value, $options: 'i' } },
        { email: { $regex: search.value, $options: 'i' } }, // optional
      ];
    }

    // 📊 Total records
    const totalRecords = await this.userModel.countDocuments({});
    const filteredRecords = await this.userModel.countDocuments(query);

    // 🔽 Sorting
    let sort: any = {};
    if (order && order.length > 0) {
      const columnName = columns[order[0].column].data;
      const dir = order[0].dir === 'asc' ? 1 : -1;
      sort[columnName] = dir;
    }

    // ⏳ Pagination + Fetch
    const data = await this.userModel
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
}
