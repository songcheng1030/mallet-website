import { http } from './api'
import { ILiquidatorTransaction, ITokenMintBurnTransaction, IWasherTransaction, ILiquidityPoolTransaction } from '../types/transaction.types'

class ReportService {
  async getLiquidatorReport () {
    const response = await http.get<ILiquidatorTransaction[]>('/report/liquidator/all');
    return response.data;
  }

  async getLiquidatorDetail (id: string) {
    const response = await http.get<ILiquidatorTransaction[]>(`/report/liquidator/${id}`);
    return response.data;
  }

  async getWasherDetail (id: string) {
    const response = await http.get<IWasherTransaction[]>(`/report/washer/${id}`);
    return response.data;
  }

  async getTokenMintBurnDetail (id: string) {
    const response = await http.get<ITokenMintBurnTransaction[]>(`/report/token-creator/${id}/mint-burn-details`);
    return response.data;
  }

  async getLiquidityPoolDetail (id: string) {
    const response = await http.get<ILiquidityPoolTransaction[]>(`/report/token-creator/${id}/liquidity-pool-details`);
    return response.data;
  }
}

export const reportService = new ReportService()
