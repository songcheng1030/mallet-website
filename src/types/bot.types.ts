import { 
  IUser, IBlockchain, IDex, INode, IWallet, ICoin, IToken, 
  ETradingInitiator, TransactionStatus, ICexAccount, ECEXType
} from ".";
import { ETradingThread, ERunningStatus} from "./shared.types"
import { ICompanyWallet } from "./wallet.types";

export enum EBotType {
  NONE = "NONE",
  BUY = "BUY",
  SELL = "SELL",
  BUY_SELL = "BUY_SELL",
  DEX_LIQUIDATOR = "DEX_LIQUIDATOR",
  CEX_LIQUIDATOR = "CEX_LIQUIDATOR",
  AUTO_BOT = "AUTO_BOT",
  DEX_WASHER = "DEX_WASHER",
  CEX_WASHER = "CEX_WASHER",
}

export enum EBotBuyType {
  SPAM = "SPAM",
  EVENT = "EVENT",
  ONCE = "ONCE"
}

export enum EBotSellType {
  TIMER = "TIMER",
  SPAM = "SPAM",
  ONCE = "ONCE"
}

export interface IBotState {
  active: boolean;
  status: ERunningStatus;
  thread: ETradingThread;
  result: string;
  extends?: {
    stopLoss?: IBotState,
    instant?: IBotState
  }
}

export interface IBotBuy {
  type: EBotBuyType;
  amount: number;
  startTime?: Date;
  // interval: number;
  period: number;
  gasPrice?: number;
}

export interface IBotSellItem {
  amount: number;
  deltaTime: number;
}

export interface IBotSell {
  type: EBotSellType;
  amount?: number;
  // startTime?: Date;
  count: number;
  step: number;
  items: IBotSellItem[];
  interval: number;
  gasPrice: number;
}

export interface IBotConfig {
  stopLimit: number;
  stopLoss: boolean;
  saveLimit: number;
  savings: boolean;
  rugpool: boolean;
  antiSell: boolean;
  buyLimitDetected: boolean;
  sellLimitDetected: boolean;
  autoBuyAmount: boolean;
  buyAnyCost: boolean;
}

export interface IBotStatistics {
  coinAmount: number;
  tokenAmount: number;
  fee: number;
}

export interface IBotAddRequest {
  blockchain: string;
  dex: string;
  node: string;
  wallet: string;
  coin: string;
  tokenAddress: string;
  initiator?: ETradingInitiator;
  type: EBotType
  buy: IBotBuy | {};
  sell: IBotSell | {};
  config?: IBotConfig | {};
}

export interface IBotUpdateRequest {
  _id: string;
  blockchain?: string;
  dex?: string;
  node?: string;
  wallet?: string;
  coin?: string;
  tokenAddress?: string;
  type?: EBotType
  buy?: IBotBuy | {};
  sell?: IBotSell | {};
  config?: IBotConfig | {};
  state?: IBotState;
}

export interface IBot {
  _id: string;
  uniqueNum?: number;
  blockchain: IBlockchain;
  dex: IDex;
  node: INode;
  wallet: IWallet;
  coin: ICoin;
  token: IToken;
  initiator?: ETradingInitiator;
  type: EBotType;
  buy?: IBotBuy;
  sell?: IBotSell;
  config?: IBotConfig;
  statistics?: {
    buy?: IBotStatistics,
    sell?: IBotStatistics,
  };
  state: IBotState;
  owner: IUser;
  created?: Date;
  updated?: Date;  
}

export interface BotFilter {
  initiator?: ETradingInitiator;
  page?: number;
  pageLength?: number;
  state?: ERunningStatus | '';
  chain: string;
  tokenAddress: string;
  uniqueNum: number;
}

export interface IBotTradingRequest {
  botId: string;
  active: boolean;
  type?: EBotType;
  cex?: ECEXType;
  thread?: ETradingThread;
  data?: IBotBuy | IBotSell;
}

export interface IBotStatus {
  _id: string;
  state: IBotState;
}

export interface IBotHistory {
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
  tryCount?: number;
  txHash?: string;
  gasFee?: number;
  coinAmount?: number;
  tokenAmount?: number;
  message?: string;
  created?: Date;
}

export interface IAutoBotState {
  active: boolean;
  status: ERunningStatus;
  thread?: string;
}

export interface IAutoBotAddRequest {
  blockchain: string;
  dex: string;
  node: string;
  mainWallet: string;
  coin: string;
  tokenAddress: string;
  buyAmount: number;
  pool?: string;
  state?: IAutoBotState
}

export interface IAutoBot {
  _id: string;
  uniqueNum?: number;
  blockchain: IBlockchain;
  dex: IDex;
  node: INode;
  mainWallet: IWallet;
  coin: ICoin;
  token: IToken;
  initiator?: ETradingInitiator;
  buyAmount: number;
  walletAddress: string;
  walletKey: string;
  statistics?: {
    buy?: IBotStatistics,
    sell?: IBotStatistics,
  };
  state: IAutoBotState;
  step: ETradingThread;
  owner: IUser;
  created?: Date;
  updated?: Date;  
}

export interface IAddLiquiditySchedule {
  time: Date;
  baseCoin?: number;
  tokenAmount?: number;
  tokenPrice?: number;
  txHash?: string;
  status: string;
}

export interface ISellingSchedule {
  time: Date;
  tokenAmount: number;
  earnedCoin?: number;
  tokenPrice?: number;
  txHash?: string;
  status: string;
}

export interface IVolumeBotAddRequest {
  blockchain: string;
  dex: string;
  node: string;
  mainWallet: string;
  coin: string;
  token: string;
  addLiquiditySchedule?: IAddLiquiditySchedule[];
  sellingSchedule?: ISellingSchedule[];
}

export enum EVolumeBotStatus {
  NONE = "-",
  RUNNING = "RUNNING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  WAITING = "WAITING"
}

export interface IVolumeBotStatus {
  _id: string;
  state: EVolumeBotStatus;
  addLiquiditySchedule: IAddLiquiditySchedule[];
  sellingSchedule: ISellingSchedule[];
}

export interface VolumeBotFilter {
  page?: number;
  pageLength?: number;
}

export interface IVolumeBot {
  _id: string;
  uniqueNum?: number;
  blockchain: IBlockchain;
  dex: IDex;
  node: INode;
  mainWallet: IWallet;
  coin: ICoin;
  token: IToken;
  addLiquiditySchedule: IAddLiquiditySchedule[];
  sellingSchedule: ISellingSchedule[];
  owner: IUser;
  state: EVolumeBotStatus;
  created?: Date;
  updated?: Date;
}

export enum ELiquidatorBotType {
  DEX = "DEX",
  CEX = "CEX",
}

export enum ELiquidatorBotStatus {
  NONE = "-",
  RUNNING = "RUNNING",
  STOPPED = "STOPPED",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  WAITING = "WAITING"
}

export interface ILiquidatorBotAddRequest {
  blockchain: string;
  node: string;
  type: ELiquidatorBotType;

  dex?: string;
  wallet?: string;
  coin?: string;

  cexAccount?: string;
  accountId?: string;
  cex?: string;

  token: string;
  // upperPrice: number;
  lowerPrice: number;
  // averagePrice: number;
  presetAmount: number;
  bigSellPercentage: number;
  smallSellPercentage: number;
}

export enum SellingStrategy {
  CONST = "CONST",
  LINEAR = "LINEAR",
  QUADRATIC = "QUADRATIC"
}

export interface ILiquidatorBot {
  _id: string;
  uniqueNum?: number;
  blockchain: IBlockchain;
  node: INode;
  type: ELiquidatorBotType;

  dex?: IDex;
  wallet?: IWallet;
  coin?: ICoin;

  cexAccount?: ICexAccount;
  accountId?: string;
  cex?: ECEXType;
  // strategy?: SellingStrategy,
  constAmount?: number,
  // orderAmountLimit?: number,

  tokenAmount?: number;
  tokenSold: number;
  tokenUsdSold?: number;
  token: IToken;
  // upperPrice: number;
  lowerPrice: number;
  // averagePrice: number;
  presetAmount: number;
  bigSellPercentage: number;
  smallSellPercentage: number;
  owner: IUser;
  state: ELiquidatorBotStatus;
  created?: Date;
  updated?: Date;
}

export interface ILiquidatorBotStatus {
  _id: string;
  state: ELiquidatorBotStatus;
  tokenSold: number;
}

export interface LiquidatorFilter {
  type: string;
  chain: string;
  tokenAddress: string;
  page?: number;
  pageLength?: number;
}

export interface ILiquidatorDailyOrder {
  _id: string;
  liquidator: string;
  buy: number;
  sell: number;
  date: string;
  created?: Date;
}

export interface ILiquidatorDailyOrderResponse {
  _id: string;
  // liquidator: string;
  buy: number;
  sell: number;
  // date: string;
  // created?: Date;
  count: number;
}

// Washer Bot
export enum EExchangeType {
  DEX = "DEX",
  CEX = "CEX",
}

export enum EWasherBotStatus {
  DRAFT = "-",
  RUNNING = "RUNNING",
  STOPPED = "STOPPED",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  WAITING = "WAITING"
};

export enum EWasherBotActionResult {
  DRAFT = "-",
  MIN_NATIVECOIN_LIMIT = "MIN_NATIVECOIN_LIMIT",
  MIN_BASECOIN_LIMIT = "MIN_BASECOIN_LIMIT",
  MAX_SLIPPAGE_LIMIT = "MAX_SLIPPAGE_LIMIT",
  DAILY_LOSS_LIMIT = "DAILY_LOSS_LIMIT",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  API_ERROR = "API_ERROR",
  TRANSACTION_FAILED = "TRANSACTION_FAILED",
  UNKNOWN = "UNKNOWN"
};

export interface IWasherBotState {
  status: EWasherBotStatus,
  result: EWasherBotActionResult,
  message?: string;
}

export interface IWasherBot {
  _id?: string;
  uniqueNum?: number;
  blockchain: IBlockchain;
  node: INode;
  exchangeType: EExchangeType;

  dex?: IDex;
  wallet?: IWallet;
  subWallets?: ICompanyWallet[];
  coin?: ICoin;

  coinmarketcapId?: string;

  depositMainCoin?: number;
  depositBaseCoin?: number;
  slippageLimit?: number;

  cexAccount?: ICexAccount;
  accountId?: string;
  cex?: ECEXType;

  minTradingAmount: number;
  dailyLossLimit: number;
  token: IToken;
  start: Date;
  end: Date;
  targetVolume: number;
  cntWallet?: number;
  owner: IUser;
  state: IWasherBotState;
  stateNum: number;
  isProcessing: boolean;
  isReady: boolean;
  created?: Date;
  updated?: Date;
}

export interface WasherFilter {
  exchangeType: string;
  chain: string;
  tokenAddress: string;
  page?: number;
  pageLength?: number;
}
