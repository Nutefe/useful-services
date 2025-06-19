import { Module } from '@nestjs/common';
import { EmailServicesController } from './email-services.controller';
import { EmailServicesService } from './email-services.service';
import { DatabaseModule, LoggerModule } from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    DatabaseModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/email-services/.env',
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        EMAIL_HOST: Joi.string().required(),
        EMAIL_USER: Joi.string().email().required(),
        EMAIL_PASSWORD: Joi.string().required(),
        EMAIL_FROM: Joi.string().email().required(),
        EMAIL_TEMPLATE_PATH: Joi.string(),
        RABBITMQ_URI: Joi.string().required(),
        RABBITMQ_QUEUE: Joi.string().required(),
      }),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_HOST'), // ?? 'mail.cyberethik.com',
          port: 465,
          secure: true,
          auth: {
            user: configService.get<string>('EMAIL_USER'), //'notifications@cyberethik.com',
            pass: configService.get<string>('EMAIL_PASSWORD'),
          },
          tls: {
            // Si besoin d'accepter des certificats auto-signés (optionnel)
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: `"No Reply" <${configService.get('MAIL_FROM')}>`,
        },
        template: {
          dir: join(
            process.cwd(),
            configService.get<string>('EMAIL_TEMPLATE_PATH') ??
              './apps/email-services/templates',
          ),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [EmailServicesController],
  providers: [EmailServicesService],
})
export class EmailServicesModule {}
