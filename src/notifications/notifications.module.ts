import { Module } from '@nestjs/common';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { TenantService } from '../tenant/tenant.service';
import { TenantModule } from 'src/tenant/tenant.module';
import { TenantModels } from 'src/providers/tenant-models.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from 'src/tenant/tenant.schema';

@Module({
  imports: [
    TenantModule,
    MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
  ],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
