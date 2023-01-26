import { Dispatch } from 'redux'
import { showLoading, hideLoading } from 'react-redux-loading-bar';

import { CEX_ACCOUNT_ADD, CEX_ACCOUNT_DELETE, CEX_ACCOUNT_LOAD_ALL, CEX_ACCOUNT_LOAD_BY_ID, CEX_ACCOUNT_LOAD_MY, CEX_ACCOUNT_UPDATE } from '../action-types';
import errorHandler from '../error-handler';
import { walletService } from '../../services';
import { ICexAccountAddRequest, ICexAccountEditRequest } from '../../types';

export const loadCexAccounts = () => async (dispatch: Dispatch) => {
    try {
        dispatch(showLoading());
        const accounts = await walletService.getAllCexAccounts();
        dispatch(hideLoading());

        dispatch({
            type: CEX_ACCOUNT_LOAD_ALL,
            payload: {
              accounts
            },
        });
    } catch (error: any) {
        dispatch(hideLoading());
        errorHandler(error, CEX_ACCOUNT_LOAD_ALL);
    }
}

export const loadMyCexAccounts = () => async (dispatch: Dispatch) => {
    try {
        dispatch(showLoading());
        const myAccounts = await walletService.getMyCexAccounts();
        dispatch(hideLoading());

        dispatch({
            type: CEX_ACCOUNT_LOAD_MY,
            payload: {
                myAccounts
            },
        });
    } catch (error: any) {
        dispatch(hideLoading());
        errorHandler(error, CEX_ACCOUNT_LOAD_MY);
    }
}

export const loadCexAccountById = (accountId: string) => async (dispatch: Dispatch) => {
    try {
        const account = await walletService.getCexAccountById(accountId);

        dispatch({
            type: CEX_ACCOUNT_LOAD_BY_ID,
            payload: {
              account
            },
        });
    } catch (error: any) {
        errorHandler(error, CEX_ACCOUNT_LOAD_BY_ID);
    }
}

export const addCexAccount = (account: ICexAccountAddRequest) => async (dispatch: Dispatch) => {
  try {
    dispatch(showLoading());
    const newAccount = await walletService.addCexAccount(account);
    dispatch(hideLoading());

    dispatch({
        type: CEX_ACCOUNT_ADD,
        payload: {
          newAccount
        },
      });
  } catch (error: any) {
    dispatch(hideLoading());
    errorHandler(error, CEX_ACCOUNT_ADD);
  }
}

export const deleteCexAccount = (accountId: string) => async (dispatch: Dispatch) => {
  try {
    dispatch(showLoading());
    await walletService.deleteCexAccount(accountId);
    dispatch(hideLoading());

    dispatch({
        type: CEX_ACCOUNT_DELETE,
        payload: {
          accountId
        },
      });
  } catch (error: any) {
    dispatch(hideLoading());
    errorHandler(error, CEX_ACCOUNT_DELETE);
  }
}

export const updateCexAccount = (account: ICexAccountEditRequest) => async (dispatch: Dispatch) => {
  try {
    dispatch(showLoading());
    const newAccount = await walletService.updateCexAccount(account._id, account);
    dispatch(hideLoading());

    dispatch({
        type: CEX_ACCOUNT_UPDATE,
        payload: {
          newAccount
        },
      });
  } catch (error: any) {
    dispatch(hideLoading());
    errorHandler(error, CEX_ACCOUNT_UPDATE);
  }
}
