import { Injectable } from '@nestjs/common';
import { VotingProgramService } from '@core/services/voting-program/voting-program.service';
import { UserService } from '@domains/users/services/user.service';
import { UserEntity } from '@domains/users/entities/user.entity';
import { ClerkService } from '@core/services/clerk/clerk.service';
import { Connection, PublicKey } from '@solana/web3.js';
import { HeliusService } from '@core/services/helius/helius.service';

@Injectable()
export class ListTasksUsecase {
  constructor(
    private readonly votingProgramService: VotingProgramService,
    private readonly userService: UserService,
    private readonly clerkService: ClerkService,
    private readonly heliusService: HeliusService
  ) {}

  private connection = new Connection(this.heliusService.devnetRpcUrl);

  async execute(projectAddress: string) {
    let tasks = await this.votingProgramService.getTasks(projectAddress);
    tasks = [tasks[0]];

    const tasksEnriched = await this.enrichTasks(tasks);

    return tasksEnriched;
  }

  private async enrichTasks(tasks: any[]) {
    const tasksEnriched: any[] = [];
    const cachedUsers = new Map<string, UserEntity>();

    for (const task of tasks) {
      const [assignee] = await this.getMembers([task.assignee], cachedUsers);
      const voters = await this.getMembers(task.voters, cachedUsers);

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
        assignee,
        voters,
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

  private async getMembers(
    memberAddresses: string[],
    cachedUsers: Map<string, UserEntity>
  ): Promise<UserEntity[]> {
    const members: UserEntity[] = [];

    for (const address of memberAddresses) {
      const member = await this.getOrCreateUser(address, cachedUsers);

      if (member) {
        members.push(member);
      }
    }

    return members;
  }

  private async getOrCreateUser(
    walletAddress: string,
    cachedUsers: Map<string, UserEntity>
  ): Promise<UserEntity | null> {
    // Check cache first
    const cachedUser = cachedUsers.get(walletAddress);
    if (cachedUser) {
      return cachedUser;
    }

    // Try to find existing user
    const existingUser = await this.userService.findOne({
      where: { walletAddress }
    });

    if (existingUser) {
      cachedUsers.set(walletAddress, existingUser);
      return existingUser;
    }

    // Try to find and create user from Clerk
    const clerkUser = await this.clerkService.findUserByUsername(
      walletAddress.slice(0, 6).toLowerCase()
    );

    if (clerkUser) {
      const newUser = await this.userService.create({
        externalId: clerkUser.id,
        walletAddress,
        username: clerkUser.username!,
        profilePicture: clerkUser.image_url
      });

      cachedUsers.set(walletAddress, newUser);
      return newUser;
    } else {
      const clerkUserCreated = await this.clerkService.createUser(
        walletAddress.toLowerCase()
      );

      const newUser = await this.userService.create({
        externalId: clerkUserCreated.id,
        walletAddress,
        username: clerkUserCreated.username!,
        profilePicture: clerkUserCreated.imageUrl
      });

      cachedUsers.set(walletAddress, newUser);
    }

    return null;
  }
}
