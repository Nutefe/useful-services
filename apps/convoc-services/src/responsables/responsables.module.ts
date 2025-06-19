import { Module } from '@nestjs/common';
import { ResponsablesService } from './responsables.service';
import { ResponsablesController } from './responsables.controller';
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
  controllers: [ResponsablesController],
  providers: [ResponsablesService],
})
export class ResponsablesModule {}
