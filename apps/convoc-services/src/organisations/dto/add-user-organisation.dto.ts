import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AddUserOrganisationDto {
  @ApiProperty({ type: 'array', items: { type: 'number' } })
  @IsNotEmpty()
  users: number[];
}
