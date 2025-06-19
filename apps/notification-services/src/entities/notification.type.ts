import { Prisma } from '@prisma/client';

// 1. Utility type to make some keys required
type MakeSomeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// 2. Create a select type for your user (here `Utilisateurs`)
type NotificationsQuerySelect = MakeSomeRequired<
  Prisma.NotificationsSelect,
  'id'
>;

// 3. Includes: users and notifications
export type NotificationsInclude = {
  notification_token?: true;
};

// 4. Composition type for flexible includes
export type NotificationsQueryInclude = NotificationsInclude &
  Omit<NotificationsQuerySelect, 'notification_token'>;

// 5. Payload based on the selection
type ResponsePayload = Prisma.NotificationsGetPayload<{
  select: MakeSomeRequired<NotificationsQueryInclude, 'notification_token'>;
}>;

// 6. Final flexible input type
export type NotificationsQueryInput =
  | { id: bigint }
  | (Partial<ResponsePayload> &
      Pick<
        ResponsePayload,
        | 'id'
        | 'title'
        | 'body'
        | 'room'
        | 'notification_token_id'
        | 'notification_token'
        | 'created_at'
      >);
