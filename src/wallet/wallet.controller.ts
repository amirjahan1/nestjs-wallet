import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Wallets')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  create(@Body() createWalletDto: CreateWalletDto) {
    return this.walletService.create(createWalletDto);
  }

  @Post('analyze')
  async analyzeWalletsData() {
    try {
      await this.walletService.analyzeJsonFile();
      return { message: 'Wallet data successfully analyzed and updated' };
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWalletDto: UpdateWalletDto) {
    return this.walletService.update(+id, updateWalletDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.walletService.remove(+id);
  }
}
