import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Wallet } from './entities/wallet.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { WalletAnalysis } from './entities/wallet-analysis.entity';

@Module({
  imports: [SequelizeModule.forFeature([Wallet, WalletAnalysis])], // Ensure SequelizeModule is imported here
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
