import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsInt,
} from 'class-validator';

export class CreateWalletDto {
  @IsString({ message: 'Wallet Address is required and must be a string.' })
  walletAddress: string;

  @IsOptional()
  @IsString({ message: 'Network ID must be a string.' })
  networkId?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Average Buy Amount must be a number.' })
  avgBuyAmount?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Win Rate must be a number.' })
  winRate?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Net Profit must be a number.' })
  netProfit?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Average Holding Time must be a number.' })
  avgHoldingTime?: number;

  @IsOptional()
  @IsString({ message: 'Buy Amount Label must be a string.' })
  buyAmountLabel?: string;

  @IsOptional()
  @IsInt({ message: 'Total Score must be an integer.' })
  totalScore?: number;

  @IsOptional()
  @IsInt({ message: 'Age must be an integer.' })
  age?: number;

  @IsOptional()
  @IsInt({ message: 'Day Active must be an integer.' })
  dayActive?: number;

  @IsOptional()
  @IsInt({ message: 'Number of Tokens Traded must be an integer.' })
  numTokensTraded?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Total Profit must be a number.' })
  totalProfit?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Risk Assessment must be a number.' })
  riskAssessment?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Average Trade Volume must be a number.' })
  avgTradeVolume?: number;

  @IsOptional()
  @IsArray({ message: 'Swap Time must be an array of dates.' })
  SwapTime?: Date[];

  @IsOptional()
  @IsNumber({}, { message: 'Total Fee must be a number.' })
  TotalFee?: number;

  @IsOptional()
  @IsString({ message: 'Bot Activity must be a string.' })
  BotActivity?: string;

  @IsOptional()
  @IsString({ message: 'Details must be a string.' })
  details?: string;

  @IsOptional()
  @IsInt({
    message: 'Total Number of Partially Closed Data must be an integer.',
  })
  totalnumPartiallyClosedData?: number;

  @IsOptional()
  @IsInt({ message: 'Total Number of Fully Opened Data must be an integer.' })
  totalNumofFullyOpenedData?: number;

  @IsOptional()
  @IsInt({ message: 'Total Transactions must be an integer.' })
  totalTransactions?: number;

  @IsOptional()
  @IsInt({ message: 'Rank must be an integer.' })
  rank?: number;
}
