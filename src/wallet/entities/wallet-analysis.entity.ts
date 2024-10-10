import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'wallet_analysis',
  timestamps: true,
})
export class WalletAnalysis extends Model<WalletAnalysis> {
  @Column(DataType.FLOAT)
  totalProfit: number;

  @Column(DataType.FLOAT)
  totalLoss: number;

  @Column(DataType.STRING)
  mostProfitableToken: string;

  @Column(DataType.STRING)
  leastProfitableToken: string;

  @Column(DataType.INTEGER)
  uniqueTokensTraded: number;

  @Column(DataType.INTEGER)
  activeTradingDays: number;

  @Column(DataType.FLOAT)
  riskAssessment: number;
}
