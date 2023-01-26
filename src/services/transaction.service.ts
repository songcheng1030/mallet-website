import { http } from './api'
import { ITransactionHistory } from '../types/transaction.types'

class TransactionService {
  async getHistory () {
    const response = await http.get<ITransactionHistory[]>('/transaction/history');
    return response.data;
  }
}

export const transactionService = new TransactionService()
