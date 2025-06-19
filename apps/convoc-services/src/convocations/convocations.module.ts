import { Module } from '@nestjs/common';
import { ConvocationsService } from './convocations.service';
import { ConvocationsController } from './convocations.controller';
import { createRmqClientConfig, DatabaseModule } from '@app/common';
import { ClientsModule } from '@nestjs/microservices';
import { OrganisationsModule } from '../organisations/organisations.module';

@Module({
  imports: [
    DatabaseModule,
    ClientsModule.registerAsync([
      createRmqClientConfig(
        'AUTH_SERVICE',
        'RABBITMQ_QUEUE_AUTH',
        'auth-service',
      ),
      createRmqClientConfig(
        'EMAIL_SERVICE',
        'RABBITMQ_QUEUE_EMAIL',
        'email-service',
      ),
      createRmqClientConfig(
        'NOTIFICATION_SERVICE',
        'RABBITMQ_QUEUE_NOTIFICATION',
        'notification-service',
      ),
    ]),
    OrganisationsModule,
  ],
  controllers: [ConvocationsController],
  providers: [ConvocationsService],
  exports: [ConvocationsService],
})
export class ConvocationsModule {}
