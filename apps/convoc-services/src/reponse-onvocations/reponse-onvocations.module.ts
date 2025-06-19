import { Module } from '@nestjs/common';
import { ReponseOnvocationsService } from './reponse-onvocations.service';
import { ReponseOnvocationsController } from './reponse-onvocations.controller';
import { createRmqClientConfig, DatabaseModule } from '@app/common';
import { ClientsModule } from '@nestjs/microservices';
import { OrganisationsModule } from '../organisations/organisations.module';
import { ConvocationsModule } from '../convocations/convocations.module';

@Module({
  imports: [
    DatabaseModule,
    ClientsModule.registerAsync([
      createRmqClientConfig(
        'AUTH_SERVICE',
        'RABBITMQ_QUEUE_AUTH',
        'auth-service',
      ),
    ]),
    OrganisationsModule,
    ConvocationsModule,
  ],
  controllers: [ReponseOnvocationsController],
  providers: [ReponseOnvocationsService],
})
export class ReponseOnvocationsModule {}
