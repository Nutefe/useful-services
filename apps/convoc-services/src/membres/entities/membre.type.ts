import { Prisma } from '@prisma/client';

type MakeSomeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

type MembresQuerySelect = MakeSomeRequired<Prisma.MembresSelect, 'id'>;

export type MembresInclude = {
  user?: true;
  responsable?: true;
  organisation?: true;
  equipe_membres?: {
    include: {
      equipe: true;
    };
  };
  convocations?: true;
  evenements?: true;
};

export type MembresQueryInclude = MembresInclude &
  Omit<
    MembresQuerySelect,
    | 'user'
    | 'responsable'
    | 'organisation'
    | 'equipe_membres'
    | 'convocations'
    | 'evenements'
  >;

type MembresResponsePayload = Prisma.MembresGetPayload<{
  select: MakeSomeRequired<
    MembresQueryInclude,
    | 'user'
    | 'responsable'
    | 'organisation'
    | 'equipe_membres'
    | 'convocations'
    | 'evenements'
  >;
}>;

export type MembresQueryInput =
  | { id: bigint }
  | (Partial<MembresResponsePayload> &
      Pick<
        MembresResponsePayload,
        | 'id'
        | 'slug'
        | 'libelle'
        | 'email'
        | 'telephone'
        | 'created_at'
        | 'updated_at'
        | 'user'
        | 'responsable'
        | 'organisation'
        | 'equipe_membres'
        | 'convocations'
        | 'evenements'
      >);
