import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { configValidationSchema } from './config';
import { GameModule } from './game/game.module';
import { ListingModule } from './listing/listing.module';
import { UserModule } from './user/user.module';

const envFilePath = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return '.production.env';
    case 'test':
      return '.test.env';
    default:
      return '.env';
  }
};

const loggerConfig = () => {
  if (process.env.NODE_ENV === 'production') return {};
  // if (process.env.NODE_ENV === 'test')
  //   return {
  //     pinoHttp: {
  //       level: 'info',
  //     },
  //   };
  return {
    pinoHttp: {
      level: 'debug',
      prettyPrint: {
        levelFirst: true,
        translateTime: 'UTC:mm/dd/yyyy h:MM:ss TT Z',
      },
    },
  };
};

@Module({
  imports: [
    UserModule,
    AuthModule,
    LoggerModule.forRoot(loggerConfig()),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFilePath(),
      validationSchema: configValidationSchema,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_CONNECTION_STRING'),
      }),
      inject: [ConfigService],
    }),
    GameModule,
    ListingModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
