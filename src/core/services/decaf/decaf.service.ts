import { Logger } from '@nestjs/common';
import axios from 'axios';
import process from 'node:process';

interface AccountInfo {
  publicKey: string;
  chain: string;
  index: number;
  isActivated: boolean;
  isPrivate: boolean;
}

export interface DecafUser {
  id: string;
  username: string;
  name: string;
  email: string;
  photoUrl: string;
  accountInfos: AccountInfo[];
  settings: { visibility: { email: boolean; name: boolean } };
}

export class DecafService {
  async getUser(email: string): Promise<DecafUser[] | null> {
    try {
      const response = await axios.get(
        `https://production.decafapi.com/searchUserProfile/v0?text=${email}`,
        {
          headers: { Authorization: process.env.DECAF_KEY }
        }
      );

      const data: Array<DecafUser> = response.data;
      if (!data.length) return null;

      return data;
    } catch (error) {
      Logger.error(error.message, error.stack, 'DecafService.getUer');
      throw error;
    }
  }
  async getUerSolWallet(
    email: string,
    walletAddress: string
  ): Promise<string | null> {
    try {
      const response = await axios.get(
        `https://production.decafapi.com/searchUserProfile/v0?text=${email}`,
        {
          headers: { Authorization: process.env.DECAF_KEY }
        }
      );

      const data: Array<DecafUser> = response.data;
      if (!data.length) return null;

      const wallet = data[0].accountInfos.find(
        (account) =>
          account.chain === 'solana' &&
          account.isActivated &&
          account.publicKey === walletAddress
      );

      return wallet?.publicKey || null;
    } catch (error) {
      Logger.error(error.message, error.stack, 'DecafService.getUerSolWallet');
      throw error;
    }
  }
}
