import { Prisma } from '@prisma/client';

// Compose a search condition for users based on a keyword
// This function returns an array of conditions that can be used in a Prisma query
export const searchOrganisation = (keyword: string) => [
  {
    nom: {
      contains: keyword,
      mode: Prisma.QueryMode.insensitive,
    },
  },
  {
    desciption: {
      contains: keyword,
      mode: Prisma.QueryMode.insensitive,
    },
  },
  {
    devise: {
      contains: keyword,
      mode: Prisma.QueryMode.insensitive,
    },
  },
];

export const includeUserProfils = {
  profils: {
    include: {
      profil: true,
    },
  },
};
