import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateConvocationDto {
  @ApiProperty({ type: 'number' })
  @IsNumber()
  @IsNotEmpty()
  evenement_id: number;
  @ApiProperty({ type: 'array', items: { type: 'number' } })
  @IsArray()
  @IsNotEmpty()
  membre_ids: number[];
}
