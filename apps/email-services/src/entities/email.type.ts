import { Prisma } from '@prisma/client';

// 1. Utility type to make some keys required
type MakeSomeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// 2. Create a select type for your user (here `Utilisateurs`)
type EmailsQuerySelect = MakeSomeRequired<Prisma.EmailsSelect, 'id'>;

// 3. Includes: users and notifications
export type EmailsInclude = {
  user?: true;
};

// 4. Composition type for flexible includes
export type EmailsQueryInclude = EmailsInclude &
  Omit<EmailsQuerySelect, 'user'>;

// 5. Payload based on the selection
type ResponsePayload = Prisma.EmailsGetPayload<{
  select: MakeSomeRequired<EmailsQueryInclude, 'user'>;
}>;

// 6. Final flexible input type
export type EmailsQueryInput =
  | { id: bigint }
  | (Partial<ResponsePayload> &
      Pick<
        ResponsePayload,
        | 'id'
        | 'subject'
        | 'body'
        | 'user_id'
        | 'user'
        | 'created_at'
        | 'updated_at'
      >);
