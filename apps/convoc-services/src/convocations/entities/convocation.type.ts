import { Prisma } from '@prisma/client';

type MakeSomeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

type ConvocationsQuerySelect = MakeSomeRequired<
  Prisma.ConvocationsSelect,
  'id'
>;

export type ConvocationsInclude = {
  evenement?: true;
  membre?: true;
  reponse_convocations?: true;
  convocation_membres: {
    include: {
      membre: true;
    };
  };
};

export type ConvocationsQueryInclude = ConvocationsInclude &
  Omit<
    ConvocationsQuerySelect,
    'evenement' | 'membre' | 'reponse_convocations' | 'convocation_membres'
  >;

type ConvocationsResponsePayload = Prisma.ConvocationsGetPayload<{
  select: MakeSomeRequired<
    ConvocationsQueryInclude,
    'evenement' | 'membre' | 'reponse_convocations' | 'convocation_membres'
  >;
}>;

export type ConvocationsQueryInput =
  | { id: bigint }
  | (Partial<ConvocationsResponsePayload> &
      Pick<
        ConvocationsResponsePayload,
        | 'id'
        | 'date_envoi'
        | 'slug'
        | 'created_at'
        | 'updated_at'
        | 'evenement'
        | 'membre'
        | 'reponse_convocations'
        | 'convocation_membres'
      >);
