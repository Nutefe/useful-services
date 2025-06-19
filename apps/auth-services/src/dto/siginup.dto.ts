import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SiginUpDto {
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
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  service_name: string;
}
