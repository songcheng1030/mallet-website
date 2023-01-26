import { IBlockchain, IWallet, INode } from ".";

export interface ICoinInfo {
  nCoinSymbol: string;
  nCoinBalance: number;
  wCoinSymbol: string;
  wCoinBalance: number;
}
export interface ITokenLiquidity {
  address: string;
  wCoinBalance: number;
  tokenBalance: number;
}
export interface ITokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  tokenBalance: number;
  marketCap?: number;
  coin?: ICoinInfo;
  liquidity?: ITokenLiquidity;
}

export interface ITokenInfoRequest {
  blockchainId: string;
  nodeId?: string;
  dexId: string;
  walletId: string;
  tokenAddress: string;
}
//////////////////////////////////////////////////////////
export interface INetCoinDto {
  symbol: string;
  balance: number;
}
export interface ITokenLiquidityDto {
  address: string;
  wCoinBalance: number;
  tokenBalance: number;
}
export interface ITokenDetailDto {
  netCoin?: INetCoinDto;
  coin?: IToken;
  token?: IToken;
  liquidity?: ITokenLiquidityDto;
}

export interface ITokenDetailReqDto {
  blockchainId: string;
  nodeId?: string;
  dexId?: string;
  walletId?: string;
  netCoin?: boolean;
  coinAddress?: string;
  tokenAddress?: string;
}

export interface IToken {
  _id: string;
  address: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: number;
  blockchain?: IBlockchain;
  wallet?: IWallet;
  createdAt?: Date;
  balance?: number;
  created?: Date;
  updated?: Date;
}

export interface ITokenCreateRequest {
  blockchain: string;
  node?: string;
  wallet: string;
  name: string;
  symbol: string;
  decimals: number;
  maxSupply: number;
}

export type TokenCreatorActionType = '' | 'Token Creating' | 'Minting' | 'Burning' | 'Adding LP' | 'Removing LP';
export type TokenCreatorActionResult = '' | 'Success' | 'Failed';

export interface ITokenCreatorState {
  action: TokenCreatorActionType,
  result: TokenCreatorActionResult
}

export interface ITokenCreator {
  _id: string;
  uniqueNum?: number;
  token?: IToken;
  blockchain: IBlockchain;
  node: INode;
  wallet: IWallet;
  name: string;
  symbol: string;
  decimals: number;
  maxSupply: number;
  state: ITokenCreatorState;
  created: Date;
  updated: Date;
}

export interface TokenCreatorFilter {
  page?: number;
  pageLength?: number;
}
