export enum EDexType {
  UNISWAP = "UNISWAP",
}

export interface IBlockchain {
  _id: string;
  name: string;
  chainId: number;
  coinSymbol: string;
  coinmarketcapNetworkId?: string;
  node?: INode;
  explorer?: string;
  amountForFee?: number;
  gasPrice?: number;
  gasPriceLimit?: number;
  created?: Date;
  updated?: Date; 
}

export interface IBlockchainPostRequest {
  _id?: string;
  name: string;
  chainId: number;
  coinSymbol: string;
  node?: string;
  explorer?: string;
  gasPrice?: number;
  amountForFee?: number;
}

export interface INode {
  _id: string;
  name: string;
  blockchain: IBlockchain;
  wsProviderURL: string;
  rpcProviderURL: string;
  ipAddress?: string;
  checkUrl?: string;
  active: boolean;
  created?: Date;
  updated?: Date; 
}

export interface IDex {
  _id: string;
  name: string;
  blockchain: IBlockchain;
  type: EDexType;
  factoryAddress: string;
  routerAddress: string;
  created?: Date;
  updated?: Date; 
}

export interface ICoin {
  _id: string;
  address: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: number;
  blockchain?: IBlockchain;
  createdAt?: Date;
  price?: number;
  created?: Date;
  updated?: Date;
}