import {
  IBlockchain, 
  INode, 
  IBot, 
  ICoin, 
  IDex, 
  IToken, 
  IUser, 
  IWallet, 
  ETradingInitiator, 
  ETradingThread, 
  TransactionStatus, 
  ILiquidatorBot, 
  EExchangeType ,
  IWasherBot,
  ITokenCreator
} from ".";

export interface ITransaction {
  user: IUser;
  wallet: IWallet;
  blockchain: IBlockchain;
  node?: INode;
  dex?: IDex;
  bot?: IBot;
  coin?: ICoin;
  token?: IToken;
  initiator: ETradingInitiator;
  thread: ETradingThread;
  result: TransactionStatus;
  tryCount?: number;
  txHash?: string;
  gasFee?: number;
  coinAmount?: number;
  tokenAmount?: number;
  message?: string;
  created?: Date;
}

export interface ITransactionHistory {
  _id: string;
  user: IUser;
  wallet: IWallet;
  blockchain: IBlockchain;
  node?: INode;
  dex: IDex;
  bot: IBot;
  coin: ICoin;
  token: IToken;
  initiator: ETradingInitiator;
  transactions: ITransaction[];
}

export interface ILiquidatorTransaction {
  uniqueNum?: number;
  token: IToken;
  isDex: boolean;
  wallet?: IWallet;
  apiKey?: string;
  apiSecret?: string;
  txHash: string;
  tokenAmount: number;
  fee: number;
  price: number;
  liquidator: ILiquidatorBot;
  soldPrice: number;
  created: Date;
}

export interface IWasherTransaction {
  uniqueNum?: number;
  token: IToken;
  exchangeType: EExchangeType;
  buyTxHash: string;
  sellTxHash: string;
  tokenAmount: number;
  fee: number;
  volume: number;
  coinmarketVolume?: number;
  loss: number;
  targetVolume: number;
  washer: IWasherBot;
  date: string;
  timeStamp: number;
  created: Date;
}

export interface ITokenMintBurnTransaction {
  _id: string;
  tokenCreator: ITokenCreator;
  date: Date;
  type: "MINT" | "BURN";
  amount: number;
  txHash: string;
  created: Date
}

export interface ILiquidityPoolTransaction {
  _id: string;
  tokenCreator: ITokenCreator;
  date: Date;
  type: "ADD_LP" | "REMOVE_LP";
  dex: IDex;
  baseCoin: {
    symbol: string;
    amount: number;
  },
  token: {
    symbol: string;
    amount: number;
  },
  txHash: string;
  created: Date
}
