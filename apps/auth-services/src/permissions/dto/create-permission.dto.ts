import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PermissionEnum } from '../entities/permission.enum';

export class CreatePermissionDto {
  @ApiProperty({ enum: PermissionEnum })
  @IsEnum(PermissionEnum)
  name: PermissionEnum;

  @ApiProperty({ required: false, type: 'string' })
  @IsString()
  @IsOptional()
  description?: string;
}
