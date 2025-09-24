import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import setupSwagger from './users.swagger';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users.schema';
import { TenantMiddleware } from 'src/common/middleware/tenant.middleware';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { AuthService } from 'src/auth/auth.service';
import { TenantConnectionService } from 'src/services/tenant-connection.service';
import { TenantModel } from 'src/tenant/tenant.model';

@Module({
  imports: [
    TenantModel,
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '1h' },
    }),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UsersController],

  providers: [
    UsersService,
    CloudinaryService,
    MailService,
    ConfigService,
    AuthService,
    TenantConnectionService,
  ],

  exports: [UsersService],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes(UsersController);
  }
}

setupSwagger(UsersModule);
