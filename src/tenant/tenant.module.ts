import {
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantSchema, Tenant } from './tenant.schema'; // Adjust the import path as necessary
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { TenantConnectionProvider } from 'src/providers/tenant-connection.provider';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { TenantMiddleware } from 'src/common/middleware/tenant.middleware';
import { UserModel } from 'src/users/users.model';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Global()
@Module({
  imports: [
    UserModel,
    UsersModule,
    AuthModule,
    MongooseModule.forFeature([
      {
        name: Tenant.name,
        schema: TenantSchema,
      },
    ]),
  ],
  controllers: [TenantController],
  providers: [
    TenantService,
    TenantConnectionProvider,
    NotificationsGateway,
    CloudinaryService,
  ],
  exports: [TenantService, TenantConnectionProvider],
})
export class TenantModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        {
          path: 'api/tenant/create-company',
          method: RequestMethod.POST,
        },
        {
          path: 'api/tenant/users/register',
          method: RequestMethod.POST,
        },
      )
      .forRoutes(TenantController);
  }
}
