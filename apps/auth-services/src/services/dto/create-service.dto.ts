import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ServiceEnum } from '../entities/service.enum';

export class CreateServiceDto {
  @ApiProperty({ enum: ServiceEnum })
  @IsEnum(ServiceEnum)
  name: ServiceEnum;
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
