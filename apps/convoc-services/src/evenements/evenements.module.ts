import { Module } from '@nestjs/common';
import { EvenementsService } from './evenements.service';
import { EvenementsController } from './evenements.controller';
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
    ]),
    OrganisationsModule,
  ],
  controllers: [EvenementsController],
  providers: [EvenementsService],
})
export class EvenementsModule {}
