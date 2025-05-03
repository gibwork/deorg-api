import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import axios from 'axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import zlib from 'zlib';
import { StableCoin } from '@utils/stable-coin';

@Injectable()
export class TokenService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) {}

  async getTokenMetadata(token: string): Promise<any | undefined> {
    const connection = new Connection('https://api.mainnet-beta.solana.com');
    const metaplex = Metaplex.make(connection);

    const mintAddress = new PublicKey(token);

    const metadataAccount = metaplex
      .nfts()
      .pdas()
      .metadata({ mint: mintAddress });

    const metadataAccountInfo =
      await connection.getAccountInfo(metadataAccount);

    if (metadataAccountInfo) {
      const token = await metaplex
        .nfts()
        .findByMint({ mintAddress: mintAddress });
      return token;
    }
  }

  async getPrice(
    mintAddress: string,
    skipCache: boolean = false
  ): Promise<number | undefined> {
    try {
      if (!skipCache) {
        const priceCached = await this.cacheManager.get(`price-${mintAddress}`);
        if (priceCached) return Number(priceCached);
      }

      if (StableCoin.check(mintAddress)) {
        return 1;
      }

      const response = await axios.get(
        `https://api.jup.ag/price/v2?ids=${mintAddress}`
      );

      const price = response.data.data[mintAddress]?.price;

      if (!price) return undefined;

      if (price) {
        await this.cacheManager.set(`price-${mintAddress}`, price, { ttl: 60 });
      }

      return Number(price);
    } catch (error) {
      Logger.error(error.message, error.stack, 'PriceService.getPrice');
      throw error;
    }
  }

  async getInfo(mintAddress: string): Promise<TokenInfo | null> {
    try {
      const tokensCachedString = await this.cacheManager.get<string>('tokens');
      if (tokensCachedString) {
        const tokensCached: Array<any> = JSON.parse(
          zlib.inflateSync(Buffer.from(tokensCachedString, 'base64')).toString()
        );
        const token = tokensCached.find(
          (token) => token.address === mintAddress
        );
        if (token) {
          const logoURI = token.logoURI.replace('cf-ipfs.com', 'ipfs.io');
          return {
            ...token,
            logoURI
          };
        }
      }
      const tokens = await axios.get(
        `https://tokens.jup.ag/token/${mintAddress}`
      );

      const logoURI = tokens.data?.logoURI.replace('cf-ipfs.com', 'ipfs.io');

      return {
        ...tokens.data,
        logoURI
      };
    } catch (error) {
      if (error.response.status === 404) return null;

      Logger.error(error.message, error.stack, 'TokenService.getInfo');
      throw error;
    }
  }
}

export type TokenInfo = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  tags: string[];
  daily_volume: number;
  created_at: string;
  freeze_authority: string | null;
  mint_authority: string | null;
  permanent_delegate: string | null;
  minted_at: string;
  extensions: {
    coingeckoId: string;
  };
};
