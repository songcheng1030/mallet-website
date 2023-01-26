export enum EUserRole {
  ADMIN = "ADMIN",
  TRADER = "TRADER",
  MONITOR = "MONITOR",
  MAINTAINER = "MAINTAINER",
  LIQUIDATOR = "LIQUIDATOR"
}

export type UserRoleStrings = keyof typeof EUserRole;

export enum EUserStatus {
  TBA = "TBA",
  APPROVED = "APPROVED",
  BLOCKED = "BLOCKED",
}

export type UserStatusStrings = keyof typeof EUserStatus;

export interface IUser {
  _id?: string;
  username: string;
  email: string;
  password?: string;
  role: EUserRole;
  status: EUserStatus;
  online: boolean;
  totpRequired?: boolean;
  created?: Date;
  updated?: Date; 
}

export interface IUserUpdateRequest {
  username?: string;
  role?: EUserRole;
  status?: EUserStatus;
}