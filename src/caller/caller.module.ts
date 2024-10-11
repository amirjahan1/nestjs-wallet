import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CallerService } from './caller.service';
import { ScheduleModule } from '@nestjs/schedule';
import { winstonConfig } from '../logger';
import { WinstonModule } from 'nest-winston'; // Used for cron job/interval

@Module({
  imports: [
    ScheduleModule.forRoot(), // For cron jobs
    ClientsModule.register([
      {
        name: 'WALLET_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [`amqp://root:yourpassword@rabbitmq:5672`],
          queue: 'wallet_service_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    WinstonModule.forRoot(winstonConfig), // Add WinstonModule here for logging
  ],
  providers: [CallerService],
})
export class CallerModule {}
