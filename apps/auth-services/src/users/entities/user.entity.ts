import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { UserQueryInput } from './user.type';
import { UserRoleServiceEntity } from './user-role-service.entity';

export class UserEntity {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  id?: bigint;
  @ApiProperty({ type: 'string', default: null })
  username?: string | null;
  @ApiProperty({ type: 'string', default: null })
  firstname?: string | null;
  @ApiProperty({ type: 'string', default: null })
  lastname?: string | null;
  @ApiProperty({ type: 'string', default: null })
  password?: string | null;
  @ApiProperty({ type: 'string', default: null })
  email?: string | null;
  @ApiProperty()
  is_active?: boolean;
  @ApiProperty()
  is_email_verified?: boolean;
  @ApiProperty()
  valid_or_reset_token: string | null = null;
  @ApiProperty({ type: 'array', default: [] })
  user_role_services?: UserRoleServiceEntity[];
  @ApiProperty()
  created_at?: string;
  @ApiProperty()
  updated_at?: string;

  constructor();

  constructor(data: UserQueryInput);

  constructor(data?: UserQueryInput) {
    if (!data) return;
    this.id = data?.id;
    if ('email' in data) {
      this.email = data?.email;
      this.username = data?.username;
      this.firstname = data?.firstname;
      this.lastname = data?.lastname;
      this.password = data?.password;
      this.is_active = data?.is_active;
      this.is_email_verified = data?.is_email_verified;
      this.valid_or_reset_token = data?.valid_or_reset_token;
      this.user_role_services = data?.user_role_services?.map(
        (urs) => new UserRoleServiceEntity(urs.role, urs.service),
      );
      this.created_at = data?.created_at.toJSON();
      this.updated_at = data?.updated_at.toJSON();
    }
  }
}
