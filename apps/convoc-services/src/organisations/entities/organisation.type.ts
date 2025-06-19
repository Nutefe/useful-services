import { Prisma } from '@prisma/client';

type MakeSomeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

type OrganisationsQuerySelect = MakeSomeRequired<
  Prisma.OrganisationsSelect,
  'id'
>;

export type OrganisationsInclude = {
  responsables?: true;
  membres?: true;
  equipes?: true;
  _count_equipes?: {
    select: {
      equipes: true;
    };
  };
  _count_membres?: {
    select: {
      equipes: {
        select: {
          equipe_membres: true;
        };
      };
    };
  };
  evenements?: true;
  user_organisations?: {
    include: {
      user: true;
      organisation: true;
    };
  };
};

export type OrganisationsQueryInclude = OrganisationsInclude &
  Omit<
    OrganisationsQuerySelect,
    | 'responsables'
    | 'membres'
    | 'equipes'
    | 'evenements'
    | 'user_organisations'
    | '_count_equipes'
    | '_count_membres'
  >;

type OrganisationsResponsePayload = Prisma.OrganisationsGetPayload<{
  select: MakeSomeRequired<
    OrganisationsQueryInclude,
    | 'responsables'
    | 'membres'
    | 'equipes'
    | 'evenements'
    | 'user_organisations'
    | '_count_equipes'
    | '_count_membres'
  >;
}>;

export type OrganisationsQueryInput =
  | { id: bigint }
  | (Partial<OrganisationsResponsePayload> &
      Pick<
        OrganisationsResponsePayload,
        | 'id'
        | 'nom'
        | 'desciption'
        | 'devise'
        | 'equipe_max'
        | 'evenement_actifs'
        | 'membre_equipe_actifs'
        | 'membre_event_max'
        | 'membre_actifs'
        | 'convoc_max'
        | 'logo'
        | 'created_at'
        | 'updated_at'
        | 'responsables'
        | 'membres'
        | 'equipes'
        | 'evenements'
        | 'user_organisations'
        | '_count_equipes'
        | '_count_membres'
      >);
