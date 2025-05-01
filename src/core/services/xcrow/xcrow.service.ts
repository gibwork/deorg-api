import { Logger } from '@nestjs/common';
import * as process from 'node:process';
import { Xcrow, UnknownError } from '@xcrowdev/node';
import {
  DepositInput,
  DepositOutput,
  WithdrawInput,
  WithdrawOutput,
  RefundInput,
  RefundOutput,
  ExecuteInput,
  ExecuteOutput,
  CreateVaultInput,
  CreateVaultOutput
} from '@xcrowdev/node/src/contracts';
import bs58 from 'bs58';
import * as solanaWeb3 from '@solana/web3.js';
import { Network } from '@utils/network';

export type PriorityFeeLevel =
  | 'Low'
  | 'Medium'
  | 'High'
  | 'VeryHigh'
  | 'UnsafeMax';

export class XcrowService {
  private xcrow: Xcrow;
  payer = process.env.XCROW_PAYER!;

  constructor() {
    this.xcrow = new Xcrow({
      applicationId: String(process.env.XCROW_APPLICATION_ID),
      apiKey: String(process.env.XCROW_API_KEY)
    });
  }

  async deposit(dto: DepositInput): Promise<DepositOutput> {
    try {
      const network = Network.get(dto.network);
      const deposit = await this.xcrow.deposit({
        ...dto,
        network,
        priorityFeeLevel: dto.priorityFeeLevel ?? 'Medium',
        transferFee: dto.transferFee
      });

      return deposit;
    } catch (error) {
      Logger.error(error.message, error.stack, 'XcrowService.deposit');
      throw error;
    }
  }

  async withdraw(dto: WithdrawInput): Promise<WithdrawOutput> {
    try {
      const network = Network.get(dto.network);

      const withdraw = await this.xcrow.withdraw({
        ...dto,
        network,
        priorityFeeLevel: dto.priorityFeeLevel ?? 'VeryHigh',
        transferFee: dto.transferFee
      });

      return withdraw;
    } catch (error) {
      Logger.error(error.message, error.stack, 'XcrowService.withdraw');
      throw error;
    }
  }

  async refund(dto: RefundInput): Promise<RefundOutput> {
    try {
      const network = Network.get(dto.network);
      const refund = await this.xcrow.refund({
        ...dto,
        priorityFeeLevel: dto.priorityFeeLevel ?? 'VeryHigh',
        network
      });

      return refund;
    } catch (error) {
      Logger.error(error.message, error.stack, 'XcrowService.refund');
      throw error;
    }
  }

  async createVault(dto: CreateVaultInput): Promise<CreateVaultOutput> {
    try {
      const network = Network.get(dto.network as 'mainnet' | 'devnet');
      const vault = await this.xcrow.createVault({
        ...dto,
        network
      });

      return vault;
    } catch (error) {
      Logger.error(error.message, error.stack, 'XcrowService.refund');
      throw error;
    }
  }

  async execute(
    dto: ExecuteInput
  ): Promise<{ status: number; data: ExecuteOutput | any }> {
    try {
      const data = await this.xcrow.execute(dto);

      return { status: 200, data };
    } catch (error) {
      Logger.error(error.message, error.stack, 'XcrowService.execute');
      if (!(error instanceof UnknownError)) {
        return {
          data: error.message,
          status: 400
        };
      }

      return {
        data: error.message,
        status: 500
      };
    }
  }

  async getVaultDetails(vaultId: string) {
    try {
      const data = await this.xcrow.getVaultDetails(vaultId);

      return { status: 200, data };
    } catch (error) {
      Logger.error(error.message, error.stack, 'XcrowService.execute');
      if (!(error instanceof UnknownError)) {
        return {
          data: error.message,
          status: 400
        };
      }

      return {
        data: error.message,
        status: 500
      };
    }
  }

  async signTransaction(serializedTransaction: string, secretKey: string) {
    const secretKeyBytes = bs58.decode(secretKey);

    const keypair = solanaWeb3.Keypair.fromSecretKey(secretKeyBytes);

    const transaction = solanaWeb3.Transaction.from(
      Buffer.from(serializedTransaction, 'base64')
    );

    transaction.partialSign(keypair);

    const signedTransaction = transaction.serialize().toString('base64');

    return signedTransaction;
  }
}
