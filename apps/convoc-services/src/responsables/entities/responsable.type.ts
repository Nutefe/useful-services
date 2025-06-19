import { Prisma } from '@prisma/client';

type MakeSomeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

type ResponsablesQuerySelect = MakeSomeRequired<
  Prisma.ResponsablesSelect,
  'id'
>;

export type ResponsablesInclude = {
  organisation?: true;
  membres?: true;
};

export type ResponsablesQueryInclude = ResponsablesInclude &
  Omit<ResponsablesQuerySelect, 'organisation' | 'membres'>;

type ResponsablesResponsePayload = Prisma.ResponsablesGetPayload<{
  select: MakeSomeRequired<
    ResponsablesQueryInclude,
    'organisation' | 'membres'
  >;
}>;

export type ResponsablesQueryInput =
  | { id: bigint }
  | (Partial<ResponsablesResponsePayload> &
      Pick<
        ResponsablesResponsePayload,
        | 'id'
        | 'email'
        | 'libelle'
        | 'telephone'
        | 'adresse'
        | 'created_at'
        | 'updated_at'
        | 'organisation'
        | 'membres'
      >);
