import { Prisma } from '@prisma/client';

// 1. Utility type to make some keys required
type MakeSomeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// 2. Create a select type for your user (here `Utilisateurs`)
type RoleQuerySelect = MakeSomeRequired<Prisma.RolesSelect, 'id'>;

// 3. Optional: Customize includes (e.g., roles)
// 3. Includes séparés
export type RolesInclude = {
  user_role_services?: {
    include: {
      role: true;
      user?: true;
    };
  };
  role_permissions?: {
    include: {
      permission: true;
    };
  };
  service?: true;
  equipe_membres?: true;
};

// 4. Exemple de composition pour inclure tout ou partie
export type RoleQueryInclude = RolesInclude &
  Omit<
    RoleQuerySelect,
    'user_role_services' | 'role_permissions' | 'service' | 'equipe_membres'
  >;

// 5. Payload basé sur la sélection
type ResponsePayload = Prisma.RolesGetPayload<{
  select: MakeSomeRequired<
    RoleQueryInclude,
    'user_role_services' | 'role_permissions' | 'service' | 'equipe_membres'
  >;
}>;

// 5. Final flexible input type
export type RoleQueryInput =
  | { id: bigint }
  | (Partial<ResponsePayload> &
      Pick<
        ResponsePayload,
        | 'id'
        | 'name'
        | 'description'
        | 'created_at'
        | 'updated_at'
        | 'user_role_services'
        | 'role_permissions'
        | 'service'
        | 'equipe_membres'
      >);
