import { http } from '../services/api'
import { IWalletAddRequest, IWallet, IWalletEditRequest, ICexAccount, ICexAccountAddRequest, ICexAccountEditRequest, IBaseWallet, ICompanyWallet } from '../types/wallet.types'

class WalletService {
  async getAll () {
    const response = await http.get<IWallet[]>('/wallet/all');
    return response.data;
  }

  async getMyWallets () {
    const response = await http.get<IWallet[]>('/wallet');
    return response.data;
  }

  async getWalletById (walletId: string) {
    const response = await http.get<IWallet>(`/wallet/id/${walletId}`);
    return response.data;
  }

  async addWallet (payload: IWalletAddRequest) {
    const response = await http.post<IWallet>('/wallet', payload);
    return response.data;
  }

  async updateWallet(walletId: string, payload: IWalletEditRequest) {
    const response = await http.put<IWallet>(`/wallet/${walletId}`, payload);
    return response.data;
  }

  async deleteWallet (walletId: string) {
    const response = await http.delete<IWallet>(`/wallet/${walletId}`);
    return response.data;
  }

  async getAllCexAccounts () {
    const response = await http.get<ICexAccount[]>('/cexaccount/all');
    return response.data;
  }

  async getMyCexAccounts () {
    const response = await http.get<ICexAccount[]>('/cexaccount');
    return response.data;
  }

  async getCexAccountById (accountId: string) {
    const response = await http.get<ICexAccount>(`/cexaccount/id/${accountId}`);
    return response.data;
  }

  async addCexAccount (payload: ICexAccountAddRequest) {
    const response = await http.post<ICexAccount>('/cexaccount', payload);
    return response.data;
  }

  async updateCexAccount(accountId: string, payload: ICexAccountEditRequest) {
    const response = await http.put<ICexAccount>(`/cexaccount/${accountId}`, payload);
    return response.data;
  }

  async deleteCexAccount (accountId: string) {
    const response = await http.delete<ICexAccount>(`/cexaccount/${accountId}`);
    return response.data;
  }

  async getAccounts(accountId: string) {
    const response = await http.get<any>(`/cexaccount/accounts/${accountId}`);
    return response.data;
  }

  // Company wallet
  async getAllCompanyWallet () {
    const response = await http.get<IBaseWallet[]>('/companywallet/all');
    return response.data;
  }

  async getMyCompanyWallets () {
    const response = await http.get<IBaseWallet[]>('/companywallet');
    return response.data;
  }

  async getCompanyWalletById (walletId: string) {
    const response = await http.get<IBaseWallet>(`/companywallet/id/${walletId}`);
    return response.data;
  }

  async addCompanyWallet (payload: IBaseWallet) {
    const response = await http.post<IBaseWallet>('/companywallet', payload);
    return response.data;
  }

  async deleteCompanyWallet (walletId: string) {
    const response = await http.delete<IBaseWallet>(`/companywallet/${walletId}`);
    return response.data;
  }

  async updateCompanyWallet(walletId: string, payload: ICompanyWallet) {
    const response = await http.put<IWallet>(`/companywallet/${walletId}`, payload);
    return response.data;
  }
}

export const walletService = new WalletService()
