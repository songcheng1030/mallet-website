import { IUser } from "./user.types";
import { ECEXType } from ".";
export interface IWalletAddRequest {
  name: string;
  privateKey?: string;
  publicKey: string;
  users: string[];
}

export interface IWalletEditRequest extends IWalletAddRequest {
  _id: string;
}

export interface IBaseWallet {
  privateKey: string;
  publicKey: string;
}

export interface IWallet extends IBaseWallet {
  _id: string;
  name: string;
  owner: IUser,
  users: IUser[];
  created?: Date;
  updated?: Date; 
}

export interface ICompanyWallet extends IBaseWallet {
  _id?: string;
  uniqueNum?: number;
  owner?: IUser;
  cntInUse: number;
  created?: Date;
  updated?: Date;
  deleted?: boolean;
}

export interface IBaseCexAccount {
  name: string;
  cex: ECEXType;
  apiKey?: string;
  apiSecret?: string;
  apiPassword?: string;
}

export interface ICexAccountAddRequest extends IBaseCexAccount {
  users: string[];
}

export interface ICexAccountEditRequest extends ICexAccountAddRequest {
  _id: string;
}

export interface ICexAccount extends IBaseCexAccount {
  _id: string;
  owner: IUser;
  users: IUser[];
  created: Date;
  updated: Date;
}
