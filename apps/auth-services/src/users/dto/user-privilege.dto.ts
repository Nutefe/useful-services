import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UserPrivilegeDto {
  @ApiProperty({ type: 'number', required: false })
  @IsNumber()
  @IsNotEmpty()
  service_id?: number;
  @ApiProperty({ type: 'number', required: false })
  @IsNumber()
  @IsNotEmpty()
  role_id?: number;
}
