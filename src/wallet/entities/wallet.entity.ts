import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'wallets',
  timestamps: true,
  paranoid: true,
})
export class Wallet extends Model<Wallet> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    unique: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true,
  })
  walletAddress: string;

  @Column(DataType.STRING)
  networkId: string;

  @Column(DataType.FLOAT)
  avgBuyAmount: number;

  @Column(DataType.FLOAT)
  winRate: number;

  @Column(DataType.FLOAT)
  netProfit: number;

  @Column(DataType.FLOAT)
  avgHoldingTime: number;

  @Column(DataType.STRING)
  buyAmountLabel: string;

  @Column(DataType.INTEGER)
  totalScore: number;

  @Column(DataType.INTEGER)
  age: number;

  @Column(DataType.INTEGER)
  dayActive: number;

  @Column(DataType.INTEGER)
  numTokensTraded: number;

  @Column(DataType.FLOAT)
  totalProfit: number;

  @Column(DataType.FLOAT)
  riskAssessment: number;

  @Column(DataType.FLOAT)
  avgTradeVolume: number;

  @Column(DataType.JSONB)
  SwapTime: Date[];

  @Column(DataType.FLOAT)
  TotalFee: number;

  @Column(DataType.STRING)
  BotActivity: string;

  @Column(DataType.STRING)
  details: string;

  @Column(DataType.INTEGER)
  totalnumPartiallyClosedData: number;

  @Column(DataType.INTEGER)
  totalNumofFullyOpenedData: number;

  @Column(DataType.INTEGER)
  totalTransactions: number;

  @Column(DataType.INTEGER)
  rank: number;
}
