import BigNumber from 'bignumber.js';
import {
  REFERRAL_UNVERIFIED_PERCENT,
  REFERRAL_VERIFIED_PERCENT
} from '@core/config';

interface CalculateFee {
  fee: BigNumber;
  amount: BigNumber;
  asset: {
    mintAddress: string;
    decimals: number;
  };
  userWallet: string;
  referralWallet?: string;
  signer: string;
  isReferralVerified: boolean;
}

export async function calculateTransferFees({
  fee,
  amount,
  asset,
  userWallet,
  referralWallet,
  signer,
  isReferralVerified
}: CalculateFee): Promise<any[]> {
  const baseFee = [
    {
      signer,
      amount: fee.dividedBy(new BigNumber(10).pow(asset.decimals)).toNumber(),
      mintAddress: asset.mintAddress,
      decimals: asset.decimals,
      receiver: String(process.env.FEE_WALLET_ADDRESS)
    },
    {
      signer,
      amount: amount
        .minus(fee)
        .dividedBy(new BigNumber(10).pow(asset.decimals))
        .toNumber(),
      mintAddress: asset.mintAddress,
      decimals: asset.decimals,
      receiver: userWallet
    }
  ];

  if (referralWallet) {
    const referralPercentage = isReferralVerified
      ? REFERRAL_VERIFIED_PERCENT
      : REFERRAL_UNVERIFIED_PERCENT;

    const referralAmount = new BigNumber(baseFee[0].amount)
      .multipliedBy(referralPercentage)
      .dividedBy(100);

    baseFee[0].amount = parseFloat(
      new BigNumber(baseFee[0].amount).minus(referralAmount).toFixed(9)
    );

    baseFee.unshift({
      signer,
      amount: parseFloat(referralAmount.toFixed(9)),
      mintAddress: asset.mintAddress,
      decimals: asset.decimals,
      receiver: referralWallet
    });
  }

  return baseFee;
}
