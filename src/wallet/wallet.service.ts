import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { Wallet } from './entities/wallet.entity';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet)
    private readonly walletModel: typeof Wallet,
  ) {}
  create(createWalletDto: CreateWalletDto) {
    return 'This action adds a new wallet';
  }

  findAll() {
    return `This action returns all wallet`;
  }

  findOne(id: number) {
    return `This action returns a #${id} wallet`;
  }

  update(id: number, updateWalletDto: UpdateWalletDto) {
    return `This action updates a #${id} wallet`;
  }

  remove(id: number) {
    return `This action removes a #${id} wallet`;
  }

  // Upload Json file (batch)
  async restoreDataFromJson(jsonData: any[]): Promise<void> {
    // Batch process the data to handle large files efficiently
    const chunkSize = 100; // Adjust batch size if necessary
    for (let i = 0; i < jsonData.length; i += chunkSize) {
      const batch = jsonData.slice(i, i + chunkSize);

      const processedBatch = batch.map((walletData) => {
        // Only keep the fields that are in your entity
        const {
          walletAddress,
          networkId,
          avgBuyAmount,
          winRate,
          netProfit,
          avgHoldingTime,
          buyAmountLabel,
          totalScore,
          age,
          dayActive,
          numTokensTraded,
          totalProfit,
          riskAssessment,
          avgTradeVolume,
          SwapTime,
          TotalFee,
          BotActivity,
          details,
          totalnumPartiallyClosedData,
          totalNumofFullyOpenedData,
          totalTransactions,
          rank,
        } = walletData;

        return {
          walletAddress,
          networkId,
          avgBuyAmount,
          winRate,
          netProfit,
          avgHoldingTime,
          buyAmountLabel,
          totalScore,
          age,
          dayActive,
          numTokensTraded,
          totalProfit,
          riskAssessment,
          avgTradeVolume,
          SwapTime,
          TotalFee,
          BotActivity,
          details,
          totalnumPartiallyClosedData,
          totalNumofFullyOpenedData,
          totalTransactions,
          rank,
        };
      });

      try {
        await this.walletModel.bulkCreate(processedBatch, {
          ignoreDuplicates: true,
        });
      } catch (error) {
        throw new HttpException(
          `Error inserting data: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
