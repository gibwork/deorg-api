export interface Verification {
  status: string;
  strategy: string;
  attempts: null | number;
  expire_at: null | string;
}

export interface EmailAddress {
  id: string;
  object: string;
  email_address: string;
  reserved: boolean;
  verification: Verification;
  linked_to: string[];
  created_at: number;
  updated_at: number;
}

export interface ClerkUser {
  id: string;
  object: string;
  username: string;
  first_name: null | string;
  last_name: null | string;
  image_url: string;
  has_image: boolean;
  primary_email_address_id: string;
  primary_phone_number_id: null | string;
  primary_web3_wallet_id: null | string;
  password_enabled: boolean;
  two_factor_enabled: boolean;
  totp_enabled: boolean;
  backup_code_enabled: boolean;
  email_addresses: EmailAddress[];
  phone_numbers: any[];
  web3_wallets: any[];
  passkeys: any[];
  external_accounts: any[];
  saml_accounts: any[];
  public_metadata: any;
  private_metadata: any;
  unsafe_metadata: any;
  external_id: null | string;
  last_sign_in_at: null | string;
  banned: boolean;
  locked: boolean;
  lockout_expires_in_seconds: null | number;
  verification_attempts_remaining: number;
  created_at: number;
  updated_at: number;
  delete_self_enabled: boolean;
  create_organization_enabled: boolean;
  last_active_at: null | string;
  profile_image_url: string;
}

export interface SignInToken {
  id: string;
  userId: string;
  token: string;
  status: string;
  url: string;
  createdAt: number;
  updatedAt: number;
}
