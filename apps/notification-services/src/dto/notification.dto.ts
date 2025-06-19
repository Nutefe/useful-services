import { NotificationTokenEntity } from '../entities/notification-token.entity';

export class NotificationDto {
  notification_token: NotificationTokenEntity;
  title: string;
  body: string;
  room: string;
}
