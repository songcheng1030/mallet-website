import { 
  IToken,
} from ".";

export interface ICoinMarketVolume {
  _id: string;
  token: IToken;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: Date;
  date?: string;
}
