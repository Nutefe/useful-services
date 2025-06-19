import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ResponsablesEntity } from '../../responsables/entities/responsable.entity';
import { MembresEntity } from '../../membres/entities/membre.entity';
import { EquipesEntity } from '../../equipes/entities/equipe.entity';
import { EvenementsEntity } from '../../evenements/entities/evenement.entity';
import { UserOrganisationsEntity } from './user-organisations.entity';
import { OrganisationsQueryInput } from './organisation.type';

export class OrganisationsEntity {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  id?: bigint;
  @ApiProperty()
  nom?: string | null;
  @ApiProperty({ type: 'string', default: null })
  desciption?: string | null;
  @ApiProperty({ type: 'string', default: null })
  devise?: string | null;
  @ApiProperty()
  equipeMax?: number;
  @ApiProperty()
  evenementActifs?: number;
  @ApiProperty()
  membreEquipeActifs?: number;
  @ApiProperty()
  membreEventMax?: number;
  @ApiProperty()
  membreActifs?: number;
  @ApiProperty()
  convocMax?: number;
  @ApiProperty({ type: 'string', default: null })
  logo?: string | null;
  @ApiProperty()
  nbrEquipe: number;
  @ApiProperty()
  nbrMembre: number;
  @ApiProperty()
  createdAt?: string;
  @ApiProperty()
  updatedAt?: string;

  @ApiProperty({ type: () => [ResponsablesEntity], default: [] })
  responsables?: ResponsablesEntity[];
  @ApiProperty({ type: () => [MembresEntity], default: [] })
  membres?: MembresEntity[];
  @ApiProperty({ type: () => [EquipesEntity], default: [] })
  equipes?: EquipesEntity[];
  @ApiProperty({ type: () => [EvenementsEntity], default: [] })
  evenements?: EvenementsEntity[];
  @ApiProperty({ type: () => [UserOrganisationsEntity], default: [] })
  user_organisations?: UserOrganisationsEntity[];

  constructor();
  constructor(data?: OrganisationsQueryInput);

  constructor(data?: OrganisationsQueryInput) {
    if (!data) return;
    this.id = data.id;
    if ('nom' in data) {
      this.nom = data?.nom;
      this.desciption = data?.desciption;
      this.devise = data?.devise;
      this.equipeMax = data.equipe_max;
      this.evenementActifs = data.evenement_actifs;
      this.membreEquipeActifs = data.membre_equipe_actifs;
      this.membreEventMax = data.membre_event_max;
      this.membreActifs = data.membre_actifs;
      this.convocMax = data.convoc_max;
      this.logo = data.logo;
      this.nbrEquipe = data._count_equipes ?? 0;
      this.nbrMembre = data._count_membres ?? 0;
      this.createdAt = data.created_at.toJSON();
      this.updatedAt = data.updated_at.toJSON();
      this.responsables =
        data.responsables?.map((r) => new ResponsablesEntity(r)) ?? [];
      this.membres = data.membres?.map((m) => new MembresEntity(m)) ?? [];
      this.equipes = data.equipes?.map((e) => new EquipesEntity(e)) ?? [];
      this.evenements =
        data.evenements?.map((ev) => new EvenementsEntity(ev)) ?? [];
      this.user_organisations =
        data.user_organisations?.map(
          (uo) =>
            new UserOrganisationsEntity({
              user: uo.user,
              organisation: uo.organisation,
            }),
        ) ?? [];
    }
  }
}
