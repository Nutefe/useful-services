import { ApiProperty } from '@nestjs/swagger';

export class CreateResponsableDto {
  @ApiProperty({ type: 'string', default: null })
  email?: string;
  @ApiProperty({ type: 'string', default: null })
  libelle?: string;
  @ApiProperty({ type: 'string', default: null })
  telephone?: string;
  @ApiProperty({ type: 'string', default: null })
  adresse?: string;
  @ApiProperty()
  organisation_id?: number;
}
