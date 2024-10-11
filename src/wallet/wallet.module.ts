import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Wallet } from './entities/wallet.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { WalletAnalysis } from './entities/wallet-analysis.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    SequelizeModule.forFeature([Wallet, WalletAnalysis]),
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [`amqp://root:yourpassword@rabbitmq:5672`],
          queue: 'wallet_analysis_queue',
          queueOptions: {
            durable: true, // Messages are persisted to disk
            prefetchCount: 1,
          },
          noAck: false,
        },
      },
    ]),
  ], // Ensure SequelizeModule is imported here
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
