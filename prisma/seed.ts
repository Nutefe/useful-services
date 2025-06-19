import { PrismaClient, Services } from '@prisma/client';
import { PermissionEnum } from '../apps/auth-services/src/permissions/entities/permission.enum';
import { RoleEnum } from '../apps/auth-services/src/roles/entities/role.enum';
import { ServiceEnum } from '../apps/auth-services/src/services/entities/service.enum';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
async function main() {
  const servicesToSeed = [
    { name: ServiceEnum.SERVICE_AUTH, description: '-' },
    { name: ServiceEnum.SERVICE_EMAIL, description: '-' },
    { name: ServiceEnum.SERVICE_NOTIFICATION, description: '-' },
    { name: ServiceEnum.SERVICE_MIND_MAX, description: '-' },
    { name: ServiceEnum.SERVICE_CONVOC, description: '-' },
    { name: ServiceEnum.SERVICE_FILES, description: '-' },
  ];

  // Map pour retrouver facilement le service par nom après création
  const serviceMap: Record<string, Services> = {};

  await Promise.all(
    servicesToSeed.map(async (service) => {
      const created = await prisma.services.upsert({
        where: { name: service.name },
        update: {},
        create: service,
      });
      serviceMap[service.name] = created;
    }),
  );

  // 2. Créer les rôles pour chaque service (admin & user)
  const rolesData = [
    ...servicesToSeed.map((service) => ({
      name: RoleEnum.ROLE_ADMIN,
      description: `Admin role for service ${service.name.toLowerCase()}`,
      service_id: serviceMap[service.name].id,
    })),
    ...servicesToSeed.map((service) => ({
      name: RoleEnum.ROLE_USER,
      description: `User role for service ${service.name.toLowerCase()}`,
      service_id: serviceMap[service.name].id,
    })),
  ];
  await prisma.roles.createMany({ data: rolesData, skipDuplicates: true });

  // 3. Créer les permissions
  const permissionsData = [
    { name: PermissionEnum.READ, description: '-' },
    { name: PermissionEnum.CREATE, description: '-' },
    { name: PermissionEnum.UPDATE, description: '-' },
    { name: PermissionEnum.DELETE, description: '-' },
  ];
  await prisma.permissions.createMany({
    data: permissionsData,
    skipDuplicates: true,
  });

  const roles = await prisma.roles.findMany();
  const permissions = await prisma.permissions.findMany();

  const rolePermissionsData = roles.flatMap((role) =>
    permissions.map((permission) => ({
      role_id: role.id,
      permission_id: permission.id,
    })),
  );

  await prisma.rolePermissions.createMany({
    data: rolePermissionsData,
    skipDuplicates: true,
  });

  const typeFilesData = [
    ...servicesToSeed.map((service) => ({
      libelle: 'logo',
      service_id: serviceMap[service.name].id,
    })),
    ...servicesToSeed.map((service) => ({
      libelle: 'avatar',
      service_id: serviceMap[service.name].id,
    })),
    ...servicesToSeed.map((service) => ({
      libelle: 'document',
      service_id: serviceMap[service.name].id,
    })),
    ...servicesToSeed.map((service) => ({
      libelle: 'attachment',
      service_id: serviceMap[service.name].id,
    })),
  ];

  await prisma.typeFiles.createMany({
    data: typeFilesData,
    skipDuplicates: true,
  });

  const pass = await bcrypt.hash('Adm!n123', 10);

  // 6. Creer un un utilisateur admin pour chaque service
  const adminUsersData = servicesToSeed.map((service) => ({
    email: `${service.name.toLowerCase()}@example.com`,
    password: pass,
    firstname: 'Admin',
    lastname: service.name,
    username: `${service.name.toLowerCase()}admin`,
    is_active: true,
    is_email_verified: true,
    created_at: new Date(),
    updated_at: new Date(),
    // Ajoute d'autres champs si besoin (avatar, type_profil, etc.)
  }));
  await prisma.users.createMany({
    data: adminUsersData,
    skipDuplicates: true,
  });

  for (const service of servicesToSeed) {
    const user = await prisma.users.findUnique({
      where: { email: `${service.name.toLowerCase()}@example.com` },
    });
    if (!user) continue;

    // Pour chaque service
    for (const otherService of servicesToSeed) {
      const serviceId = serviceMap[otherService.name].id;

      // Récupère tous les rôles de ce service
      const roles = await prisma.roles.findMany({
        where: { service_id: serviceId },
      });

      // Pour chaque rôle du service
      for (const role of roles) {
        await prisma.userRoleServices.upsert({
          where: {
            user_id_role_id_service_id: {
              user_id: user.id,
              role_id: role.id,
              service_id: serviceId,
            },
          },
          update: {},
          create: {
            user: { connect: { id: user.id } },
            role: { connect: { id: role.id } },
            service: { connect: { id: serviceId } },
          },
        });
      }
    }
  }

  // 5. Résumé
  console.log('Services:', serviceMap);
  console.log('Roles & Permissions seeded successfully');
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
