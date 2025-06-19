import { Prisma } from '@prisma/client';

// Compose a search condition for users based on a keyword
// This function returns an array of conditions that can be used in a Prisma query
export const searchMembres = (keyword: string) => [
  {
    libelle: {
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
    telephone: {
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
      desciption: {
        contains: keyword,
        mode: Prisma.QueryMode.insensitive,
      },
      devise: {
        contains: keyword,
        mode: Prisma.QueryMode.insensitive,
      },
    },
  },
];

export const includeMembres = {
  organisation: true,
  responsable: true,
  equipe_membres: {
    include: {
      equipe: true,
    },
  },
};
