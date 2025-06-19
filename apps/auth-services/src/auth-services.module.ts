import { Module } from '@nestjs/common';
import { AuthServicesController } from './auth-services.controller';
import { AuthServicesService } from './auth-services.service';
import { DatabaseModule, LoggerModule } from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { ServicesModule } from './services/services.module';
import { PermissionsModule } from './permissions/permissions.module';
import * as Joi from 'joi';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtBearerStrategy } from './auth/strategies/jwt-bearer.strategy';
import { GoogleStrategy } from './auth/strategies/google.strategy';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    DatabaseModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/auth-services/.env',
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        JWT_SECRET: Joi.string().required(),
        EXPIRATION_TIME: Joi.string().required(),
        RABBITMQ_URI: Joi.string().required(),
        RABBITMQ_QUEUE: Joi.string().required(),
        RABBITMQ_QUEUE_EMAIL: Joi.string().required(),
        EMAIL_SERVICE: Joi.string().required(),
        NOTIFICATION_SERVICE: Joi.string().required(),
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: Number(configService.get<string>('EXPIRATION_TIME')),
          },
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    RolesModule,
    ServicesModule,
    PermissionsModule,

    ClientsModule.registerAsync([
      {
        name: process.env.EMAIL_SERVICE ?? 'email-service',
        useFactory: (configService: ConfigService) => {
          const rabbitmqUri = configService.get<string>('RABBITMQ_URI');
          const rabbitmqQueue = configService.get<string>(
            'RABBITMQ_QUEUE_EMAIL',
          );
          if (!rabbitmqUri) {
            throw new Error('RABBITMQ_URI is not defined');
          }
          if (!rabbitmqQueue) {
            throw new Error('RABBITMQ_QUEUE is not defined');
          }
          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitmqUri],
              queue: rabbitmqQueue,
              queueOptions: {
                durable: false,
              },
            },
          };
        },
        inject: [ConfigService],
      },
      {
        name: process.env.NOTIFICATION_SERVICE ?? 'notification-service',
        useFactory: (configService: ConfigService) => {
          const rabbitmqUri = configService.get<string>('RABBITMQ_URI');
          const rabbitmqQueue = configService.get<string>(
            'NOTIFICATION_SERVICE',
          );
          if (!rabbitmqUri) {
            throw new Error('RABBITMQ_URI is not defined');
          }
          if (!rabbitmqQueue) {
            throw new Error('RABBITMQ_QUEUE is not defined');
          }
          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitmqUri],
              queue: rabbitmqQueue,
              queueOptions: {
                durable: false,
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthServicesController],
  providers: [
    AuthServicesService,
    JwtBearerStrategy,
    PassportModule,
    GoogleStrategy,
  ],
  exports: [AuthServicesService],
})
export class AuthServicesModule {}
