import { SetMetadata } from '@nestjs/common';
import { ServiceEnum } from '../dto';

export const HasServices = (...services: ServiceEnum[]) =>
  SetMetadata('services', services);
