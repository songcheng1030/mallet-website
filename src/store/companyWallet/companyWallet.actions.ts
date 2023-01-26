import { Dispatch } from 'redux'
import { showLoading, hideLoading } from 'react-redux-loading-bar';

import { COMPANY_WALLET_ADD, COMPANY_WALLET_DELETE, COMPANY_WALLET_LOAD_ALL, COMPANY_WALLET_LOAD_BY_ID, COMPANY_WALLET_LOAD_MY, COMPANY_WALLET_UPDATE } from '../action-types';
import errorHandler from '../error-handler';
import { walletService } from '../../services';
import { ICompanyWallet } from '../../types';

export const loadCompanyWallets = () => async (dispatch: Dispatch) => {
  try {
    const wallets = await walletService.getAllCompanyWallet();
    dispatch({
      type: COMPANY_WALLET_LOAD_ALL,
      payload: {
        wallets
      },
    });
  } catch (error: any) {
    errorHandler(error, COMPANY_WALLET_LOAD_ALL);
  }
}

export const loadMyWallet = () => async (dispatch: Dispatch) => {
    try {
        dispatch(showLoading());
        const myWallets = await walletService.getMyCompanyWallets();
        dispatch(hideLoading());

        dispatch({
            type: COMPANY_WALLET_LOAD_MY,
            payload: {
                myWallets
            },
        });
    } catch (error: any) {
        dispatch(hideLoading());
        errorHandler(error, COMPANY_WALLET_LOAD_MY);
    }
}

export const loadWalletById = (walletId: string) => async (dispatch: Dispatch) => {
    try {
        // const wallet = await walletService.getWalletById(walletId);

        // dispatch({
        //     type: WALLET_LOAD_BY_ID,
        //     payload: {
        //         wallet
        //     },
        // });
    } catch (error: any) {
        errorHandler(error, COMPANY_WALLET_LOAD_BY_ID);
    }
}

export const addCompanyWallet = (wallet: ICompanyWallet) => async (dispatch: Dispatch) => {
  try {
    dispatch(showLoading());
    const newWallet = await walletService.addCompanyWallet(wallet);
    dispatch(hideLoading());

    dispatch({
        type: COMPANY_WALLET_ADD,
        payload: {
          newWallet
        },
      });
  } catch (error: any) {
    dispatch(hideLoading());
    errorHandler(error, COMPANY_WALLET_ADD);
  }
}

export const deleteCompanyWallet = (walletId: string) => async (dispatch: Dispatch) => {
  try {
    await walletService.deleteCompanyWallet(walletId);

    dispatch({
        type: COMPANY_WALLET_DELETE,
        payload: {
          walletId
        },
      });
  } catch (error: any) {
    dispatch(hideLoading());
    errorHandler(error, COMPANY_WALLET_DELETE);
  }
}

export const updateCompanyWallet = (wallet: ICompanyWallet) => async (dispatch: Dispatch) => {
  if (!wallet._id) return;
  try {
    const newWallet = await walletService.updateCompanyWallet(wallet._id, wallet);

    dispatch({
        type: COMPANY_WALLET_UPDATE,
        payload: {
          newWallet
        },
      });
  } catch (error: any) {
    dispatch(hideLoading());
    errorHandler(error, COMPANY_WALLET_UPDATE);
  }
}