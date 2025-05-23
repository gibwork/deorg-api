import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UserService } from 'src/domains/users/services/user.service';
import { TransactionService } from 'src/domains/transactions/services/transaction.service';
import { TransactionType } from '@domains/transactions/entities/transaction.entity';
import { Connection } from '@solana/web3.js';
import { HeliusService } from '@core/services/helius/helius.service';
import { OrganizationRole } from '../entities/organization-member.entity';
import { sendTransaction } from '@utils/sendTransaction';
@Injectable()
export class CreateOrganizationUsecase {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly userService: UserService,
    private readonly transactionService: TransactionService,
    private readonly heliusService: HeliusService
  ) {}

  private connection = new Connection(this.heliusService.devnetRpcUrl);

  async execute(dto: CreateOrganizationDto, userId: string) {
    const user = await this.userService.findOne({
      where: {
        id: userId
      }
    });

    if (!user) throw new NotFoundException('User not found');

    const transaction = await this.transactionService.findOne({
      where: {
        id: dto.transactionId,
        createdBy: userId,
        type: TransactionType.CREATE_ORGANIZATION
      }
    });

    if (!transaction) throw new NotFoundException('Transaction not found');

    const { signature } = await sendTransaction({
      serializedTransaction: dto.serializedTransaction,
      connection: this.connection
    });

    await this.transactionService.update(transaction.id, {
      response: { txHash: signature }
    });

    const organization = await this.organizationService.create({
      id: transaction.request['organizationId'],
      logoUrl:
        'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18yd1ZyYWdzb2JOSHJaRDJNMHlYUHpKbW5pWloiLCJyaWQiOiJvcmdfMndvelhpdjRPcmxSMUxNdjN3akw0ZUtSOVEwIiwiaW5pdGlhbHMiOiJZIn0',
      externalId: transaction.request['organizationId'],
      slug: dto.name,
      createdBy: userId,
      token: dto.token && {
        symbol: dto.token.symbol,
        mintAddress: dto.token.mintAddress,
        amount: dto.token.amount,
        imageUrl: dto.token.imageUrl
      },
      accountAddress: transaction.request['organizationPda'],
      members: [
        {
          userId,
          role: OrganizationRole.ADMIN
        }
      ]
    });

    return organization;
  }
}
