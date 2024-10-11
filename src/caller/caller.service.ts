import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule';
import { catchError, lastValueFrom, retry, timeout } from 'rxjs';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class CallerService {
  constructor(
    @Inject('WALLET_SERVICE') private readonly walletServiceClient: ClientProxy, // RabbitMQ client
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  // Array of possible Wallet Service actions with event names
  private walletEndpoints = [
    { pattern: 'get_wallets', data: {} }, // Call the /wallets endpoint
    // { pattern: 'get_wallet_by_id', data: { id: this.getRandomId() } }, // Call /wallets/:id
    // { pattern: 'get_top_tokens_by_id', data: { id: this.getRandomId() } }, // Call /wallets/top-tokens/:id
  ];

  // Randomly selects an event and sends the request
  async sendRandomRequest() {
    const randomRequest = this.getRandomRequest();
    const startTime = Date.now();
    this.logger.log(`Sending request: ${randomRequest.pattern}`);
    try {
      // Use lastValueFrom instead of toPromise()
      console.log('func start');
      await lastValueFrom(
        this.walletServiceClient
          .send(randomRequest.pattern, randomRequest.data)
          .pipe(
            timeout(5000), // Timeout after 5 seconds
            retry(3), // Retry 3 times
            catchError((err) => {
              throw err; // Throw error to catch in the try-catch block
            }),
          ),
      );
      console.log('func finish');
      const latency = Date.now() - startTime;
      this.logger.log(
        `Request to ${randomRequest.pattern} succeeded. Latency: ${latency}ms`,
      );
    } catch (error) {
      const latency = Date.now() - startTime;
      this.logger.error(
        `Request to ${randomRequest.pattern} failed after ${latency}ms. Error: ${error.message}`,
      );
    }
  }

  // Generates a random request pattern and data to send
  private getRandomRequest() {
    const requests = [
      { pattern: 'get_wallets', data: {} },
      // { pattern: 'get_wallet_by_id', data: { id: this.getRandomId() } },
      // { pattern: 'get_top_tokens_by_id', data: { id: this.getRandomId() } },
    ];
    const randomIndex = Math.floor(Math.random() * requests.length);
    return requests[randomIndex];
  }

  private getRandomId() {
    return Math.floor(Math.random() * 100); // Generate random ID between 0 and 100
  }

  // Cron job that sends 50 random requests per minute
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    console.log('Starting to send 50 random requests...');
    for (let i = 0; i < 50; i++) {
      this.sendRandomRequest();
    }
  }
}
