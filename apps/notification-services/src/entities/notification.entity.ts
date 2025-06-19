import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { NotificationsQueryInput } from './notification.type';
import { NotificationTokenEntity } from './notification-token.entity';

export class NotificationEntity {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  id?: bigint;
  @ApiProperty({ type: 'string', default: null })
  title?: string | null;
  @ApiProperty({ type: 'string', default: null })
  body?: string | null;
  @ApiProperty({ type: 'string', default: null })
  room?: string | null;
  @ApiProperty()
  notification_token?: NotificationTokenEntity;
  @ApiProperty()
  created_at?: string;

  constructor();

  constructor(data: NotificationsQueryInput);

  constructor(data?: NotificationsQueryInput) {
    if (!data) return;
    this.id = data?.id;
    if ('title' in data) {
      this.title = data?.title;
      this.body = data?.body;
      this.room = data?.room;
      this.notification_token = data?.notification_token
        ? new NotificationTokenEntity(data.notification_token)
        : undefined;
      this.created_at = data?.created_at.toJSON();
    }
  }
}
