import { BadRequestException } from '@nestjs/common';
import { Commitment, Connection, Transaction } from '@solana/web3.js';

export async function sendTransaction(params: {
  serializedTransaction: string;
  connection: Connection;
  commitment?: Commitment;
}) {
  const signedTransaction = Transaction.from(
    Buffer.from(params.serializedTransaction, 'base64')
  );

  try {
    const signature = await params.connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    // Wait for confirmation with more robust error handling
    const confirmation = await params.connection.confirmTransaction(
      signature,
      params.commitment || 'finalized'
    );

    // Check if there were any errors during confirmation
    if (confirmation.value.err) {
      throw new BadRequestException(
        `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
      );
    }

    if (params.commitment === 'finalized') {
      // Get the transaction details to verify success
      const txDetails = await params.connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 1
      });

      if (!txDetails) {
        return {
          signature
        };
      }

      if (txDetails.meta?.err) {
        throw new BadRequestException(
          `Transaction failed with error: ${JSON.stringify(txDetails.meta.err)}`
        );
      }

      if (txDetails.meta?.err) {
        throw new BadRequestException(
          `Transaction failed with error: ${JSON.stringify(txDetails.meta.err)}`
        );
      }
    }

    return {
      signature
    };
  } catch (error) {
    console.error('Error processing transaction:', error);
    throw new BadRequestException(
      `Failed to process transaction: ${error.message}`
    );
  }
}
