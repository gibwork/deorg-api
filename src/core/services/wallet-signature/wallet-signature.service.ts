import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';

interface VerifySignature {
  publicKey: string;
  signature: string;
  message: Uint8Array;
}

export class WalletSignature {
  verify({ publicKey, signature, message }: VerifySignature): boolean {
    return nacl.sign.detached.verify(
      message,
      Buffer.from(signature, 'base64'),
      new PublicKey(publicKey).toBuffer()
    );
  }
}
