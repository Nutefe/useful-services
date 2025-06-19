import { Prisma } from '@prisma/client';

type MakeSomeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

type EvenementsQuerySelect = MakeSomeRequired<Prisma.EvenementsSelect, 'id'>;

export type EvenementsInclude = {
  coordinateur?: true;
  organisation?: true;
  convocations?: true;
  evenement_equipes?: true;
};

export type EvenementsQueryInclude = EvenementsInclude &
  Omit<
    EvenementsQuerySelect,
    'coordinateur' | 'organisation' | 'convocations' | 'evenement_equipes'
  >;

type EvenementsResponsePayload = Prisma.EvenementsGetPayload<{
  select: MakeSomeRequired<
    EvenementsQueryInclude,
    'coordinateur' | 'organisation' | 'convocations' | 'evenement_equipes'
  >;
}>;

export type EvenementsQueryInput =
  | { id: bigint }
  | (Partial<EvenementsResponsePayload> &
      Pick<
        EvenementsResponsePayload,
        | 'id'
        | 'libelle'
        | 'description'
        | 'date_debut'
        | 'date_fin'
        | 'created_at'
        | 'updated_at'
        | 'coordinateur'
        | 'organisation'
        | 'convocations'
        | 'evenement_equipes'
      >);
