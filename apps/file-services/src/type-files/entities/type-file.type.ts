import { Prisma } from '@prisma/client';

// 1. Utility type to make some keys required
type MakeSomeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// 2. Create a select type for your entity (here `TypeFiles`)
type TypeFilesQuerySelect = MakeSomeRequired<Prisma.TypeFilesSelect, 'id'>;

// 3. Includes séparés (relations)
export type TypeFilesInclude = {
  files?: true;
};

// 4. Exemple de composition pour inclure tout ou partie
export type TypeFilesQueryInclude = TypeFilesInclude &
  Omit<TypeFilesQuerySelect, 'files'>;

// 5. Payload basé sur la sélection
type TypeFilesResponsePayload = Prisma.TypeFilesGetPayload<{
  select: MakeSomeRequired<TypeFilesQueryInclude, 'files'>;
}>;

// 6. Final flexible input type
export type TypeFilesQueryInput =
  | { id: bigint }
  | (Partial<TypeFilesResponsePayload> &
      Pick<
        TypeFilesResponsePayload,
        'id' | 'libelle' | 'service' | 'created_at' | 'updated_at' | 'files'
      >);
