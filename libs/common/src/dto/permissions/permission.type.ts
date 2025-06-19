import { Prisma } from '@prisma/client';

// 1. Utility type to make some keys required
type MakeSomeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// 2. Create a select type for your user (here `Utilisateurs`)
type PermissionQuerySelect = MakeSomeRequired<Prisma.PermissionsSelect, 'id'>;

// 3. Optional: Customize includes (e.g., roles)
// 3. Includes séparés
export type PermissionInclude = {
  role_permissions?: {
    include: {
      role: true;
    };
  };
};

// 4. Exemple de composition pour inclure tout ou partie
export type PermissionQueryInclude = PermissionInclude &
  Omit<PermissionQuerySelect, 'role_permissions'>;

// 5. Payload basé sur la sélection
type ResponsePayload = Prisma.PermissionsGetPayload<{
  select: MakeSomeRequired<PermissionQueryInclude, 'role_permissions'>;
}>;

// 5. Final flexible input type
export type PermissionQueryInput =
  | { id: bigint }
  | (Partial<ResponsePayload> &
      Pick<
        ResponsePayload,
        | 'id'
        | 'name'
        | 'description'
        | 'created_at'
        | 'updated_at'
        | 'role_permissions'
      >);
