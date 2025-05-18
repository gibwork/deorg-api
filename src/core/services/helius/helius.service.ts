import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { sleep } from '@utils/sleep';
import { StableCoin } from '@utils/stable-coin';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

@Injectable()
export class HeliusService {
  rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
  devnetRpcUrl = `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

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

  async getBalance(input: {
    publicKey: string;
    network: string;
  }): Promise<Array<TokenInfo>> {
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
            tokenType: 'fungible',
            displayOptions: {
              showNativeBalance: true
            }
          }
        })
      );

      const splTokenBalances = response.data?.result?.items ?? [];
      const nativeToken = response.data.result.nativeBalance;

      // Fetch all token prices in parallel
      const tokensWithPrices = await Promise.all(
        splTokenBalances.map(async (element) => {
          const { token_info: tokenInfo } = element || {};
          const tokenMintAddress = element?.id || null;
          if (
            tokenInfo.decimals === 0 ||
            (!element?.content?.metadata?.name && input.network !== 'devnet')
          ) {
            return null;
          }

          if (!tokenInfo.price_info && tokenMintAddress) {
            const tokenPrice = await this.getPrice(tokenMintAddress);

            tokenInfo.price_info = {
              total_price:
                getDisplayDecimalAmountFromAsset(
                  tokenInfo.balance,
                  tokenInfo.decimals
                ) * (tokenPrice ?? 0)
            };
          }

          if (StableCoin.check(tokenMintAddress) && !!tokenInfo.price_info) {
            tokenInfo.price_info.price_per_token = 1;
          }

          let name = element?.content?.metadata?.name || '';
          let logoURI = element?.content?.links?.image || '';

          if (input.network === 'devnet' && tokenMintAddress) {
            try {
              const devnetTokenInfo =
                await this.getDevnetTokenInfo(tokenMintAddress);
              name = devnetTokenInfo.name;
              logoURI = devnetTokenInfo.logoURI;
            } catch (error) {
              Logger.warn(
                `Failed to fetch devnet token info for ${tokenMintAddress}`,
                'HeliusService'
              );
            }
          }

          return {
            address: tokenMintAddress,
            symbol: element?.content?.metadata?.symbol || '',
            name,
            logoURI,
            tokenInfo
          };
        })
      );

      const tokens = tokensWithPrices.filter(
        (token): token is TokenInfo => token !== null
      );

      const solToken: TokenInfo = {
        address: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        name: 'Wrapped SOL',
        logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',
        tokenInfo: {
          balance: nativeToken.lamports,
          supply: -1,
          decimals: 9,
          symbol: 'SOL',
          token_program: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
          associated_token_address: '',
          price_info: {
            price_per_token: nativeToken.price_per_sol,
            total_price:
              (nativeToken.lamports / LAMPORTS_PER_SOL) *
              (nativeToken.price_per_sol ?? 0),
            currency: 'SOL'
          }
        }
      };

      return [...tokens, solToken];
    } catch (error) {
      if (error.response.status === 429) {
        throw new Error('Rate limit exceeded');
      }

      throw new Error('Unable to fetch token balances.');
    }
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

  async getPrice(mintAddress: string) {
    try {
      if (StableCoin.check(mintAddress)) {
        return 1;
      }

      const response = await axios.get(
        `https://api.jup.ag/price/v2?ids=${mintAddress}`
      );

      const price = response.data.data[mintAddress]?.price;

      if (!price) return undefined;

      return Number(price);
    } catch (error) {
      Logger.error(error.message, error.stack, 'PriceService.getPrice');
      throw error;
    }
  }

  async getDevnetTokenInfo(mintAddress: string): Promise<DevnetTokenInfo> {
    try {
      if (StableCoin.checkDevnet(mintAddress)) {
        return StableCoin.getDevnetTokenInfo(mintAddress)!;
      }

      const { data } = await axios.post(this.devnetRpcUrl, {
        jsonrpc: '2.0',
        id: 'get-token',
        method: 'getAsset',
        params: {
          id: mintAddress
        }
      });

      return {
        address: mintAddress,
        symbol: data.result.content.metadata.symbol,
        name: data.result.content.metadata.name,
        logoURI: data.result.content.files[0].uri,
        decimals: data.result.token_info.decimals
      };
    } catch (error) {
      Logger.error(
        error.message,
        error.stack,
        'PriceService.getDevnetTokenInfo'
      );
      throw error;
    }
  }
}

export interface DevnetTokenInfo {
  address: string;
  symbol: string;
  name: string;
  logoURI: string;
  decimals: number;
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

const getDisplayDecimalAmountFromAsset = (amount: number, decimals: number) => {
  return amount / Math.pow(10, decimals);
};
