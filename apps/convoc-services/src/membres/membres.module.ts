import { Module } from '@nestjs/common';
import { MembresService } from './membres.service';
import { MembresController } from './membres.controller';
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
  controllers: [MembresController],
  providers: [MembresService],
})
export class MembresModule {}
