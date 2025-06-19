import { NestFactory } from '@nestjs/core';
import { AuthServicesModule } from './auth-services.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { BigIntToNumberInterceptor, TransformInterceptor } from '@app/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(AuthServicesModule);

  const configService = app.get(ConfigService);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URI')],
      queue: configService.get<string>('RABBITMQ_QUEUE'),
      queueOptions: {
        durable: false,
      },
      // prefetchCount: 1,
      // noAck: false,
      // isGlobal: true,
      // persistent: true,
      // retryAttempts: 5,
      // retryDelay: 3000,
      // socketOptions: {
      //   timeout: 5000,
      //   keepAlive: true,
      //   heartbeat: 60,
      // },
    },
  });

  const config = new DocumentBuilder()
    .setTitle('SERVICE AUTH API')
    .setDescription('AUTH API is a REST API for managing the users data')
    .setVersion('1.0')
    .addTag('Endpoints')
    .addServer('https://useful.cyberethik.com/auth-service')
    .addBearerAuth(
      {
        description: 'JWT Authorization',
        type: 'http',
        in: 'header',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'defaultBearerAuth',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
    },
  });

  app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useLogger(app.get(Logger));
  app.enableCors({ origin: '*' });
  app.useBodyParser('json', { limit: '10mb' });
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalInterceptors(new BigIntToNumberInterceptor());
  await app.startAllMicroservices();
  await app.listen(configService.get<string>('PORT') ?? 3005);
}
bootstrap().catch((error) => {
  console.error('Error during bootstrap:', error);
});
