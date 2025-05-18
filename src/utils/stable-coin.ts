import { DevnetTokenInfo } from '@core/services/helius/helius.service';

export class StableCoin {
  static check(token: string): boolean {
    const stableCoins = new Set([
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' // USDT
    ]);

    return stableCoins.has(token);
  }

  static checkDevnet(token: string): boolean {
    const stableCoins = new Set([
      'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
      '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
    ]);

    return stableCoins.has(token);
  }

  static getDevnetTokenInfo(token: string): DevnetTokenInfo | undefined {
    const coins = new Map<string, DevnetTokenInfo>([
      [
        'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
        {
          address: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
          name: 'USD Coin Dev',
          symbol: 'USDC',
          decimals: 6,
          logoURI:
            'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
        }
      ],
      [
        '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
        {
          address: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
          name: 'USD Coin',
          symbol: 'USDC',
          decimals: 6,
          logoURI:
            'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU/logo.png'
        }
      ]
    ]);

    return coins.get(token);
  }
}
