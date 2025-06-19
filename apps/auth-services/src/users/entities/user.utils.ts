import { Prisma } from '@prisma/client';

// Compose a search condition for users based on a keyword
// This function returns an array of conditions that can be used in a Prisma query
export const searchUser = (keyword: string) => [
  {
    username: {
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
    nom: {
      contains: keyword,
      mode: Prisma.QueryMode.insensitive,
    },
  },
  {
    prenom: {
      contains: keyword,
      mode: Prisma.QueryMode.insensitive,
    },
  },
  {
    profils: {
      some: {
        profil: {
          name: {
            contains: keyword,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      },
    },
  },
];

export const includeUserRoleService = {
  user_role_services: {
    include: {
      role: {
        include: {
          role_permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
      service: true,
    },
  },
};

export const connectUserProfils = (profils: string[]) => ({
  connect: profils.map((profil) => ({
    profil: {
      name: profil,
    },
  })),
});
