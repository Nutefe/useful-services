import { Prisma } from '@prisma/client';

// 1. Utility type to make some keys required
type MakeSomeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// 2. Create a select type for your entity (here `Files`)
type FilesQuerySelect = MakeSomeRequired<Prisma.FilesSelect, 'id'>;

// 3. Includes séparés (relations)
export type FilesInclude = {
  type_file?: true;
};

// 4. Exemple de composition pour inclure tout ou partie
export type FilesQueryInclude = FilesInclude &
  Omit<FilesQuerySelect, 'type_file'>;

// 5. Payload basé sur la sélection
type FilesResponsePayload = Prisma.FilesGetPayload<{
  select: MakeSomeRequired<FilesQueryInclude, 'type_file'>;
}>;

// 6. Final flexible input type
export type FilesQueryInput =
  | { id: bigint }
  | (Partial<FilesResponsePayload> &
      Pick<
        FilesResponsePayload,
        | 'id'
        | 'mimetype'
        | 'filename'
        | 'origine_name'
        | 'path'
        | 'file_dir'
        | 'type_file'
        | 'user'
        | 'created_at'
        | 'updated_at'
      >);
