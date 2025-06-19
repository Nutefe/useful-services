import { forwardRef, Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { DatabaseModule } from '@app/common';
import { AuthServicesModule } from '../auth-services.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthServicesModule)],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
