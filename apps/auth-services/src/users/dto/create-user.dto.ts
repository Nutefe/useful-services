import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserPrivilegeDto } from './user-privilege.dto';

export class CreateUserDto {
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
  @MinLength(6)
  @MaxLength(20)
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?[#?!@$%^&*-]).{6,}$/, {
    message: 'Le mot de passe est trop simple',
  })
  password?: string;
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
    default: [{ service_id: 0, role_id: 0 }],
  })
  @IsArray()
  @ArrayNotEmpty()
  privileges: UserPrivilegeDto[];
}
