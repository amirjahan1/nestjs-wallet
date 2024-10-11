import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import { winstonConfig } from './logger';
import { WinstonModule } from 'nest-winston';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // Create the main app
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  // Connect the microservice to RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://root:yourpassword@rabbitmq:5672`],
      queue: 'wallet_service_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  // Start the microservice
  await app.startAllMicroservices();

  // Set up Swagger (optional)
  const config = new DocumentBuilder()
    .setTitle('Wallet API')
    .setDescription('The wallet service API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use(json({ limit: '30mb' }));

  // Start the HTTP server
  await app.listen(3000);
  console.log('Wallet service is listening on port 3000');
}
bootstrap();
