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
import { EventPattern, Payload } from '@nestjs/microservices';

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

  // RabbitMQ Event Handlers

  // Handle wallet analysis requests via RabbitMQ
  @EventPattern('analyze_wallet_data')
  async handleWalletAnalysis(@Payload() data: any) {
    try {
      await this.walletService.analyzeJsonFile(); // Process the task
    } catch (error) {
      throw new Error(`Failed to process wallet analysis: ${error.message}`); // Automatic retry
    }
  }

  // Handle '/wallets' request via RabbitMQ
  @EventPattern('get_wallets')
  async handleGetWallets(@Payload() data: any) {
    const {
      sortBy = 'totalProfit',
      order = 'asc',
      page = 1,
      limit = 10,
    } = data;

    return await this.walletService.getWallets(sortBy, order, page, limit);
  }

  // Handle '/wallets/:id' request via RabbitMQ
  @EventPattern('get_wallet_by_id')
  async handleGetWalletById(@Payload() data: any) {
    return await this.walletService.getWalletByAddress(data.id);
  }

  // Handle '/wallets/top-tokens/:id' request via RabbitMQ
  @EventPattern('get_top_tokens_by_id')
  async handleGetTopTokens(@Payload() data: any) {
    // Add logic to handle top tokens request
    return `Top tokens for wallet id ${data.id}`;
  }
}
