import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { NotificationTokensQueryInput } from './notification-token.type';
import { UserEntity } from '@app/common';

export class NotificationTokenEntity {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  id?: bigint;
  @ApiProperty({ type: 'string', default: null })
  device_type?: string | null;
  @ApiProperty({ type: 'string', default: null })
  notification_token?: string | null;
  @ApiProperty({ type: 'array', default: [] })
  user?: UserEntity;
  @ApiProperty()
  created_at?: string;
  @ApiProperty()
  updated_at?: string;

  constructor();

  constructor(data: NotificationTokensQueryInput);

  constructor(data?: NotificationTokensQueryInput) {
    if (!data) return;
    this.id = data?.id;
    if ('device_type' in data) {
      this.device_type = data?.device_type;
      this.notification_token = data?.notification_token;
      this.user = new UserEntity(data.user);
      this.created_at = data?.created_at.toJSON();
      this.updated_at = data?.updated_at.toJSON();
    }
  }
}
