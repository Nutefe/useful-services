import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as firebase from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { NotificationTokenEntity } from './entities/notification-token.entity';
import { NotificationTokenDto } from './dto/notification-token.dto';
import { DatabaseService } from '@app/common';
import { NotificationDto } from './dto/notification.dto';
import { NotificationEntity } from './entities/notification.entity';

@Injectable()
export class NotificationServicesService {
  private readonly firebaseApp: firebase.app.App;

  constructor(
    private readonly configService: ConfigService,
    private readonly databaService: DatabaseService,
  ) {
    const serviceAccountPath =
      this.configService.get<string>('FIREBASE_KEY_PATH');

    if (!serviceAccountPath) {
      throw new Error('FIREBASE_KEY_PATH is not set in environment variables.');
    }

    const fullPath = path.resolve(serviceAccountPath);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Firebase service account file not found at ${fullPath}`);
    }

    const serviceAccount = JSON.parse(
      fs.readFileSync(fullPath, 'utf8'),
    ) as firebase.ServiceAccount;

    this.firebaseApp = firebase.initializeApp({
      credential: firebase.credential.cert(serviceAccount),
    });
  }

  async saveToken(
    notificationTokenDto: NotificationTokenDto,
  ): Promise<NotificationTokenEntity> {
    const { user_id, device_type, notification_token } = notificationTokenDto;
    const exist = await this.databaService.notificationTokens.findUnique({
      where: {
        notification_token: notification_token,
      },
    });

    if (exist) {
      throw new Error(
        'Notification token does exist. Please register the token first.',
      );
    }

    const newToken = await this.databaService.notificationTokens.create({
      data: {
        user: { connect: { id: user_id } },
        device_type,
        notification_token,
      },
    });

    return new NotificationTokenEntity(newToken);
  }

  async saveNotification(
    notificationDto: NotificationDto,
  ): Promise<NotificationEntity> {
    const { notification_token, title, body } = notificationDto;

    const newNotification = await this.databaService.notifications.create({
      data: {
        title,
        body,
        room: notificationDto.room || '',
        notification_token: {
          connect: {
            id: notification_token.id,
          },
        },
      },
      include: {
        notification_token: true,
      },
    });

    return new NotificationEntity(newNotification);
  }

  async findTokenByUserid(id: number): Promise<NotificationTokenEntity[]> {
    const tokens = await this.databaService.notificationTokens.findMany({
      where: {
        user: {
          id: id,
        },
        deleted: false,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return tokens.map((token) => new NotificationTokenEntity(token));
  }

  async findNotificationByUserid(id: number): Promise<NotificationEntity[]> {
    const notifs = await this.databaService.notifications.findMany({
      where: {
        notification_token: {
          user: {
            id: id,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return notifs.map((notif) => new NotificationEntity(notif));
  }

  async sendNotification() {
    await firebase
      .messaging()
      .send({
        notification: { title: 'Test', body: 'Test notification' },
        token:
          'ecaeM8DVQiCgHH-hciRejH:APA91bFQiE-wAHYaLfZu9kJ6zUHqXr8Ji-eQ8Og6VtNb3aKnyMzweMUNi9WBvn795h5XfrHkGMpqDEqOhON7MkeXXM-AGU8RqTu_G7eYMXFpqNg_Y7vNrwmGn3mFu4cEeJXk4dSYwfb2',
        android: { priority: 'high' },
      })
      .catch((error: any) => {
        console.error(error);
      });
  }

  async sendMutipleNotification(ids: number[], title: string, body: string) {
    const tokens = await this.databaService.notificationTokens.findMany({
      where: {
        deleted: false,
        user: {
          id: { in: ids },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    for (const token of tokens) {
      await firebase
        .messaging()
        .send({
          notification: {
            title: title,
            body: body,
          },
          token: token.notification_token,
          android: { priority: 'high' },
        })
        .catch((error: any) => {
          console.error(error);
        });
      const notif = new NotificationDto();
      notif.title = title;
      notif.body = body;
      notif.notification_token = new NotificationTokenEntity(token);
      notif.room = '';
      await this.saveNotification(notif);
    }
  }

  async sendMessageNotification(
    ids: number[],
    title: string,
    body: string,
    room: string,
  ) {
    const tokens = await this.databaService.notificationTokens.findMany({
      where: {
        deleted: false,
        user: {
          id: { in: ids },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    for (const token of tokens) {
      await firebase
        .messaging()
        .send({
          notification: {
            title: title,
            body: body,
          },
          data: { room: room },
          token: token.notification_token,
          android: { priority: 'high' },
        })
        .catch(async (error: unknown) => {
          if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            typeof (error as { code?: unknown }).code === 'string' &&
            (error as { code: string }).code ===
              'messaging/registration-token-not-registered'
          ) {
            await this.removeInvalidToken(token.notification_token);
          } else {
            console.error('Error sending notification:', error);
          }
        });

      const notif = new NotificationDto();
      notif.title = title;
      notif.body = body;
      notif.notification_token = new NotificationTokenEntity(token);
      notif.room = room;
      await this.saveNotification(notif);
    }
  }

  async removeInvalidToken(token: string) {
    const tokenInit = await this.databaService.notificationTokens.findUnique({
      where: {
        notification_token: token,
      },
    });
    if (!tokenInit) {
      console.warn(`Token ${token} not found in the database.`);
      return;
    }
    await this.databaService.notificationTokens.update({
      where: {
        id: tokenInit.id,
      },
      data: {
        deleted: true,
      },
    });
  }
}
