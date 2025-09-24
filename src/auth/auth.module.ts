import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import config from 'src/config';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './localstrategy';
import { UsersService } from 'src/users/users.service';
import { UserModel } from 'src/users/users.model';
import { TenantConnectionService } from 'src/services/tenant-connection.service';
import { MailService } from 'src/mail/mail.service';
import { TenantModel } from 'src/tenant/tenant.model';

@Module({
  imports: [
    UsersModule,
    UserModel,
    TenantModel,
    PassportModule.register({ defaultStrategy: 'local' }), // ✅ Add this
  ],
  controllers: [AuthController],

  providers: [
    AuthService,
    JwtAuthGuard,
    JwtStrategy,
    LocalStrategy,
    MailService,
    UsersService,
    TenantConnectionService,
  ],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
