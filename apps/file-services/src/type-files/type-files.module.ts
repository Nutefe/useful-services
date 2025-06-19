import { Module } from '@nestjs/common';
import { TypeFilesService } from './type-files.service';
import { TypeFilesController } from './type-files.controller';
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
    ]),
  ],
  controllers: [TypeFilesController],
  providers: [TypeFilesService],
})
export class TypeFilesModule {}
