import { http } from './api'
import { ICoinMarketVolume } from '../types'

class CoinMarketService {
  async getLatestVolume (coinmarketcapId: string) {
    const res = await http.get<number>(`/coinmarketvolume/latest/${coinmarketcapId}`);
    return res.data;
  }

  async getCoinmarketcapId (symbol: string, network: string, tokenAddress: string) {
    const res = await http.get<string>(`/coinmarketvolume/getCoinmarketcapId/${symbol}/${network}/${tokenAddress}`);
    return res.data;
  }

  async getAll (tokenId: string) {
    const res = await http.get<ICoinMarketVolume[]>(`/coinmarketvolume/all/${tokenId}`);
    return res.data;
  }

  async getCoinPrice (coinmarketcapId: string) {
    const res = await http.get<number>(`/coinmarketvolume/coinprice/${coinmarketcapId}`);
    return res.data;
  }
}

export const coinMarketService = new CoinMarketService()
