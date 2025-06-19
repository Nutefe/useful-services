import { Prisma } from '@prisma/client';

// 1. Utility type to make some keys required
type MakeSomeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// 2. Create a select type for your user (here `Utilisateurs`)
type NotificationTokensQuerySelect = MakeSomeRequired<
  Prisma.NotificationTokensSelect,
  'id'
>;

// 3. Includes: users and notifications
export type NotificationTokensInclude = {
  user?: true;
  notifications?: true;
};

// 4. Composition type for flexible includes
export type NotificationTokensQueryInclude = NotificationTokensInclude &
  Omit<NotificationTokensQuerySelect, 'user' | 'notifications'>;

// 5. Payload based on the selection
type ResponsePayload = Prisma.NotificationTokensGetPayload<{
  select: MakeSomeRequired<NotificationTokensQueryInclude, 'user'>;
}>;

// 6. Final flexible input type
export type NotificationTokensQueryInput =
  | { id: bigint }
  | (Partial<ResponsePayload> &
      Pick<
        ResponsePayload,
        | 'id'
        | 'user_id'
        | 'device_type'
        | 'version'
        | 'notification_token'
        | 'deleted'
        | 'created_at'
        | 'updated_at'
        | 'user'
        | 'notifications'
      >);
