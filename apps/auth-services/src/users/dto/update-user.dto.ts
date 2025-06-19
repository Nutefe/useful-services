import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserPrivilegeDto } from './user-privilege.dto';

export class UpdateUserDto {
  @ApiProperty({ required: false, default: null })
  @IsString()
  @IsOptional()
  username?: string;
  @ApiProperty({ required: false, default: null })
  @IsString()
  @IsOptional()
  firstname?: string;
  @ApiProperty({ required: false, default: null })
  @IsString()
  @IsOptional()
  lastname?: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
  @ApiProperty({
    type: 'array',
    default: [UserPrivilegeDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  privileges: UserPrivilegeDto[];
}
