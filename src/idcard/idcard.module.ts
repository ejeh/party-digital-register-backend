import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { IdcardController } from './idcard.controller';
import { IdcardService } from './idcard.service';
import { UserModel } from 'src/users/users.model';

import setupSwagger from '../users/users.swagger';
import { UsersService } from 'src/users/users.service';
import { UserMailerService } from 'src/users/users.mailer.service';
import { TenantMiddleware } from 'src/common/middleware/tenant.middleware';
import { TenantModels } from 'src/providers/tenant-models.provider';

import { AuthModule } from 'src/auth/auth.module';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [AuthModule, UserModel],
  controllers: [IdcardController],
  providers: [
    IdcardService,
    UsersService,
    MailService,
    TenantModels.idCardModel,
  ],
  exports: [IdcardService],
})
export class IdcardModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes(IdcardController);
  }
}
setupSwagger(IdcardModule);
