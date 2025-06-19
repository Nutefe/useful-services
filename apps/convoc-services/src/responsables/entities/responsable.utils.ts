import { Prisma } from '@prisma/client';

// Compose a search condition for users based on a keyword
// This function returns an array of conditions that can be used in a Prisma query
export const searchResponsable = (keyword: string) => [
  {
    libelle: {
      contains: keyword,
      mode: Prisma.QueryMode.insensitive,
    },
  },
  {
    telephone: {
      contains: keyword,
      mode: Prisma.QueryMode.insensitive,
    },
  },
  {
    adresse: {
      contains: keyword,
      mode: Prisma.QueryMode.insensitive,
    },
  },
  {
    email: {
      contains: keyword,
      mode: Prisma.QueryMode.insensitive,
    },
  },
  {
    organisation: {
      nom: {
        contains: keyword,
        mode: Prisma.QueryMode.insensitive,
      },
    },
  },
];

export const includeResponsable = {
  organisation: true,
  membres: true,
};
