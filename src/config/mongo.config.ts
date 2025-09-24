import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';
export const mongooseModuleAsyncOptions: MongooseModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (config: ConfigService) => {
    const uri = config.get<string>('MONGO_URL');

    if (!uri) {
      throw new Error('MONGO_URI is not defined. Check your .env file.');
    }
    return { uri };
  },
  inject: [ConfigService],
};
