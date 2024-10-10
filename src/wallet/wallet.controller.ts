import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EventPattern } from '@nestjs/microservices';

@ApiTags('Wallets')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('analyze')
  async analyzeWalletsData() {
    try {
      return this.walletService.analyzeJsonFile();
    } catch (error) {
      throw new HttpException(
        'Failed to analyze data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiQuery({
    name: 'sort_by',
    enum: ['totalProfit', 'numTokensTraded', 'dayActive'],
    required: false,
  })
  @ApiQuery({ name: 'order', enum: ['asc', 'desc'], required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async getWallets(
    @Query('sort_by') sortBy: string,
    @Query('order') order: 'asc' | 'desc' = 'asc',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.walletService.getWallets(sortBy, order, page, limit);
  }

  @Get('summary')
  async getWalletSummary() {
    return this.walletService.getWalletSummary();
  }

  @Get(':address')
  @ApiParam({ name: 'address', description: 'Wallet Address' })
  async getWalletByAddress(@Param('address') address: string) {
    return this.walletService.getWalletByAddress(address);
  }

  @EventPattern('analyze_wallet_data')
  async handleWalletAnalysis(data: any) {
    try {
      await this.walletService.analyzeJsonFile(); // Process the task
    } catch (error) {
      throw new Error(`Failed to process wallet analysis: ${error.message}`); // Automatic retry
    }
  }
}
