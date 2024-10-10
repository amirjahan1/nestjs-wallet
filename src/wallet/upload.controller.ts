import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { WalletService } from './wallet.service';
import * as path from 'path';
import * as fs from 'fs-extra';
import { Express } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private readonly walletService: WalletService) {}

  @Post('wallet-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(
            __dirname,
            '..',
            '..',
            'upload',
            'backup',
            'wallet_data',
          );
          fs.ensureDirSync(uploadPath); // Ensure the directory exists
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}-${file.originalname}`);
        },
      }),
      limits: { fileSize: 30 * 1024 * 1024 }, // Max file size 30MB
      fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/json') {
          return cb(
            new HttpException(
              'Only JSON files are allowed!',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadWalletData(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
    }

    const filePath = path.join(file.destination, file.filename);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    // Process and restore JSON data to the wallets table
    await this.walletService.restoreDataFromJson(jsonData);

    return {
      message: 'File uploaded and processed successfully',
      filename: file.filename,
    };
  }
}
