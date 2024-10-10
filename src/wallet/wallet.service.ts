import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { Wallet } from './entities/wallet.entity';
import { InjectModel } from '@nestjs/sequelize';
import * as path from 'path';
import * as fs from 'fs-extra';
import { WalletAnalysis } from './entities/wallet-analysis.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet)
    private readonly walletModel: typeof Wallet,
    @InjectModel(WalletAnalysis)
    private readonly walletAnalysisModel: typeof WalletAnalysis,
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}
  create(createWalletDto: CreateWalletDto) {
    return 'This action adds a new wallet';
  }

  async getWallets(
    sortBy: string,
    order: 'asc' | 'desc',
    page: number,
    limit: number,
  ) {
    const validSortFields = ['totalProfit', 'numTokensTraded', 'dayActive'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'totalProfit';

    const offset = (page - 1) * limit;

    const wallets = await this.walletModel.findAll({
      order: [[sortField, order.toUpperCase()]],
      limit,
      offset,
    });

    const totalItems = await this.walletModel.count();

    return {
      data: wallets,
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async getWalletByAddress(address: string) {
    const wallet = await this.walletModel.findOne({
      where: { walletAddress: address },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with address ${address} not found`);
    }

    return wallet;
  }

  async getWalletSummary() {
    const totalWallets = await this.walletModel.count();

    const totalProfitResult = await this.walletModel.sum('totalProfit');
    const totalTransactionsResult =
      await this.walletModel.sum('totalTransactions');

    const avgProfit = totalProfitResult / totalWallets;

    return {
      totalWallets,
      totalProfit: totalProfitResult,
      totalTransactions: totalTransactionsResult,
      averageProfit: avgProfit,
    };
  }

  async sendAnalyzeRequest(data: any) {
    return this.client.emit('analyze_wallet_data', data); // Send data to RabbitMQ queue
  }

  async analyzeJsonFile() {
    try {
      const dirPath = path.join(
        __dirname,
        '..',
        '..',
        'upload',
        'backup',
        'wallet_data',
      );
      const latestFile = this.getLatestFile(dirPath); // Get the latest file

      if (!latestFile) {
        throw new HttpException(
          'No JSON file found for analysis',
          HttpStatus.BAD_REQUEST,
        );
      }

      const filePath = path.join(dirPath, latestFile);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const jsonData = JSON.parse(fileContent);

      // Analyze the JSON data
      const analysis = await this.performAnalysis(jsonData);

      // Save the analysis result to the database
      await this.saveAnalysisResult(analysis);

      return analysis;
    } catch (error) {
      throw new HttpException(
        `Failed to analyze data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async saveAnalysisResult(analysis: any) {
    // Save the analysis result to the database
    await this.walletAnalysisModel.create({
      totalProfit: analysis.totalProfit,
      totalLoss: analysis.totalLoss,
      mostProfitableToken: analysis.mostProfitableToken,
      leastProfitableToken: analysis.leastProfitableToken,
      uniqueTokensTraded: analysis.uniqueTokensTraded,
      activeTradingDays: analysis.activeTradingDays,
      riskAssessment: analysis.riskAssessment,
    });
  }

  async performAnalysis(data: any[]): Promise<any> {
    let totalProfit = 0;
    let totalLoss = 0;
    let mostProfitableToken = null;
    let leastProfitableToken = null;
    let mostProfitableTokenProfit = -Infinity;
    let leastProfitableTokenProfit = Infinity;
    const uniqueTokensTraded = new Set();
    const activeTradingDays = new Set();
    let riskAssessment = 0;

    // Analyze each wallet entry
    for (const wallet of data) {
      if (wallet.totalProfit !== undefined) {
        totalProfit += wallet.totalProfit;
        if (wallet.totalProfit > 0) {
          totalLoss += 0; // Profit wallets do not contribute to loss
        } else {
          totalLoss += wallet.totalProfit; // Negative totalProfit counts as loss
        }
      }

      // Check for the most/least profitable token
      if (wallet.numTokensTraded !== undefined) {
        uniqueTokensTraded.add(wallet.numTokensTraded); // Add token to the set
      }

      if (wallet.dayActive !== undefined) {
        activeTradingDays.add(wallet.dayActive); // Count unique active days
      }

      if (
        wallet.avgBuyAmount !== undefined &&
        wallet.totalProfit !== undefined
      ) {
        if (wallet.totalProfit > mostProfitableTokenProfit) {
          mostProfitableTokenProfit = wallet.totalProfit;
          mostProfitableToken = wallet.walletAddress; // Assume walletAddress is tied to tokens traded
        }
        if (wallet.totalProfit < leastProfitableTokenProfit) {
          leastProfitableTokenProfit = wallet.totalProfit;
          leastProfitableToken = wallet.walletAddress; // Assume walletAddress is tied to tokens traded
        }
      }

      // Assess risk levels based on diversification
      if (wallet.numTokensTraded && wallet.numTokensTraded > 0) {
        riskAssessment += 1 / wallet.numTokensTraded; // Simple diversification-based risk metric
      }
    }

    // Calculate overall risk score as the average
    riskAssessment = riskAssessment / data.length;

    // Store the results in a new summary object
    const analysisResult = {
      totalProfit,
      totalLoss,
      mostProfitableToken,
      leastProfitableToken,
      uniqueTokensTraded: uniqueTokensTraded.size,
      activeTradingDays: activeTradingDays.size,
      riskAssessment,
    };

    // Return the analysis result
    return analysisResult;
  }

  // Helper method to find the latest file in the directory
  getLatestFile(directory: string): string | null {
    const files = fs.readdirSync(directory);

    // Filter for only JSON files
    const jsonFiles = files.filter((file) => file.endsWith('.json'));

    if (jsonFiles.length === 0) {
      return null;
    }

    // Sort files by creation time
    const sortedFiles = jsonFiles
      .map((file) => ({
        file,
        time: fs.statSync(path.join(directory, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    // Return the most recent file
    return sortedFiles[0].file;
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
