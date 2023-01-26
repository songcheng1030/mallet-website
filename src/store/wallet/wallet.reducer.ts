import { Action, Reducer } from 'redux';
import { handleActions } from 'redux-actions';

import { IWallet } from '../../types';
import { WALLET_ADD, WALLET_DELETE, WALLET_LOAD_ALL, WALLET_LOAD_MY, WALLET_UPDATE } from '../action-types';

export interface WalletState {
  wallets: IWallet[],
  myWallets: IWallet[],
}

interface WalletAction extends Action {
  payload: {
    wallets: IWallet[],
    myWallets: IWallet[],
    newWallet: IWallet,
    walletId: string,
  }
}

const initialState: WalletState = {
  wallets: [],
  myWallets: [],
}

export const walletReducer: Reducer<WalletState, WalletAction> = handleActions(
  {
    [WALLET_LOAD_ALL]: (state: WalletState, { payload: { wallets }}: WalletAction) => ({
      ...state,
      wallets,
    }),
    [WALLET_LOAD_MY]: (state: WalletState, { payload: { myWallets }}: WalletAction) => ({
      ...state,
      myWallets
    }),
    [WALLET_ADD]: (state: WalletState, { payload: { newWallet }}: WalletAction) => {
      let myWallets = state.myWallets.slice();
      myWallets.unshift(newWallet);
      return {
        ...state,
        myWallets
      }
    },
    [WALLET_UPDATE]: (state: WalletState, { payload: { newWallet }}: WalletAction) => {
      let myWallets = state.myWallets.slice();
      return {
        ...state,
        myWallets: myWallets.map(wallet => {
          if (wallet._id === newWallet._id) return newWallet;
          else return wallet;
        })
      }
    },
    [WALLET_DELETE]: (state: WalletState, { payload: { walletId }}: WalletAction) => {
      let wallets = state.myWallets.slice();
      return {
        ...state,
        myWallets: wallets.filter(item => item._id !== walletId)
      }
    }
  },
  initialState,
);
