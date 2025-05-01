import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { sleep } from '@utils/sleep';

@Injectable()
export class HeliusService {
  rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

  constructor() {
    axios.defaults.timeout = 10000;
  }

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retries = 3
  ): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        if (
          attempt === retries ||
          (![500, 429].includes(error.response?.status) &&
            error.code !== 'ECONNABORTED')
        ) {
          throw error;
        }
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        Logger.log(
          `Retry attempt ${attempt}, waiting ${delay}ms`,
          'HeliusService'
        );
        await sleep(delay);
      }
    }
    throw new Error('Max retries reached');
  }

  async getNFTsFromAccount(input: {
    publicKey: string;
    network: string;
    collectionAddress?: string;
  }) {
    try {
      const url =
        input.network === 'devnet'
          ? this.rpcUrl.replace('mainnet', 'devnet')
          : this.rpcUrl;

      const response = await this.retryRequest(() =>
        axios.post(url, {
          id: 1,
          jsonrpc: '2.0',
          method: 'searchAssets',
          params: {
            ownerAddress: input.publicKey,
            tokenType: 'regularNft',
            grouping: input.collectionAddress
              ? ['collection', input.collectionAddress]
              : null,
            displayOptions: {
              showCollectionMetadata: true,
              showUnverifiedCollections: false,
              showClosedAccounts: false,
              showZeroBalance: false
            }
          }
        })
      );

      const nftAssets = response.data?.result?.items ?? [];
      const nfts = nftAssets.map((element: any) => {
        const metadata = element?.content?.metadata || {};
        const links = element?.content?.links || {};

        const collectionGroup =
          element?.grouping?.find(
            (group: any) => group.group_key === 'collection'
          ) || {};

        return {
          address: element?.id || null,
          symbol: metadata?.symbol || '',
          name: metadata?.name || '',
          imageURI: links?.image || '',
          collectionAddress: collectionGroup?.group_value || null,
          collectionName: collectionGroup?.collection_metadata?.name || ''
        };
      });

      return nfts;
    } catch (error) {
      if (error.response.status === 429) {
        throw new Error('Rate limit exceeded');
      }

      throw new Error('Unable to fetch NFTs.');
    }
  }

  async getTransactions(
    address: string,
    network?: string
  ): Promise<Array<Transaction>> {
    try {
      const response = await this.retryRequest(() =>
        axios.get(
          `https://api${network === 'devnet' ? '-devnet' : ''}.helius.xyz/v0/addresses/${address}/transactions?api-key=${process.env.HELIUS_API_KEY}`
        )
      );

      return response.data;
    } catch (error) {
      throw new Error('Unable to fetch transactions');
    }
  }
}

interface Transaction {
  description: string;
  type: string;
  source: string;
  fee: number;
  feePayer: string;
  signature: string;
  slot: number;
  timestamp: number;
  nativeTransfers: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }>;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  logoURI: string;
  tokenInfo: {
    symbol: string;
    balance: number;
    supply: number;
    decimals: number;
    token_program: string;
    associated_token_address: string;
    price_info: {
      price_per_token: number;
      total_price: number;
      currency: string;
    };
  };
}
