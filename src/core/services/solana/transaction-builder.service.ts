import { Connection, Transaction, PublicKey } from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token';
import { HeliusService } from '@core/services/helius/helius.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionBuilderService {
  private connection: Connection;
  private USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

  constructor(private readonly heliusService: HeliusService) {
    this.connection = new Connection(this.heliusService.rpcUrl);
  }

  /**
   * Creates a transaction for sending USDC to two recipients (split payment)
   */
  async createSplitPaymentTransaction(
    amount: number,
    primaryRecipient: string,
    primaryRecipientShare: number, // 0.9 for 90%
    secondaryRecipient: string,
    senderWallet: string, // Add sender wallet parameter
    mintAddress?: string
  ): Promise<string> {
    try {
      // Convert wallet addresses to PublicKeys
      const senderPubkey = new PublicKey(senderWallet);
      const primaryRecipientPubkey = new PublicKey(primaryRecipient);
      const secondaryRecipientPubkey = new PublicKey(secondaryRecipient);

      // Get Associated Token Accounts for all parties
      const senderATA = await getAssociatedTokenAddress(
        new PublicKey(mintAddress ?? this.USDC_MINT),
        senderPubkey,
        true
      );

      const primaryRecipientATA = await getAssociatedTokenAddress(
        new PublicKey(mintAddress ?? this.USDC_MINT),
        primaryRecipientPubkey,
        true
      );

      const secondaryRecipientATA = await getAssociatedTokenAddress(
        new PublicKey(mintAddress ?? this.USDC_MINT),
        secondaryRecipientPubkey,
        true
      );

      // Calculate USDC amounts (USDC has 6 decimals)
      const totalAmount = amount * 1_000_000; // Convert to USDC's smallest unit
      const primaryAmount = Math.floor(totalAmount * primaryRecipientShare);
      const secondaryAmount = totalAmount - primaryAmount;

      // Create a new transaction
      const transaction = new Transaction();

      // Get the latest blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      // Set the fee payer to the sender's wallet
      transaction.feePayer = senderPubkey;

      // Check if sender's token account exists
      const senderAccount = await this.connection.getAccountInfo(senderATA);
      if (!senderAccount) {
        // If it doesn't exist, add instruction to create it
        transaction.add(
          createAssociatedTokenAccountInstruction(
            senderPubkey, // payer
            senderATA, // associated token account address
            senderPubkey, // owner
            new PublicKey(mintAddress ?? this.USDC_MINT) // mint
          )
        );
      }

      // Check if primary recipient's token account exists
      const primaryAccount =
        await this.connection.getAccountInfo(primaryRecipientATA);
      if (!primaryAccount) {
        // If it doesn't exist, add instruction to create it
        transaction.add(
          createAssociatedTokenAccountInstruction(
            senderPubkey, // payer
            primaryRecipientATA, // associated token account address
            primaryRecipientPubkey, // owner
            new PublicKey(mintAddress ?? this.USDC_MINT) // mint
          )
        );
      }

      // Check if secondary recipient's token account exists
      const secondaryAccount = await this.connection.getAccountInfo(
        secondaryRecipientATA
      );
      if (!secondaryAccount) {
        // If it doesn't exist, add instruction to create it
        transaction.add(
          createAssociatedTokenAccountInstruction(
            senderPubkey, // payer
            secondaryRecipientATA, // associated token account address
            secondaryRecipientPubkey, // owner
            new PublicKey(mintAddress ?? this.USDC_MINT) // mint
          )
        );
      }

      // Add transfer to primary recipient
      if (primaryAmount > 0) {
        transaction.add(
          createTransferInstruction(
            senderATA, // Use actual sender token account
            primaryRecipientATA,
            senderPubkey, // Use actual sender wallet as authority
            primaryAmount
          )
        );
      }

      // Add transfer to secondary recipient (platform fee)
      if (secondaryAmount > 0) {
        transaction.add(
          createTransferInstruction(
            senderATA, // Use actual sender token account
            secondaryRecipientATA,
            senderPubkey, // Use actual sender wallet as authority
            secondaryAmount
          )
        );
      }

      // Note: We already set these above, no need to set them again

      // Serialize the transaction to base64
      const serializedTransaction = transaction
        .serialize({
          requireAllSignatures: false, // We don't have the user signature yet
          verifySignatures: false
        })
        .toString('base64');

      // Return the serialized transaction
      return serializedTransaction;
    } catch (error) {
      console.error('Error creating split payment transaction:', error);
      throw error;
    }
  }
}
