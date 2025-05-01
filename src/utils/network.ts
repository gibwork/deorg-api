import process from 'node:process';

export class Network {
  static get(network?: 'mainnet' | 'devnet'): 'mainnet' | 'devnet' {
    if (process.env.NODE_ENV === 'PROD') return 'mainnet';

    return network ? network : 'mainnet';
  }

  static getConnectionNetwork(
    network?: 'mainnet' | 'devnet'
  ): 'mainnet-beta' | 'devnet' {
    if (process.env.NODE_ENV === 'PROD') return 'mainnet-beta';

    return network === 'mainnet' ? 'mainnet-beta' : 'devnet';
  }
}
