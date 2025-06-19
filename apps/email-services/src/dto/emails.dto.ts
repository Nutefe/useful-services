import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EmailDto {
  @IsNumber()
  @IsNotEmpty()
  user_id?: number;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}
