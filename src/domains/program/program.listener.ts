import { Injectable, Logger } from '@nestjs/common';
import WebSocket from 'ws';
import { ProgramHandleEventsUsecase } from './program-handle-events.usecase';
import { idl } from '@deorg/node';

@Injectable()
export class ProgramListener {
  private ws: WebSocket;

  constructor(
    private readonly programHandleEventsUsecase: ProgramHandleEventsUsecase
  ) {
    this.ws = new WebSocket(
      `wss://atlas-devnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
    );

    this.ws.on('open', () => {
      console.log('WebSocket is open');
      this.startPing();
    });

    this.ws.on('message', async (message) => {
      const data = JSON.parse(message.toString());
      Logger.log(`message: ${message.toString()}`, 'ProgramListener');
      if (data.params?.result?.transaction?.meta?.logMessages) {
        await this.programHandleEventsUsecase.execute({
          logMessages: data.params.result.transaction.meta.logMessages
        });
      }
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.ws.on('close', () => {
      console.log('WebSocket is closed');
    });
  }

  public getWsStatus() {
    return this.ws.readyState;
  }

  public async startMonitoring() {
    try {
      const request = {
        jsonrpc: '2.0',
        id: 420,
        method: 'transactionSubscribe',
        params: [
          {
            accountInclude: [idl.address]
          },
          {
            commitment: 'confirmed',
            encoding: 'jsonParsed',
            transactionDetails: 'full',
            showRewards: true,
            maxSupportedTransactionVersion: 0
          }
        ]
      };
      this.ws.send(JSON.stringify(request));
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  }

  startPing() {
    setInterval(() => {
      if (this.ws.readyState === 1) {
        this.ws.ping();
        console.log('Ping sent');
      }
    }, 30000); // Ping every 30 seconds
  }
}
