import { BadRequestException, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import process from 'node:process';

export class TeleswapService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${process.env.TELESWAP_URL}/crosschain`,
      headers: {
        'Teleswap-X-API-Key': process.env.TELESWAP_TOKEN
      }
    });
  }

  async getQuote({ chain, amount }: GetQuote): Promise<string> {
    try {
      const response = await this.api.post(`/simulate`, {
        currencyFrom: chain,
        currencyTo: 'sol',
        amountFrom: amount
      });

      return response.data;
    } catch (error) {
      if (error.response?.data?.error.includes('Send minimum')) {
        throw new BadRequestException(error.response?.data?.error);
      }
      Logger.error(error.message, error.stack, 'TeleswapService.getQuote');
      throw error;
    }
  }

  async swap(dto: Swap): Promise<SwapResponse> {
    try {
      const response = await this.api.post(`/swap`, {
        currencyFrom: dto.chain,
        currencyTo: 'sol',
        currencyFromAmount: dto.amount,
        currencyToAmount: dto.quote,
        addressTo: dto.vaultTokenAccount,
        refundAddress: dto.refundAddress,
        userAgent: 'chrome',
        siteLanguage: 'en/us',
        acceptLanguage: 'en/us',
        deviceTimezone: 'utc',
        deviceOperatingSystem: 'macos',
        userIpAddress: '123123',
        userId: 1000008
      });

      return response.data;
    } catch (error) {
      Logger.error(error.message, error.stack, 'TeleswapService.swap');
      throw error;
    }
  }

  async checkStatus(id: string): Promise<SwapResponse> {
    try {
      const response = await this.api.get(`/swap/${id}`);

      return response.data;
    } catch (error) {
      Logger.error(error.message, error.stack, 'TeleswapService.checkStatus');
      throw error;
    }
  }

  async getTokens(): Promise<Array<Token>> {
    try {
      const response = await this.api.get('/token');

      return response.data;
    } catch (error) {
      Logger.error(error.message, error.stack, 'TeleswapService.getTokens');
      throw error;
    }
  }
}

interface GetQuote {
  chain: string;
  amount: number;
}

interface Swap {
  chain: string;
  amount: number;
  quote: string;
  vaultTokenAccount: string;
  refundAddress: string;
}

export interface SwapResponse {
  id: string;
  userId: number;
  timestamp: string;
  currencyFrom: string;
  currencyTo: string;
  amountFrom: string;
  expectedAmount: string;
  amountTo: string;
  addressFrom: string;
  addressTo: string;
  extraIdTo: string | null;
  extraIdFrom: string | null;
  userRefundAddress: string | null;
  userRefundExtraId: string | null;
  txFrom: string | null;
  txTo: string | null;
  status: string;
}

export interface Token {
  _id: string;
  name: string;
  symbol: string;
  img: string;
  network: string;
  address: string;
  isFiat: boolean;
  createdAt: string;
}
