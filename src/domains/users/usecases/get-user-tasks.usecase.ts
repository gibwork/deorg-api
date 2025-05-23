import { Injectable } from '@nestjs/common';
import { Connection, PublicKey } from '@solana/web3.js';
import { HeliusService } from '@core/services/helius/helius.service';
import { Deorg } from '@deorg/node';

@Injectable()
export class GetUserTasksUsecase {
  constructor(private readonly heliusService: HeliusService) {}

  private connection = new Connection(this.heliusService.devnetRpcUrl);

  async execute(userWalletAddress: string) {
    const deorg = new Deorg({
      rpcUrl: this.heliusService.devnetRpcUrl
    });

    const tasks = await deorg.getTasks(userWalletAddress);

    const tasksEnriched = await this.enrichTasks(tasks);

    return tasksEnriched;
  }

  private async enrichTasks(tasks: any[]) {
    const tasksEnriched: any[] = [];

    for (const task of tasks) {
      const [vaultTokenAccountPDA] = await PublicKey.findProgramAddress(
        [
          Buffer.from('vault_token_account'),
          new PublicKey(task.accountAddress).toBuffer()
        ],
        new PublicKey('EGnx6SNyQkF2rxXc2uGwVVkZUMoFVfGQWNe18jzapx2h')
      );

      // get token info
      const tokenAccountInfo =
        await this.connection.getParsedAccountInfo(vaultTokenAccountPDA);
      const tokenInfo =
        await this.connection.getTokenAccountBalance(vaultTokenAccountPDA);

      const tokenMint =
        tokenAccountInfo.value?.data && 'parsed' in tokenAccountInfo.value.data
          ? tokenAccountInfo.value.data.parsed?.info?.mint
          : null;

      tasksEnriched.push({
        ...task,
        tokenInfo: {
          mint: tokenMint,
          symbol: 'USDC',
          decimals: tokenInfo.value.decimals,
          balance: tokenInfo.value.amount,
          uiBalance: tokenInfo.value.uiAmount
        }
      });
    }

    return tasksEnriched;
  }
}
