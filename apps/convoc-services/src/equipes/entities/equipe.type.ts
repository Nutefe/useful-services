import { Prisma } from '@prisma/client';

type MakeSomeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

type EquipesQuerySelect = MakeSomeRequired<Prisma.EquipesSelect, 'id'>;

export type EquipesInclude = {
  organisation?: true;
  equipe_membres?: true;
  evenement_equipes?: true;
};

export type EquipesQueryInclude = EquipesInclude &
  Omit<
    EquipesQuerySelect,
    'organisation' | 'equipe_membres' | 'evenement_equipes'
  >;

type EquipesResponsePayload = Prisma.EquipesGetPayload<{
  select: MakeSomeRequired<
    EquipesQueryInclude,
    'organisation' | 'equipe_membres' | 'evenement_equipes'
  >;
}>;

export type EquipesQueryInput =
  | { id: bigint }
  | (Partial<EquipesResponsePayload> &
      Pick<
        EquipesResponsePayload,
        | 'id'
        | 'libelle'
        | 'description'
        | 'created_at'
        | 'updated_at'
        | 'organisation'
        | 'equipe_membres'
        | 'evenement_equipes'
      >);
