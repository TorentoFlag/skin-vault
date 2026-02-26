export interface User {
  id: string;
  steamId: string;
  displayName: string;
  avatar: string;
  tradeUrl: string | null;
  balance: number;
  createdAt: string;
}
