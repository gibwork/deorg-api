import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UserService } from 'src/domains/users/services/user.service';
import { TransactionService } from 'src/domains/transactions/services/transaction.service';
import { TransactionType } from '@domains/transactions/entities/transaction.entity';
import { Transaction } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
import { HeliusService } from '@core/services/helius/helius.service';
import { OrganizationRole } from '../entities/organization-member.entity';
import { ClerkService } from '@core/services/clerk/clerk.service';
@Injectable()
export class CreateOrganizationUsecase {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly userService: UserService,
    private readonly transactionService: TransactionService,
    private readonly heliusService: HeliusService,
    private readonly clerkService: ClerkService
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
        createdBy: userId,
        type: TransactionType.CREATE_ORGANIZATION
      }
    });

    if (!transaction) throw new NotFoundException('Transaction not found');

    const signedTransaction = Transaction.from(
      Buffer.from(dto.serializedTransaction, 'base64')
    );

    try {
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      // Wait for confirmation with more robust error handling
      const confirmation = await this.connection.confirmTransaction(
        signature,
        'confirmed'
      );

      // Check if there were any errors during confirmation
      if (confirmation.value.err) {
        throw new BadRequestException(
          `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
        );
      }

      // Get the transaction details to verify success
      const txDetails = await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 1
      });

      if (!txDetails) {
        throw new BadRequestException('Failed to fetch transaction details');
      }

      if (txDetails.meta?.err) {
        throw new BadRequestException(
          `Transaction failed with error: ${JSON.stringify(txDetails.meta.err)}`
        );
      }

      await this.transactionService.update(transaction.id, {
        response: { txHash: signature }
      });
    } catch (error) {
      console.error('Error processing transaction:', error);
      throw new BadRequestException(
        `Failed to process transaction: ${error.message}`
      );
    }

    const clerkOrganization = await this.clerkService.createOrganization(
      dto.name,
      user.externalId
    );

    const organization = await this.organizationService.create({
      id: transaction.response['organizationId'],
      name: dto.name,
      externalId: clerkOrganization.id,
      slug: clerkOrganization.slug || undefined,
      logoUrl: clerkOrganization.imageUrl || undefined,
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
