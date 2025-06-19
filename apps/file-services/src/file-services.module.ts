import { Module } from '@nestjs/common';
import { FileServicesController } from './file-services.controller';
import { FileServicesService } from './file-services.service';
import { TypeFilesModule } from './type-files/type-files.module';
import {
  createRmqClientConfig,
  DatabaseModule,
  LoggerModule,
} from '@app/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { ClientsModule } from '@nestjs/microservices';

@Module({
  imports: [
    TypeFilesModule,
    DatabaseModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/file-services/.env',
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        RABBITMQ_URI: Joi.string().required(),
        RABBITMQ_QUEUE: Joi.string().required(),
        RABBITMQ_QUEUE_AUTH: Joi.string().required(),
        AUTH_SERVICE: Joi.string().required(),
      }),
    }),
    ClientsModule.registerAsync([
      createRmqClientConfig(
        'AUTH_SERVICE',
        'RABBITMQ_QUEUE_AUTH',
        'auth-service',
      ),
    ]),
  ],
  controllers: [FileServicesController],
  providers: [FileServicesService],
})
export class FileServicesModule {}
