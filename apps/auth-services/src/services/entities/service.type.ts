import { Prisma } from '@prisma/client';

// 1. Utility type to make some keys required
type MakeSomeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// 2. Create a select type for your user (here `Utilisateurs`)
type ServiceQuerySelect = MakeSomeRequired<Prisma.ServicesSelect, 'id'>;

// 3. Optional: Customize includes (e.g., roles)
export type ServicesInclude = {
  user_role_services?: {
    include: {
      role: true;
      service?: true;
    };
  };
  role?: true;
};

// 4. Exemple de composition pour inclure tout ou partie
export type ServiceQueryInclude = ServicesInclude &
  Omit<ServiceQuerySelect, 'user_role_services' | 'role'>;

// 5. Payload basé sur la sélection
type ResponsePayload = Prisma.ServicesGetPayload<{
  select: MakeSomeRequired<ServiceQueryInclude, 'user_role_services' | 'role'>;
}>;

// 5. Final flexible input type
export type ServiceQueryInput =
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
        | 'role'
      >);
