import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';

export function createRmqClientConfig(
  envServiceName: string,
  envQueueName: string,
  defaultServiceName: string,
) {
  return {
    name: process.env[envServiceName] ?? defaultServiceName,
    useFactory: (configService: ConfigService) => {
      const rabbitmqUri = configService.get<string>('RABBITMQ_URI');
      const rabbitmqQueue = configService.get<string>(envQueueName);
      if (!rabbitmqUri) {
        throw new Error('RABBITMQ_URI is not defined');
      }
      if (!rabbitmqQueue) {
        throw new Error(`${envQueueName} is not defined`);
      }
      return {
        transport: Transport.RMQ as const,
        options: {
          urls: [rabbitmqUri],
          queue: rabbitmqQueue,
          queueOptions: {
            durable: false,
          },
        },
      };
    },
    inject: [ConfigService],
  };
}
