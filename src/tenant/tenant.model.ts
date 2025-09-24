import { MongooseModule } from '@nestjs/mongoose';
import { TenantSchema } from './tenant.schema';

export const TenantModel = MongooseModule.forFeature([
  { name: 'Tenant', schema: TenantSchema },
]);
