import { Module } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { OrganisationsController } from './organisations.controller';
import { createRmqClientConfig, DatabaseModule } from '@app/common';
import { ClientsModule } from '@nestjs/microservices';

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
        'FILE_SERVICE',
        'RABBITMQ_QUEUE_FILE',
        'file-service',
      ),
    ]),
  ],
  controllers: [OrganisationsController],
  providers: [OrganisationsService],
  exports: [OrganisationsService],
})
export class OrganisationsModule {}
