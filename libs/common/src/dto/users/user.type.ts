import { Prisma } from '@prisma/client';

// 1. Utility type to make some keys required
type MakeSomeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// 2. Create a select type for your user (here `Utilisateurs`)
type UserQuerySelect = MakeSomeRequired<Prisma.UsersSelect, 'id'>;

// 3. Optional: Customize includes (e.g., roles)
export type UserQueryInclude = Omit<UserQuerySelect, 'user_role_services'> & {
  user_role_services?: {
    include: {
      role: true;
    };
  };
};

// 4. Prisma payload based on selection
type ResponsePayload = Prisma.UsersGetPayload<{
  select: MakeSomeRequired<UserQueryInclude, 'user_role_services'>;
}>;

// 5. Final flexible input type
export type UserQueryInput =
  | { id: bigint }
  | (Partial<ResponsePayload> &
      Pick<
        ResponsePayload,
        | 'id'
        | 'firstname'
        | 'lastname'
        | 'email'
        | 'username'
        | 'is_active'
        | 'is_email_verified'
        | 'created_at'
        | 'updated_at'
        | 'user_role_services'
      >);
