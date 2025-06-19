import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from '@app/common';
import { UserEntity } from './entities/user.entity';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { includeUserRoleService } from './entities/user.utils';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    // private readonly jwtService: JwtService,
  ) {}

  // Method to create a new user
  // The method uses the databaseService to interact with the database
  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    // Check if the email already exists
    // If it does, throw a ConflictException
    if (await this.logExistEmail(createUserDto.email)) {
      throw new ConflictException('Email already exist');
    }

    // Check if the username already exists
    // If it does, throw a ConflictException
    if (
      createUserDto.username &&
      (await this.logExistUsername(createUserDto.username))
    ) {
      throw new ConflictException('Username already exist');
    }

    // Create a new user with the provided data
    // Hash the password before saving it to the database
    // Include the profils associated with the user
    const { privileges, ...userData } = createUserDto;
    const user = await this.databaseService.users.create({
      data: {
        ...userData,
        user_role_services: {
          create: privileges.map((privilege) => ({
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
        password: createUserDto.password
          ? await bcrypt.hash(createUserDto.password, 10)
          : null,
      },
    });

    // Return the created user as a UtilisateursEntity
    return new UserEntity(user);
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: number): Promise<UserEntity> {
    // Find the user by ID
    // Include the profils associated with the user
    const user = await this.databaseService.users.findUnique({
      where: { id },
      include: includeUserRoleService,
    });

    // If the user is not found, throw a NotFoundException
    if (!user) {
      throw new NotFoundException('user not found');
    }

    // Return the found user as a UtilisateursEntity
    return new UserEntity(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    // Find the user by ID and is not deleted
    const userOld = await this.databaseService.users.findUnique({
      where: { id, deleted: false },
    });

    // If the user is not found, throw a NotFoundException
    if (!userOld) {
      throw new NotFoundException('User not found');
    }

    const { username, email, firstname, lastname, is_active, privileges } =
      updateUserDto;
    // Check if the email already exists
    // If it does, throw a ConflictException
    if (await this.logExistEmail(email, id)) {
      throw new ConflictException('Email already exist');
    }

    // Check if the username already exists
    // If it does, throw a ConflictException
    if (username && (await this.logExistUsername(username, id))) {
      throw new ConflictException('Username already exist');
    }

    // Update the user with the provided data
    // Hash the password before saving it to the database
    const user = await this.databaseService.users.update({
      where: { id: id },
      data: {
        username: username ?? userOld.username,
        email: email ?? userOld.email,
        firstname: firstname ?? userOld.firstname,
        lastname: lastname ?? userOld.lastname,
        is_active: is_active,
        user_role_services: {
          create: privileges.map((privilege) => ({
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
      },
    });

    // Return the updated user as a UtilisateursEntity
    return new UserEntity(user);
  }

  // Method to update the password of a user by ID
  // The method uses the databaseService to interact with the database
  async updatePassword(
    id: number,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    // Find the user by ID and is not deleted
    const userOld = await this.databaseService.users.findUnique({
      where: { id, deleted: false },
    });

    // If the user is not found, throw a NotFoundException
    if (!userOld) {
      throw new NotFoundException(`user id ${id} not exist`);
    }

    const { oldPassword, newPassword } = updatePasswordDto;

    // Check if the old password is valid
    const isOldPasswordValid = userOld.password
      ? await this.doesPasswordMatch(oldPassword, userOld.password)
      : false;

    // If the old password is valid, hash the new password and update it in the database
    // Increment the version of the user
    if (isOldPasswordValid) {
      userOld.password = await bcrypt.hash(newPassword, 10);
      await this.databaseService.users.update({
        where: { id, version: userOld.version },
        data: {
          password: userOld.password,
          version: { increment: 1 },
        },
      });
    }
  }

  // Method to check if the password matches the hashed password
  // The method uses bcrypt to compare the passwords
  async doesPasswordMatch(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    // Check if the password is valid
    return await bcrypt.compare(password, hashedPassword);
  }

  // Method to check if the email and password match
  // The method uses the databaseService to interact with the database
  async emailPasswordMatch(email: string, password: string): Promise<boolean> {
    // Find the user by email and is not deleted
    const user = await this.databaseService.users.findUnique({
      where: { email: email, deleted: false },
    });

    // If the user is not found, throw a NotFoundException
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if the password is valid
    const isPasswordValid = user.password
      ? await bcrypt.compare(password, user.password)
      : false;

    // return the result
    return isPasswordValid;
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

  // Method to log in the user
  // The method uses the validateUser method to check if the user exists
  // If the user exists, return the user without the password
  async logIn(existingUser: LoginUserDto): Promise<UserEntity> {
    const { email, password } = existingUser;

    // Check if the email and password match
    const user = await this.validateUser(email, password);

    // If the user is not found, throw a UnauthorizedException
    if (!user) {
      throw new UnauthorizedException();
    }

    // The password is removed from the user object
    delete user.password;

    // return the user
    return user;
  }

  // Method to check if the email is verified
  // The method uses the databaseService to interact with the database
  async logEmailVerified(email: string): Promise<boolean> {
    // Find the user by email and is not deleted
    const user = await this.databaseService.users.findUnique({
      where: { email: email, deleted: false },
    });

    // If the user is not found, return false
    // If the user is found , return the email_verified property value
    if (user) {
      return user.is_email_verified;
    } else {
      return false;
    }
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

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
