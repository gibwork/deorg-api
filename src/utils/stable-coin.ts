export class StableCoin {
  static check(token: string): boolean {
    const stableCoins = new Set([
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' // USDT
    ]);

    return stableCoins.has(token);
  }
}
