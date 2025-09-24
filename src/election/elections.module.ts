import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ElectionsController } from './elections.controller';
import { ElectionsService } from './elections.service';
import { Election, ElectionSchema } from './schemas/election.schema';
import {
  ElectionResult,
  ElectionResultSchema,
} from './schemas/election-result.schema';
import { PollingUnit, PollingUnitSchema } from './schemas/polling-unit.schema';
import { Candidate, CandidateSchema } from './schemas/candidate.schema';
import { ElectionAggregatorUtil } from './utils/election-aggregator.util';
import { AuthModule } from 'src/auth/auth.module';
import setupSwagger from '../users/users.swagger';
import { TenantMiddleware } from 'src/common/middleware/tenant.middleware';
import { TenantModels } from 'src/providers/tenant-models.provider';
import { UserModel } from 'src/users/users.model';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [
    UserModel,
    AuthModule,
    MongooseModule.forFeature([
      { name: Election.name, schema: ElectionSchema },
      { name: ElectionResult.name, schema: ElectionResultSchema },
      { name: PollingUnit.name, schema: PollingUnitSchema },
      { name: Candidate.name, schema: CandidateSchema },
    ]),
  ],
  controllers: [ElectionsController],
  providers: [
    ElectionsService,
    ElectionAggregatorUtil,
    CloudinaryService,
    TenantModels.electionModel,
    TenantModels.candidateModel,
    TenantModels.electionResultModel,
    TenantModels.pollingUnitModel,
  ],
  exports: [ElectionsService],
})
export class ElectionsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes(ElectionsController);
  }
}
setupSwagger(ElectionsModule);
