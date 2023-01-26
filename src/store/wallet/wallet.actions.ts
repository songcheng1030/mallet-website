import { Dispatch } from 'redux'
import { showLoading, hideLoading } from 'react-redux-loading-bar';

import { WALLET_LOAD_ALL, WALLET_LOAD_BY_ID, WALLET_LOAD_MY, WALLET_ADD, WALLET_DELETE, WALLET_UPDATE } from '../action-types';
import errorHandler from '../error-handler';
import { walletService } from '../../services';
import { IWalletAddRequest, IWalletEditRequest } from '../../types';

export const loadWallets = () => async (dispatch: Dispatch) => {
    try {
        dispatch(showLoading());
        const wallets = await walletService.getAll();
        dispatch(hideLoading());

        dispatch({
            type: WALLET_LOAD_ALL,
            payload: {
                wallets
            },
        });
    } catch (error: any) {
        dispatch(hideLoading());
        errorHandler(error, WALLET_LOAD_ALL);
    }
}

export const loadMyWallet = () => async (dispatch: Dispatch) => {
    try {
        dispatch(showLoading());
        const myWallets = await walletService.getMyWallets();
        dispatch(hideLoading());

        dispatch({
            type: WALLET_LOAD_MY,
            payload: {
                myWallets
            },
        });
    } catch (error: any) {
        dispatch(hideLoading());
        errorHandler(error, WALLET_LOAD_MY);
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
        errorHandler(error, WALLET_LOAD_BY_ID);
    }
}

export const addWallet = (wallet: IWalletAddRequest) => async (dispatch: Dispatch) => {
  try {
    dispatch(showLoading());
    const newWallet = await walletService.addWallet(wallet);
    dispatch(hideLoading());

    dispatch({
        type: WALLET_ADD,
        payload: {
          newWallet
        },
      });
  } catch (error: any) {
    dispatch(hideLoading());
    errorHandler(error, WALLET_ADD);
  }
}

export const deleteWallet = (walletId: string) => async (dispatch: Dispatch) => {
  try {
    dispatch(showLoading());
    await walletService.deleteWallet(walletId);
    dispatch(hideLoading());

    dispatch({
        type: WALLET_DELETE,
        payload: {
          walletId
        },
      });
  } catch (error: any) {
    dispatch(hideLoading());
    errorHandler(error, WALLET_DELETE);
  }
}

export const updateWallet = (wallet: IWalletEditRequest) => async (dispatch: Dispatch) => {
  try {
    dispatch(showLoading());
    const newWallet = await walletService.updateWallet(wallet._id, wallet);
    dispatch(hideLoading());

    dispatch({
        type: WALLET_UPDATE,
        payload: {
          newWallet
        },
      });
  } catch (error: any) {
    dispatch(hideLoading());
    errorHandler(error, WALLET_UPDATE);
  }
}
