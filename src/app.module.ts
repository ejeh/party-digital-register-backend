import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MorganModule } from 'nest-morgan';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import config, { dbUrl } from './config';
import { PassportModule } from '@nestjs/passport';
import { MailerModule, HandlebarsAdapter } from '@nest-modules/mailer';
import { ServeStaticMiddleware } from '@nest-middlewares/serve-static';
import * as path from 'path';
import { LoggerMiddleware } from './common/middleware/logger';
import { AuthModule } from './auth/auth.module';
// import { IndigeneCertificateModule } from './indigene-certificate/indigene-certificate.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
// import { IdcardModule } from './idcard/idcard.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
// import { TransactionModule } from './transaction/transaction.module';
import { TenantModule } from './tenant/tenant.module';
import { ConfigModule } from '@nestjs/config';
import { mongooseModuleAsyncOptions } from './config/mongo.config';
import Config from './config/config';
import { IdcardModule } from './idcard/idcard.module';
import { ElectionsModule } from './election/elections.module';
import { NewsModule } from './news/news.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { MailService } from './mail/mail.service';
import { RegistrationTokenModule } from './registration-token/registration-token.module';

const DEV_TRANSPORTER = {
  host: 'smtp-relay.sendinblue.com',
  port: 587,
  auth: {
    user: 'developercircus@gmail.com',
    pass: 'CR2bIMjv3XZkrTEL',
  },
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: '.env',
      cache: true,
      load: [Config],
    }),
    MongooseModule.forRootAsync(mongooseModuleAsyncOptions),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Path to your static files directory
      serveRoot: '/uploads', // The base URL path
    }),
    JwtModule.register({
      global: true,
      secret: 'secret',
      signOptions: { expiresIn: config.auth.jwtTokenExpireInSec },
    }),
    PassportModule,
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: DEV_TRANSPORTER,
        defaults: {
          from: config.mail.from,
        },
        template: {
          dir: __dirname + '/../templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
        options: {
          partials: {
            dir: path.join(__dirname, 'templates/partials'),
            options: {
              strict: true,
            },
          },
        },
      }),
    }),
    AuthModule,
    IdcardModule,
    TenantModule,
    UsersModule,
    MorganModule,
    ElectionsModule,
    NewsModule,
    NotificationsModule,
    RegistrationTokenModule,
  ],
  controllers: [AppController],
  providers: [AppService, CloudinaryService, MailService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    ServeStaticMiddleware.configure(
      path.resolve(__dirname, '..', '..', 'public'),
      config.static,
    );
    consumer.apply(ServeStaticMiddleware).forRoutes('public');

    if (!config.isTest) {
      consumer.apply(LoggerMiddleware).forRoutes('api');
    }
  }
}
