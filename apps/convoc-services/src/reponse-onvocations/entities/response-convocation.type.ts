import { Prisma } from '@prisma/client';

type MakeSomeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

type ReponseConvocationsQuerySelect = MakeSomeRequired<
  Prisma.ReponseConvocationsSelect,
  'id'
>;

export type ReponseConvocationsInclude = {
  convocation?: true;
};

export type ReponseConvocationsQueryInclude = ReponseConvocationsInclude &
  Omit<ReponseConvocationsQuerySelect, 'convocation'>;

type ReponseConvocationsResponsePayload = Prisma.ReponseConvocationsGetPayload<{
  select: MakeSomeRequired<ReponseConvocationsQueryInclude, 'convocation'>;
}>;

export type ReponseConvocationsQueryInput =
  | { id: bigint }
  | (Partial<ReponseConvocationsResponsePayload> &
      Pick<
        ReponseConvocationsResponsePayload,
        | 'id'
        | 'choix'
        | 'description'
        | 'created_at'
        | 'updated_at'
        | 'convocation'
      >);
