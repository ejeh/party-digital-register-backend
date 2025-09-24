import { MiddlewareConsumer, Module } from '@nestjs/common';
import { RegistrationTokenController } from './registration-token.controller';
import { RegistrationTokenService } from './registration-token.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RegistrationTokenSchema } from './registration-token.schema';
import { MailService } from 'src/mail/mail.service';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { UserModel } from 'src/users/users.model';
import { TenantConnectionService } from 'src/services/tenant-connection.service';
import { TenantMiddleware } from 'src/common/middleware/tenant.middleware';
import { TenantModel } from 'src/tenant/tenant.model';

@Module({
  imports: [
    UserModel,
    TenantModel,
    MongooseModule.forFeature([
      { name: 'RegistrationToken', schema: RegistrationTokenSchema },
    ]),
  ],
  controllers: [RegistrationTokenController],
  providers: [
    RegistrationTokenService,
    MailService,
    AuthService,
    UsersService,
    TenantConnectionService,
  ],
})
export class RegistrationTokenModule {}
