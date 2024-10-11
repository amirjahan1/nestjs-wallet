import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CallerService {
  constructor(
    @Inject('WALLET_SERVICE') private readonly walletServiceClient: ClientProxy, // RabbitMQ client
  ) {}

  // Array of possible Wallet Service actions with event names
  private walletEndpoints = [
    { pattern: 'get_wallets', data: {} }, // Call the /wallets endpoint
    { pattern: 'get_wallet_by_id', data: { id: this.getRandomId() } }, // Call /wallets/:id
    { pattern: 'get_top_tokens_by_id', data: { id: this.getRandomId() } }, // Call /wallets/top-tokens/:id
  ];

  // Randomly selects an event and sends the request
  async sendRandomRequest() {
    const randomRequest = this.getRandomRequest();
    const startTime = Date.now();
    try {
      // Use lastValueFrom instead of toPromise()

      await lastValueFrom(
        this.walletServiceClient.send(
          randomRequest.pattern,
          randomRequest.data,
        ),
      );
      const latency = Date.now() - startTime;
      console.log(
        `Request to ${randomRequest.pattern} completed. Latency: ${latency}ms`,
      );
    } catch (error) {
      console.error(error);
      console.error(
        `Failed to send request to ${randomRequest.pattern}: ${error.message}`,
      );
    }
  }

  // Generates a random request pattern and data to send
  private getRandomRequest() {
    const randomIndex = Math.floor(Math.random() * this.walletEndpoints.length);
    return this.walletEndpoints[randomIndex];
  }

  private getRandomId() {
    return Math.floor(Math.random() * 100); // Generate random ID between 0 and 100
  }

  // Cron job that sends 50 random requests per minute
  @Cron(CronExpression.EVERY_SECOND)
  async handleCron() {
    console.log('Starting to send 50 random requests...');
    for (let i = 0; i < 50; i++) {
      this.sendRandomRequest();
    }
  }
}
