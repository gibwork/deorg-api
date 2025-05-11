import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { VotingProgramService } from '@core/services/voting-program/voting-program.service';
import { Connection, PublicKey } from '@solana/web3.js';
import { HeliusService } from '@core/services/helius/helius.service';

@Injectable()
export class GetUserTasksUsecase {
  constructor(
    private readonly votingProgramService: VotingProgramService,
    private readonly heliusService: HeliusService
  ) {}

  private connection = new Connection(this.heliusService.devnetRpcUrl);

  async execute(user: UserEntity) {
    const tasks = await this.votingProgramService.getUserTasks(
      user.walletAddress
    );

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
        new PublicKey('CLzwfsfNSQM73U7J5zURwRycdsWhFhTGaUvPYQU1TYPK')
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
