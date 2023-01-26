import { Action, Reducer } from 'redux';
import { handleActions } from 'redux-actions';

import { ICompanyWallet } from '../../types';
import { COMPANY_WALLET_ADD, COMPANY_WALLET_DELETE, COMPANY_WALLET_LOAD_ALL, COMPANY_WALLET_UPDATE, COMPANY_WALLET_LOAD_MY } from '../action-types';

export interface CompanyWalletState {
  wallets: ICompanyWallet[],
  myWallets: ICompanyWallet[],
}

interface CompanyWalletAction extends Action {
  payload: {
    wallets: ICompanyWallet[],
    myWallets: ICompanyWallet[],
    newWallet: ICompanyWallet,
    walletId: string,
  }
}

const initialState: CompanyWalletState = {
  wallets: [],
  myWallets: [],
}

export const companyWalletReducer: Reducer<CompanyWalletState, CompanyWalletAction> = handleActions(
  {
    [COMPANY_WALLET_LOAD_ALL]: (state: CompanyWalletState, { payload: { wallets }}: CompanyWalletAction) => ({
      ...state,
      wallets,
    }),
    [COMPANY_WALLET_LOAD_MY]: (state: CompanyWalletState, { payload: { myWallets }}: CompanyWalletAction) => ({
      ...state,
      myWallets
    }),
    [COMPANY_WALLET_ADD]: (state: CompanyWalletState, { payload: { newWallet }}: CompanyWalletAction) => {
      let wallets = state.wallets.slice();
      wallets.unshift(newWallet);
      return {
        ...state,
        wallets
      }
    },
    [COMPANY_WALLET_UPDATE]: (state: CompanyWalletState, { payload: { newWallet }}: CompanyWalletAction) => {
      let wallets = state.wallets.slice();
      return {
        ...state,
        wallets: wallets.map(wallet => {
          if (wallet._id === newWallet._id) return newWallet;
          else return wallet;
        })
      }
    },
    [COMPANY_WALLET_DELETE]: (state: CompanyWalletState, { payload: { walletId }}: CompanyWalletAction) => {
      let wallets = state.wallets.slice();
      return {
        ...state,
        wallets: wallets.filter(item => item._id !== walletId)
      }
    }
  },
  initialState,
);
