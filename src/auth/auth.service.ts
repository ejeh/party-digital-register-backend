import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from 'src/users/users.schema';
import { UsersService } from 'src/users/users.service';
import { comparePassword } from './auth';
import { LoginCredentialsException } from 'src/common/exception';
import {
  ActivateParams,
  ForgottenPasswordDto,
  ResetPasswordDto,
} from './auth.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuid } from 'uuid';
import config from 'src/config';
import { nanoid } from 'nanoid';
import { encrypt } from 'src/utils/encrypt';
import { ConfigService } from '@nestjs/config';
import { TenantConnectionService } from 'src/services/tenant-connection.service';
import { Secrets, SecretsSchema } from './secrets.schema';
import { decrypt } from 'src/utils/decrypt';
import { UserPublicData } from 'src/users/users.dto';
import { MailService } from 'src/mail/mail.service';
import { Tenant } from 'src/tenant/tenant.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) public readonly userModel: Model<User>,
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private tenantConnectionService: TenantConnectionService,
    private readonly mailService: MailService,
  ) {}

  private fakeDatabase = {
    '12345678901': {
      firstname: 'Godfrey',
      lastname: 'Ejeh',
      state: 'Benue',
      lga: 'Ogbadibo',
      status: 'verified',
    },
    '98765432109': {
      firstname: 'John',
      lastname: 'Doe',
      state: 'Benue',
      lga: 'Buruku',
      status: 'verified',
    },
    '98765432102': {
      firstname: 'Simon',
      lastname: 'Iber',
      state: 'Benue',
      lga: 'Buruku',
      status: 'verified',
    },
    '98765432162': {
      firstname: 'Sheyi',
      lastname: 'Shay',
      state: 'Ogun',
      lga: 'Ifo',
      status: 'verified',
    },
    '88765432102': {
      firstname: 'Arome',
      lastname: 'Mbur',
      state: 'Kogi',
      lga: 'Okene',
      status: 'verified',
    },

    '88765432105': {
      firstname: 'Derick',
      lastname: 'Gbaden',
      state: 'Benue',
      lga: 'Gboko',
      status: 'verified',
    },

    '88765432101': {
      firstname: 'Charles',
      lastname: 'Luper',
      state: 'Benue',
      lga: 'Gboko',
      status: 'verified',
    },
    '88765432131': {
      firstname: 'Victor',
      lastname: 'Atir',
      state: 'Benue',
      lga: 'Gboko',
      status: 'verified',
    },

    '88765432132': {
      firstname: 'Ciroma',
      lastname: 'Musa',
      state: 'Abuja',
      lga: 'Kubwa',
      status: 'verified',
    },
  };

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.usersService.findByEmail(email);

    if (!comparePassword(password, user.password)) {
      throw LoginCredentialsException();
    }

    return user;
  }

  async activate({ userId, activationToken }: ActivateParams) {
    const user = await this.usersService.activate(userId, activationToken);
    if (!user) {
      return { success: false, message: 'Invalid or expired token' };
    }

    return {
      success: true,
      message: 'Account activated successfully',
      token: this.jwtService.sign({ id: user.id }, { subject: `${user.id}` }),
      user: user.getPublicData(),
    };
  }

  async resendActivationEmail(email: string, origin: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.isActive) {
      return { success: false, message: 'Account is already activated' };
    }

    // Generate a new activation token (or reuse the old one)
    const activationToken = user.activationToken || uuid();
    user.activationToken = activationToken;
    (user.activationExpires = new Date(
      Date.now() + config.auth.activationExpireInMs,
    )),
      await user.save();

    // Send email with activation link
    this.mailService.sendActivationMail(
      user.email,
      user.id,
      user.activationToken,
      'activate-account',
    );

    return { success: true, message: 'Activation email sent successfully' };
  }

  async fetchUserById(userId: string, tenantId: string) {
    const user = await this.usersService.findOne({
      where: { id: userId, tenantId },
    });
    return user;
  }

  // 👑 For global admins
  async fetchAdminUserById(userId: string) {
    const admin = await this.userModel.findOne({
      _id: userId,
      role: 'admin',
    });

    if (!admin) {
      throw new NotFoundException(`Admin user with ID ${userId} not found`);
    }

    return admin;
  }

  async createSecretKeyForNewTenant(tenantId: string) {
    //Generate Random Secret Key
    const jwtSecret = nanoid(128);

    //Encrypt the Secret Key

    const encryptionKey = this.configService.get(
      `security.encryptionSecretKey`,
    );

    if (!encryptionKey) {
      throw new Error('Missing security.encryptionSecretKey in configuration');
    }

    const encryptedSecret = encrypt(jwtSecret, encryptionKey);

    if (!encryptedSecret) {
      throw new Error('Encryption failed: Encrypted secret is undefined');
    }

    //Get Access to the tenant specific Model
    const SecretsModel = await this.tenantConnectionService.getTenantModel(
      {
        name: Secrets.name,
        schema: SecretsSchema,
      },
      tenantId,
    );

    //Store the encrypted secret key
    await SecretsModel.create({ jwtSecret: encryptedSecret });
  }

  async fetchAccessTokenSecretSigningKey(tenantId: string) {
    const SecretsModel = await this.tenantConnectionService.getTenantModel(
      {
        name: Secrets.name,
        schema: SecretsSchema,
      },
      tenantId,
    );

    // console.log(secretKey);
    const secretsDoc = await SecretsModel.findOne();
    const secretKey = decrypt(
      secretsDoc.jwtSecret,
      this.configService.get(`security.encryptionSecretKey`),
    );

    return secretKey;
  }

  async signUpUser(userData: any, tenantId: string, origin: string) {
    // Create and save tenant
    const tenant = new this.tenantModel({
      party: userData.party.toLowerCase(),
      state: userData.state.toLowerCase(),
      logo: userData.logo || '',
      tenantId,
    });
    const { NIN, firstname, lastname, state } = userData;

    if (!this.fakeDatabase[NIN]) {
      throw new BadRequestException('NIN not found');
    }

    const storedData = this.fakeDatabase[NIN];
    if (
      storedData.firstname.toLocaleLowerCase() !==
        firstname.toLocaleLowerCase() ||
      storedData.lastname.toLocaleLowerCase() !==
        lastname.toLocaleLowerCase() ||
      storedData.state.toLocaleLowerCase() !== state.toLocaleLowerCase()
    ) {
      throw new BadRequestException('User details do not match the NIN record');
    }
    const user = await this.usersService.create(
      userData.firstname,
      userData.lastname,
      userData.email,
      userData.password,
      userData.phone,
      userData.NIN,
      userData.state,
      userData.lga,
      userData.ward,
      userData.polling_unit,
      userData.party,
      userData.votersCard,
      userData.logo,
      tenantId,
      origin,
    );

    // Get public user data
    const userPublicData = user.getPublicData();

    // Create token payload with both user and tenant data
    const tokenPayload = {
      ...userPublicData,
      tenant: {
        tenantId: tenant.tenantId,
        party: tenant.party,
        state: tenant.state,
        logo: tenant.logo,
      },
    };

    return {
      token: this.jwtService.sign(tokenPayload, { subject: `${user.id}` }),
      user: userPublicData,
      tenant: {
        tenantId: tenant.tenantId,
        party: tenant.party,
        state: tenant.state,
        logo: tenant.logo,
      },
    };
  }

  // user jwt decode obj
  // async login(user?: any) {
  //   if (!user.isActive) {
  //     throw new UnauthorizedException(
  //       'Account is not activated. Please check your email for activation instructions.',
  //     );
  //   }
  //   //Fetch tenant specific secret key
  //   const secretKey = await this.fetchAccessTokenSecretSigningKey(
  //     user.tenantId,
  //   );

  //   const payload = {
  //     userId: user?._id,
  //     ...user?.getPublicData(),
  //   };

  //   // Generate JWT access token
  //   const token = await this.jwtService.sign(payload, {
  //     secret: secretKey,
  //     expiresIn: config.auth.jwtTokenExpireInSec,
  //   });
  //   // return { accessToken, tenantId: user.tenantId };
  //   return {
  //     token,
  //     tenantId: user.tenantId,
  //     user: user?.getPublicData(),
  //     userId: `${user?.id}`,
  //   };
  // }

  async login(user?: any) {
    if (!user.isActive) {
      throw new UnauthorizedException(
        'Account is not activated. Please check your email for activation instructions.',
      );
    }

    // Bypass tenant checks for admin users
    if (user.role === 'admin') {
      // Get user public data
      const userPublicData = user?.getPublicData();

      // Create token payload without tenant data for admin
      const payload = {
        userId: user?._id,
        ...userPublicData,
        // Admin doesn't belong to any tenant
        tenant: null,
      };

      // Generate JWT access token using default secret for admin
      const token = await this.jwtService.sign(payload, {
        secret: process.env.AUTH_SECRET || config.auth.secret, // Use default secret for admin
        expiresIn: config.auth.jwtTokenExpireInSec,
      });

      return {
        token,
        tenantId: null, // Admin has no tenant
        user: userPublicData,
        userId: `${user?.id}`,
        tenant: null, // Admin has no tenant
      };
    }

    // Fetch tenant details
    const tenant = await this.tenantModel.findOne({ tenantId: user.tenantId });
    if (!tenant) {
      throw new UnauthorizedException('Tenant not found');
    }

    // Fetch tenant specific secret key
    const secretKey = await this.fetchAccessTokenSecretSigningKey(
      user.tenantId,
    );

    // Get user public data
    const userPublicData = user?.getPublicData();

    // Create token payload with both user and tenant data
    const payload = {
      userId: user?._id,
      ...userPublicData,
      tenant: {
        tenantId: tenant.tenantId,
        party: tenant.party,
        state: tenant.state,
        logo: tenant.logo,
      },
    };

    // Generate JWT access token
    const token = await this.jwtService.sign(payload, {
      secret: secretKey,
      expiresIn: config.auth.jwtTokenExpireInSec,
    });

    return {
      token,
      tenantId: user.tenantId,
      user: userPublicData,
      userId: `${user?.id}`,
      tenant: {
        tenantId: tenant.tenantId,
        party: tenant.party,
        state: tenant.state,
        logo: tenant.logo,
      },
    };
  }

  async forgottenPassword({ email }: ForgottenPasswordDto, origin: string) {
    return await this.usersService.forgottenPassword(email, origin);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, newPassword } = resetPasswordDto;
    return await this.usersService.resetPassword(email, newPassword);
  }

  //   async resetPassword(email: string, newPassword: string) {
  //   const user = await this.userModel.findOne({ email });
  //   if (!user) throw new NotFoundException('User not found');

  //   if (!user.otpVerified) {
  //     throw new BadRequestException('OTP not verified');
  //   }

  //   user.password = await bcrypt.hash(newPassword, 10);
  //   user.resetOtp = null;
  //   user.otpVerified = false;
  //   user.otpExpires = null;
  //   await user.save();

  //   return { message: 'Password reset successful' };
  // }

  async verifyOtp(email: string, otp: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // check expiry
    if (!user.passwordResetExpires || user.passwordResetExpires < Date.now()) {
      throw new BadRequestException('OTP expired');
    }

    // check match
    if (user.passwordResetToken !== otp) {
      throw new BadRequestException('Invalid OTP code');
    }
    if (user.otpVerified) {
      throw new BadRequestException('OTP code already verified');
    }

    // ✅ mark as verified
    user.otpVerified = true;
    await user.save();

    return { success: true, message: 'OTP verified successfully' };
  }
}
