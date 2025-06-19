import { Prisma } from '@prisma/client';

// Compose a search condition for users based on a keyword
// This function returns an array of conditions that can be used in a Prisma query
export const searchConvocations = (keyword: string) => [
  {
    evenement: {
      libelle: {
        contains: keyword,
        mode: Prisma.QueryMode.insensitive,
      },
    },
  },
];

export const includeConvocations = {
  evenement: true,
  convocation_membres: {
    include: {
      membre: true,
    },
  },
};
