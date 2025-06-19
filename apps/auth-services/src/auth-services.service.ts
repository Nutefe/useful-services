import {
  DatabaseService,
  generateToken,
  JwtPayload,
  JwtPayloadRoleServices,
  UserDto,
  UserEmailDto,
} from '@app/common';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from './users/entities/user.entity';
import { includeUserRoleService } from './users/entities/user.utils';
import * as bcrypt from 'bcrypt';
import { GoogleProfile } from './users/entities/google-profile.entity';
import { UserPrivilegeDto } from './users/dto/user-privilege.dto';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ResetPasswordDto } from './users/dto/reset-password.dto';
import { SiginUpDto } from './dto/siginup.dto';
import { Prisma } from '@prisma/client';
import { RoleEnum } from './roles/entities/role.enum';
import { ServiceEnum } from './services/entities/service.enum';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthServicesService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly databaseService: DatabaseService,
    @Inject(process.env.EMAIL_SERVICE ?? 'email-service')
    private readonly emailService: ClientProxy,
  ) {}

  async logIn(existingUser: Readonly<LoginDto>) {
    const userInit = await this.logUser(existingUser);

    const roleServices: JwtPayloadRoleServices[] =
      userInit.user_role_services?.map((roleService) => ({
        role: {
          id: Number(roleService.role?.id),
          name: roleService.role?.name ?? undefined,
          permissions: roleService.role?.permissions?.map((permission) => ({
            id: Number(permission?.id),
            name: permission?.name ?? undefined,
          })),
        },
        service: {
          id: Number(roleService.service?.id),
          name: roleService.service?.name ?? undefined,
        },
      })) || [];

    const user: JwtPayload = {
      id: Number(userInit?.id),
      email: userInit?.email,
      username: userInit?.username,
      role_services: roleServices,
      curent_service_name: existingUser.service_name ?? null,
    };

    if (!user) {
      throw new UnauthorizedException();
    }

    const jwt = await this.jwtService.signAsync({ user });

    return { token: jwt, user };
  }

  async signinUp(siginUpDto: SiginUpDto) {
    // Check if the email already exists
    // If it does, throw a ConflictException
    if (await this.logExistEmail(siginUpDto.email)) {
      throw new ConflictException('Email already exist');
    }

    // Check if the username already exists
    // If it does, throw a ConflictException
    if (
      siginUpDto.username &&
      (await this.logExistUsername(siginUpDto.username))
    ) {
      throw new ConflictException('Username already exist');
    }

    // Create a new user with the provided data
    // Hash the password before saving it to the database
    // Include the profils associated with the user
    const { service_name, ...userData } = siginUpDto;

    // Select role for the service
    const roles = await this.roleService(service_name);

    const user = await this.databaseService.users.create({
      data: {
        ...userData,
        user_role_services: {
          create: roles.map((privilege) => ({
            service: {
              connect: {
                id: privilege.service_id,
              },
            },
            role: {
              connect: {
                id: privilege.role_id,
              },
            },
          })),
        },
        password: siginUpDto.password
          ? await bcrypt.hash(siginUpDto.password, 10)
          : null,
      },
    });

    const userReset = new UserEntity(user);

    const userEmail: UserEmailDto = {
      id: Number(userReset.id),
      email: userReset.email,
      first_name: userReset.firstname,
      last_name: userReset.lastname,
      valid_or_reset_token: userReset.valid_or_reset_token,
    };

    await lastValueFrom(this.emailService.emit('confirm-email', userEmail));

    // Return the created user as a UtilisateursEntity
    return userReset;
  }

  async roleService(service_name: string): Promise<UserPrivilegeDto[]> {
    // Select role for email service, auth service, and notification service
    const auto_roles = await this.databaseService.roles.findMany({
      where: {
        OR: [
          {
            service: {
              name: service_name,
            },
          },
          {
            service: {
              name: {
                in: [
                  ServiceEnum.SERVICE_AUTH,
                  ServiceEnum.SERVICE_EMAIL,
                  ServiceEnum.SERVICE_NOTIFICATION,
                ],
              },
            },
          },
        ],
        name: {
          in: [RoleEnum.ROLE_USER],
        },
        deleted: false,
      },
    });

    // Map the roles to UserPrivilegeDto
    const role_services: UserPrivilegeDto[] = auto_roles.map((role) => ({
      service_id:
        role.service_id !== undefined && role.service_id !== null
          ? Number(role.service_id)
          : 0,
      role_id: Number(role.id),
    }));
    return role_services; // Return the privileges
    // Add the auto roles to the privileges
  }

  // Method to validate the user by email and password
  // The method uses the databaseService to interact with the database
  async validateUser(
    email: string,
    password: string,
  ): Promise<UserEntity | null> {
    // Find the user by email, is not deleted and email is verified
    const user = await this.databaseService.users.findUnique({
      where: { email: email, deleted: false, is_email_verified: true },
      include: includeUserRoleService,
    });

    // If the user is not found, throw a NotFoundException
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if the user exists
    const doesUserExist = !!user;

    // If the user does not exist, return null
    if (!doesUserExist) return null;

    // Check if the password is valid
    const doesPasswordMatch = user.password
      ? await bcrypt.compare(password, user.password)
      : false;

    // If the password is not valid, return null
    if (!doesPasswordMatch) return null;

    // If the password is valid, return the user
    return new UserEntity(user);
  }

  async validateGoogleUser(profile: GoogleProfile) {
    const email = profile?.emails?.[0]?.value;
    let user = await this.databaseService.users.findUnique({
      where: {
        email: email,
        deleted: false,
        is_email_verified: true,
        type_profil: 'google',
      },
      include: includeUserRoleService,
    });

    if (!user) {
      // Création d'un nouvel utilisateur si il n'existe pas
      const createdUser = await this.databaseService.users.create({
        data: {
          email: email,
          username: null,
          firstname: profile.name?.familyName ?? '',
          lastname: profile.name?.givenName ?? '',
          password: null,
          is_email_verified: true,
          type_profil: 'google',
        },
      });
      user = await this.databaseService.users.findUnique({
        where: { id: createdUser.id },
        include: includeUserRoleService,
      });
    }

    if (!user) {
      throw new NotFoundException('User not found after creation');
    }

    return new UserEntity(user);
  }

  async generateJwt(userInit: UserEntity, service_name?: string) {
    // Tu peux customiser le payload selon tes besoins
    const roleServices: JwtPayloadRoleServices[] =
      userInit.user_role_services?.map((roleService) => ({
        role: {
          id: Number(roleService.role?.id),
          name: roleService.role?.name ?? undefined,
          permissions: roleService.role?.permissions?.map((permission) => ({
            id: Number(permission?.id),
            name: permission?.name ?? undefined,
          })),
        },
        service: {
          id: Number(roleService.service?.id),
          name: roleService.service?.name ?? undefined,
        },
      })) || [];

    const user: JwtPayload = {
      id: Number(userInit?.id),
      email: userInit?.email,
      username: userInit?.username,
      role_services: roleServices,
      curent_service_name: service_name ?? null,
    };

    if (!user) {
      throw new UnauthorizedException();
    }

    const jwt = await this.jwtService.signAsync({ user });

    return { token: jwt, user };
  }

  // Method to log in the user
  // The method uses the validateUser method to check if the user exists
  // If the user exists, return the user without the password
  async logUser(existingUser: LoginDto): Promise<UserEntity> {
    const { email, password, service_name } = existingUser;

    // Check if the email and password match
    let user = await this.validateUser(email, password);

    // If the user is not found, throw a UnauthorizedException
    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.id && service_name)
      user = await this.updateUseroleServices(user?.id, service_name);

    // The password is removed from the user object
    delete user.password;

    // return the user
    return user;
  }

  async updateUseroleServices(user_id: bigint, service_name: string) {
    // Select role for email service, auth service, and notification service
    const roles = await this.roleService(service_name);

    // Update the user with the new role services
    const user = await this.databaseService.users.update({
      where: { id: user_id },
      data: {
        user_role_services: {
          connectOrCreate: roles.map((privilege) => ({
            where: {
              id: undefined,
              user_id_role_id_service_id: {
                user_id: user_id,
                role_id: privilege.role_id ?? 0,
                service_id: privilege.service_id ?? 0,
              },
            },
            create: {
              service: { connect: { id: privilege.service_id ?? 0 } },
              role: { connect: { id: privilege.role_id ?? 0 } },
            },
          })),
        },
      },
      include: includeUserRoleService,
    });

    // Return the updated user as a UserEntity
    return new UserEntity(user);
  }

  // Method to verify the JWT token
  // The method uses the jwtService to verify the token
  async verifyJwt(jwt: string): Promise<{ exp: number; userdto: UserDto }> {
    // Check if the JWT token is valid
    // If it is not valid, throw a UnauthorizedException
    if (!jwt) {
      throw new UnauthorizedException();
    }

    try {
      // Verify the JWT token
      const { exp } = await this.jwtService.verifyAsync<{ exp: number }>(jwt);

      // Decode the JWT token
      const userdto: UserDto = this.jwtService.decode(jwt);
      // return the decoded token
      return { exp, userdto };
    } catch (error) {
      console.error('Verify the JWT token ' + error);
      throw new UnauthorizedException();
    }
  }

  async saveValideOrResetToken(email: string): Promise<UserEntity> {
    const oldUser = await this.databaseService.users.findFirst({
      where: { deleted: false, email },
      include: includeUserRoleService,
    });

    if (!oldUser) {
      throw new NotFoundException('User not found');
    }

    const date = new Date();
    date.setMinutes(date.getMinutes() + 60);

    const valid_or_reset_token = await this.generateToken(8);

    const userRest = await this.databaseService.users.update({
      where: { id: oldUser.id },
      data: {
        valid_or_reset_token: valid_or_reset_token,
        expiry_reset: date.getTime(),
      },
    });

    return new UserEntity(userRest);
  }

  async forgetPasswordEmail(email: string): Promise<void> {
    const userReset = await this.saveValideOrResetToken(email);

    if (!userReset) {
      throw new NotFoundException('User not found');
    }

    const user: UserEmailDto = {
      id: Number(userReset.id),
      email: userReset.email,
      first_name: userReset.firstname,
      last_name: userReset.lastname,
      valid_or_reset_token: userReset.valid_or_reset_token ?? undefined,
    };

    await lastValueFrom(this.emailService.emit('forget-password-email', user));
  }

  async forgetPassword(
    token: string,
    resetPassword: ResetPasswordDto,
  ): Promise<void> {
    const oldUser = await this.databaseService.users.findUnique({
      where: {
        valid_or_reset_token: token,
        deleted: false,
        expiry_reset: {
          gte: new Date().getTime(),
        },
      },
      include: includeUserRoleService,
    });

    if (!oldUser) {
      throw new NotFoundException('User not found or token expired');
    }

    const { newPassword } = resetPassword;

    const password = await bcrypt.hash(newPassword, 10);

    const userReset = await this.databaseService.users.update({
      where: { id: oldUser.id },
      data: {
        password: password,
        valid_or_reset_token: null,
        expiry_reset: null,
      },
      include: includeUserRoleService,
    });

    if (!userReset) {
      throw new NotFoundException('User not found');
    }

    const userEntity = new UserEntity(userReset);

    const user: UserEmailDto = {
      id: Number(userEntity.id),
      email: userEntity.email,
      first_name: userEntity.firstname,
      last_name: userEntity.lastname,
      valid_or_reset_token: userEntity.valid_or_reset_token,
    };

    await lastValueFrom(this.emailService.emit('success-reset-email', user));
  }

  async generateToken(size: number): Promise<string> {
    let valid_or_reset_token = '';

    do {
      valid_or_reset_token = generateToken(size);
    } while (await this.tokenExist(valid_or_reset_token));
    return valid_or_reset_token;
  }

  async tokenExist(token: string): Promise<boolean> {
    const user = await this.databaseService.users.findFirst({
      where: { valid_or_reset_token: token, deleted: false },
    });
    return !!user;
  }

  async valideMail(token: string): Promise<void> {
    const oldUser = await this.databaseService.users.findUnique({
      where: {
        valid_or_reset_token: token,
        deleted: false,
        expiry_reset: {
          gte: new Date().getTime(),
        },
      },
      include: includeUserRoleService,
    });

    if (!oldUser) {
      throw new NotFoundException('User not found or token expired');
    }

    const userReset = await this.databaseService.users.update({
      where: { id: oldUser.id },
      data: {
        is_email_verified: true,
        email_verified_at: new Date(),
      },
      include: includeUserRoleService,
    });

    if (!userReset) {
      throw new NotFoundException('User not found');
    }

    const userEntity = new UserEntity(userReset);

    const user: UserEmailDto = {
      id: Number(userEntity.id),
      email: userEntity.email,
      first_name: userEntity.firstname,
      last_name: userEntity.lastname,
      valid_or_reset_token: userEntity.valid_or_reset_token,
    };

    await lastValueFrom(
      this.emailService.emit('success-validation-email', user),
    );
  }

  // Method to check if the email already exists
  // The method uses the databaseService to interact with the database
  async logExistEmail(email: string, id?: number): Promise<boolean> {
    // Find the user by email and is not deleted
    const whereCondition: Prisma.UsersWhereInput = {
      deleted: false,
      email: email,
    };

    // If the id is provided, exclude it from the search
    if (id) {
      whereCondition.id = { not: id };
    }

    // Check if the user exists
    const user = await this.databaseService.users.findFirst({
      where: whereCondition,
    });

    // If the user exists, return true
    // If the user does not exist, return false
    if (user) {
      return true;
    } else {
      return false;
    }
  }

  // Method to check if the username already exists
  // The method uses the databaseService to interact with the database
  async logExistUsername(username: string, id?: number): Promise<boolean> {
    // Find the user by username and is not deleted
    const whereCondition: Prisma.UsersWhereInput = {
      deleted: false,
      username,
    };

    // If the id is provided, exclude it from the search
    if (id) {
      whereCondition.id = { not: id };
    }

    // Check if the user exists
    const user = await this.databaseService.users.findFirst({
      where: whereCondition,
    });

    // If the user exists, return true
    // If the user does not exist, return false
    if (user) {
      return true;
    } else {
      return false;
    }
  }
}
