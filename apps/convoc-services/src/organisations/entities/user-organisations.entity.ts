import { ApiProperty } from '@nestjs/swagger';
import { OrganisationsEntity } from './organisation.entity';
import { OrganisationsQueryInput } from './organisation.type';
import { UserEntity, UserQueryInput } from '@app/common';

export class UserOrganisationsEntity {
  @ApiProperty({ type: () => UserEntity, default: null })
  user?: UserEntity | null;
  @ApiProperty({ type: () => OrganisationsEntity, default: null })
  organisation?: OrganisationsEntity | null;

  constructor();

  constructor(data: {
    user?: UserQueryInput;
    organisation?: OrganisationsQueryInput;
  });

  constructor(data?: {
    user?: UserQueryInput;
    organisation?: OrganisationsQueryInput;
  }) {
    if (!data) return;
    this.user = data.user ? new UserEntity(data.user) : null;
    this.organisation = data.organisation
      ? new OrganisationsEntity(data.organisation)
      : null;
  }
}
