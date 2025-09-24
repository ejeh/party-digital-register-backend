import { MiddlewareConsumer, Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { MongooseModule } from '@nestjs/mongoose';
import { News, NewsSchema } from './schemas/news.schema';
import { Circular, CircularSchema } from './schemas/circular.schema';
import { UserModel } from 'src/users/users.model';
import { UsersService } from 'src/users/users.service';
import { AuthModule } from 'src/auth/auth.module';
import { TenantMiddleware } from 'src/common/middleware/tenant.middleware';
import setupSwagger from '../users/users.swagger';
import { TenantModels } from 'src/providers/tenant-models.provider';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [
    AuthModule,
    UserModel,
    MongooseModule.forFeature([
      { name: News.name, schema: NewsSchema },
      { name: Circular.name, schema: CircularSchema },
    ]),
  ],
  controllers: [NewsController],
  providers: [
    NewsService,
    UsersService,
    MailService,
    // TenantModels.newsModel,
    TenantModels.circularModel,
  ],
  exports: [NewsService],
})
export class NewsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes(NewsController);
  }
}
setupSwagger(NewsModule);
