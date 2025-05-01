export interface User {
  id: string;
  name: string;
  email: string;
  externalId: string;
  primaryWallet?: string;
}
