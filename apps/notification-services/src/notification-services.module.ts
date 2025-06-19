import { Module } from '@nestjs/common';
import { NotificationController } from './notification-services.controller';
import { NotificationServicesService } from './notification-services.service';
import { DatabaseModule, LoggerModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    DatabaseModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/notification-services/.env',
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        FIREBASE_KEY_PATH: Joi.string().required(),
      }),
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationServicesService],
})
export class NotificationServicesModule {}
