import { IToken, IBlockchain, IDex, IAutoBot } from ".";

export interface IPool {
  _id: string;
  uniqueNum?: number;
  size: number;
  amount1: number;
  amount2: number;
  blockchain: IBlockchain,
  dex: IDex,
  token1: IToken,
  token2: IToken,
  pairAddress: string;
  blockNumber: number;
  transactionHash: string;
  createdTime: string;
  autoBot?: IAutoBot;
  created: Date;
  updated: Date;
}

export interface PaginatedResponse {
  total: number;
  data: IPool[];
}

export interface PoolFilter {
  isRunning?: boolean;
  size?: number;
  page?: number;
  pageLength?: number;
  sort: {
    field: string;
    order: number;
  };
  chain?: string;
  dex?: string;
  token?: string;
  startDate?: string;
  endDate?: string;
}
