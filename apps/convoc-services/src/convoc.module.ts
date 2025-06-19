import { Module } from '@nestjs/common';
import { ConvocController } from './convoc.controller';
import { ConvocService } from './convoc.service';
import { DatabaseModule, LoggerModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { OrganisationsModule } from './organisations/organisations.module';
import { ResponsablesModule } from './responsables/responsables.module';
import { MembresModule } from './membres/membres.module';
import { EvenementsModule } from './evenements/evenements.module';
import { EquipesModule } from './equipes/equipes.module';
import { ConvocationsModule } from './convocations/convocations.module';
import { ReponseOnvocationsModule } from './reponse-onvocations/reponse-onvocations.module';

@Module({
  imports: [
    DatabaseModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/convoc-services/.env',
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        RABBITMQ_URI: Joi.string().required(),
        RABBITMQ_QUEUE: Joi.string().required(),
        RABBITMQ_QUEUE_AUTH: Joi.string().required(),
        RABBITMQ_QUEUE_EMAIL: Joi.string().required(),
        RABBITMQ_QUEUE_NOTIFICATION: Joi.string().required(),
        AUTH_SERVICE: Joi.string().required(),
        EMAIL_SERVICE: Joi.string().required(),
        NOTIFICATION_SERVICE: Joi.string().required(),
      }),
    }),
    OrganisationsModule,
    ResponsablesModule,
    MembresModule,
    EvenementsModule,
    EquipesModule,
    ConvocationsModule,
    ReponseOnvocationsModule,
  ],
  controllers: [ConvocController],
  providers: [ConvocService],
})
export class ConvocModule {}
