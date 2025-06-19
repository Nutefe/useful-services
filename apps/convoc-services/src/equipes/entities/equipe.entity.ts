import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { OrganisationsEntity } from '../../organisations/entities/organisation.entity';
import { EquipesQueryInput } from './equipe.type';

export class EquipesEntity {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  id?: bigint;
  @ApiProperty()
  libelle?: string;
  @ApiProperty({ type: 'string', default: null })
  description?: string | null;
  @ApiProperty({ type: () => OrganisationsEntity, default: null })
  organisation?: OrganisationsEntity | null;
  @ApiProperty()
  actif?: boolean;
  @ApiProperty({ type: 'string', default: null })
  dateFin?: string | null;
  @ApiProperty()
  createdAt?: string;
  @ApiProperty()
  updatedAt?: string;

  constructor();

  constructor(data: EquipesQueryInput);

  constructor(data?: EquipesQueryInput) {
    if (!data) return;
    this.id = data.id;
    if ('libelle' in data) {
      this.libelle = data.libelle;
      this.description = data.description;
      this.organisation = data.organisation
        ? new OrganisationsEntity(data.organisation)
        : null;
      this.actif = data.actif;
      this.dateFin = data.date_fin ? data.date_fin.toJSON() : null;
      this.createdAt = data.created_at.toJSON();
      this.updatedAt = data.updated_at.toJSON();
    }
  }
}
