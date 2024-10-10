import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletModule } from './wallet/wallet.module';
import { UploadController } from './wallet/upload.controller';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'root',
      password: 'yourpassword',
      database: 'root',
      autoLoadModels: true,
      synchronize: true,
    }),
    WalletModule, // Import WalletModule to load the Wallet entity
  ],
  controllers: [AppController, UploadController],
  providers: [AppService],
})
export class AppModule {}
