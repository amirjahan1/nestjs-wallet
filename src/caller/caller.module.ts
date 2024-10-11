import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CallerService } from './caller.service';
import { ScheduleModule } from '@nestjs/schedule'; // Used for cron job/interval

@Module({
  imports: [
    ScheduleModule.forRoot(), // For cron jobs
    ClientsModule.register([
      {
        name: 'WALLET_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [`amqp://root:yourpassword@localhost:5672`], // RabbitMQ URL
          queue: 'wallet_service_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [CallerService],
})
export class CallerModule {}
