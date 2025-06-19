import { Prisma } from '@prisma/client';

// 1. Utility type to make some keys required
type MakeSomeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// 2. Create a select type for your user (here `Utilisateurs`)
type UserQuerySelect = MakeSomeRequired<Prisma.UsersSelect, 'id'>;

// 3. Optional: Customize includes (e.g., roles)
// 3. Includes séparés
export type UserRoleServicesInclude = {
  user_role_services?: {
    include: {
      role: {
        include: {
          role_permissions: {
            include: {
              permission: true;
            };
          };
        };
      };
      service?: true;
    };
  };
  user_organisations?: true;
  membres?: true;
};

// 4. Exemple de composition pour inclure tout ou partie
export type UserQueryInclude = UserRoleServicesInclude &
  // PreparateurInclude &
  // RefreshTokensInclude &
  Omit<
    UserQuerySelect,
    'user_role_services' | 'user_organisations' | 'membres'
  >;

// 5. Payload basé sur la sélection
type ResponsePayload = Prisma.UsersGetPayload<{
  select: MakeSomeRequired<
    UserQueryInclude,
    'user_role_services' | 'user_organisations' | 'membres'
  >;
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
        | 'valid_or_reset_token'
        | 'created_at'
        | 'updated_at'
        | 'user_role_services'
        | 'user_organisations'
        | 'membres'
      >);
