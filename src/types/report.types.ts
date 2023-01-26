import { 
  IUser, IWallet, IBlockchain, IDex, IBot, ICoin, IToken,
  ETradingInitiator, ETradingThread
} from ".";
import { TransactionStatus} from "./shared.types";

export interface ITransaction {
  _id: string;
  user: IUser;
  wallet: IWallet;
  blockchain: IBlockchain;
  dex?: IDex;
  bot?: IBot;
  coin?: ICoin;
  token?: IToken;
  initiator: ETradingInitiator;
  thread: ETradingThread;
  result: TransactionStatus;
  message?: string;
  tryCount?: number;
  txHash?: string;
  gasFee?: number;
  created?: Date;
}