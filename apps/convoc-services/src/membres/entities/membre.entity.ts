import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ResponsablesEntity } from '../../responsables/entities/responsable.entity';
import { OrganisationsEntity } from '../../organisations/entities/organisation.entity';
import { MembresQueryInput } from './membre.type';
import { UserEntity } from '@app/common';
import { EquipesEntity } from '../../equipes/entities/equipe.entity';

export class MembresEntity {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  id?: bigint;
  @ApiProperty({ type: 'string', default: null })
  slug?: string | null;
  @ApiProperty({ type: 'string', default: null })
  libelle?: string | null;
  @ApiProperty({ type: 'string', default: null })
  adresse?: string | null;
  @ApiProperty({ type: 'string', default: null })
  email?: string | null;
  @ApiProperty({ type: 'string', default: null })
  telephone?: string | null;
  @ApiProperty({ type: () => UserEntity, default: null })
  user?: UserEntity | null;
  @ApiProperty({ type: () => ResponsablesEntity, default: null })
  responsable?: ResponsablesEntity | null;
  @ApiProperty({ type: () => OrganisationsEntity, default: null })
  organisation?: OrganisationsEntity | null;
  @ApiProperty()
  actif?: boolean;
  @ApiProperty()
  hasResponsable?: boolean;
  @ApiProperty({ type: 'string', default: null })
  dateFin?: string | null;

  @ApiProperty({ type: () => [EquipesEntity], isArray: true, default: [] })
  equipes?: EquipesEntity[];

  @ApiProperty()
  createdAt?: string;
  @ApiProperty()
  updatedAt?: string;

  constructor();
  constructor(data: MembresQueryInput);
  constructor(data?: MembresQueryInput) {
    if (!data) return;
    this.id = data.id;
    if ('slug' in data) {
      this.slug = data.slug;
      this.libelle = data.libelle;
      this.adresse = data.adresse;
      this.email = data.email;
      this.telephone = data.telephone;
      this.user = data.user ? new UserEntity(data.user) : null;
      this.responsable = data.responsable
        ? new ResponsablesEntity(data.responsable)
        : null;
      this.organisation = data.organisation
        ? new OrganisationsEntity(data.organisation)
        : null;
      this.actif = data.actif;
      this.hasResponsable = data.has_responsable;
      this.dateFin = data.date_fin ? data.date_fin.toJSON() : null;
      this.equipes = data.equipe_membres
        ? data.equipe_membres.map((equipe) => new EquipesEntity(equipe.equipe))
        : [];
      this.createdAt = data.created_at.toJSON();
      this.updatedAt = data.updated_at.toJSON();
    }
  }
}
