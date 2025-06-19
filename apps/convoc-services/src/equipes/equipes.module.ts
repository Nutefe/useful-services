import { Module } from '@nestjs/common';
import { EquipesService } from './equipes.service';
import { EquipesController } from './equipes.controller';
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
  controllers: [EquipesController],
  providers: [EquipesService],
})
export class EquipesModule {}
