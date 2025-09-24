import helmet from 'helmet';
import * as compression from 'compression';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { setupSwaggerDocuments } from './common/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import config from './config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { UserRole } from 'src/users/users.role.enum';
import * as bcrypt from 'bcryptjs';
import { UserSchema } from './users/users.schema';
import mongoose from 'mongoose';

/**
 * Helper to be used here & in tests.
 * @param app
 */
export const configureApp = (app: any) => {
  app.use((req, res, next) => {
    next();
  });
  if (config.cors) {
    app.enableCors(config.cors);
  }

  app.useWebSocketAdapter(new IoAdapter(app));
  app.use(helmet());
  // app.use(compression());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
};

export async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Connect to MongoDB manually
  await mongoose.connect(
    process.env.MONGO_URI || 'mongodb://localhost:27017/master',
  );

  // 2. Create the User model manually
  const UserModel = mongoose.model('User', UserSchema);

  const email = 'davidmark@gmail.com';
  const phone = '08069710658';
  const NIN = '12345678903';

  const existingUser = await UserModel.findOne({ email });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('magickiss17A#', 10);

    await UserModel.create({
      email,
      firstname: 'David',
      lastname: 'Mark',
      phone,
      NIN,
      password: hashedPassword,
      role: UserRole.ADMIN,
      isVerified: true,
      isActive: true,
      membership_status: 'approved',
    });

    console.log('✅ Admin created successfully');
  } else if (existingUser.role !== UserRole.ADMIN) {
    await UserModel.updateOne({ email }, { $set: { role: UserRole.ADMIN } });
    console.log('✅ Admin role assigned to existing user');
  } else {
    console.log('ℹ️ Admin already exists');
  }

  app.useStaticAssets(join(__dirname, '..', 'public')); // Serve static files

  configureApp(app);

  setupSwaggerDocuments(app);

  await app.listen(config.port);
}
