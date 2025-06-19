import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '../entities/role.enum';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PermissionEnum } from '../../permissions/entities/permission.enum';

export class UpdateRoleDto {
  @ApiProperty({ enum: RoleEnum })
  @IsEnum(RoleEnum)
  name: RoleEnum;
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
  @ApiProperty({
    type: 'number',
    description: 'The service associated with the role',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  service_id: number;
  @ApiProperty({
    type: 'array',
    enum: PermissionEnum,
    default: [
      PermissionEnum.READ,
      PermissionEnum.CREATE,
      PermissionEnum.UPDATE,
      PermissionEnum.DELETE,
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(PermissionEnum, { each: true })
  permissions: PermissionEnum[];
}
