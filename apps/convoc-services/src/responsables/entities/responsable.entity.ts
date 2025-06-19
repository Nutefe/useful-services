import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { OrganisationsEntity } from '../../organisations/entities/organisation.entity';
import { MembresEntity } from '../../membres/entities/membre.entity';
import { ResponsablesQueryInput } from './responsable.type';

export class ResponsablesEntity {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  id?: bigint;
  @ApiProperty({ type: 'string', default: null })
  email?: string | null;
  @ApiProperty({ type: 'string', default: null })
  libelle?: string | null;
  @ApiProperty({ type: 'string', default: null })
  telephone?: string | null;
  @ApiProperty({ type: 'string', default: null })
  adresse?: string | null;
  @ApiProperty({ type: () => OrganisationsEntity, default: null })
  organisation?: OrganisationsEntity | null;
  @ApiProperty()
  createdAt?: string;
  @ApiProperty()
  updatedAt?: string;
  @ApiProperty({ type: () => [MembresEntity], default: [] })
  membres?: MembresEntity[];

  constructor();

  constructor(data: ResponsablesQueryInput);

  constructor(data?: ResponsablesQueryInput) {
    if (!data) return;
    this.id = data.id;
    if ('email' in data) {
      this.email = data.email;
      this.libelle = data.libelle;
      this.telephone = data.telephone;
      this.adresse = data.adresse;
      this.organisation = data.organisation
        ? new OrganisationsEntity(data.organisation)
        : null;
      this.createdAt = data.created_at.toJSON();
      this.updatedAt = data.updated_at.toJSON();
      this.membres = data.membres?.map((m) => new MembresEntity(m)) ?? [];
    }
  }
}
