import { Prisma } from '@prisma/client';

// Compose a search condition for users based on a keyword
// This function returns an array of conditions that can be used in a Prisma query
export const searchReponseConvocations = (keyword: string) => [
  {
    choix: {
      contains: keyword,
      mode: Prisma.QueryMode.insensitive,
    },
    description: {
      contains: keyword,
      mode: Prisma.QueryMode.insensitive,
    },
    convocation: {
      evenement: {
        libelle: {
          contains: keyword,
          mode: Prisma.QueryMode.insensitive,
        },
      },
      membre: {
        libelle: {
          contains: keyword,
          mode: Prisma.QueryMode.insensitive,
        },
        email: {
          contains: keyword,
          mode: Prisma.QueryMode.insensitive,
        },
        telephone: {
          contains: keyword,
          mode: Prisma.QueryMode.insensitive,
        },
        adresse: {
          contains: keyword,
          mode: Prisma.QueryMode.insensitive,
        },
      },
      date_envoi: {
        gte: new Date(keyword),
      },
    },
  },
];

export const includeReponseConvocations = {
  convocation: true,
};
