import { Action, Reducer } from 'redux';
import { handleActions } from 'redux-actions';

import { ICexAccount } from '../../types';
import { CEX_ACCOUNT_ADD, CEX_ACCOUNT_DELETE, CEX_ACCOUNT_LOAD_ALL, CEX_ACCOUNT_LOAD_MY, CEX_ACCOUNT_UPDATE } from '../action-types';

export interface CexAccountState {
  accounts: ICexAccount[],
  myAccounts: ICexAccount[],
}

interface CexAccountAction extends Action {
  payload: {
    accounts: ICexAccount[],
    myAccounts: ICexAccount[],
    newAccount: ICexAccount,
    accountId: string,
  }
}

const initialState: CexAccountState = {
  accounts: [],
  myAccounts: [],
}

export const cexAccountReducer: Reducer<CexAccountState, CexAccountAction> = handleActions(
  {
    [CEX_ACCOUNT_LOAD_ALL]: (state: CexAccountState, { payload: { accounts }}: CexAccountAction) => ({
      ...state,
      accounts,
    }),
    [CEX_ACCOUNT_LOAD_MY]: (state: CexAccountState, { payload: { myAccounts }}: CexAccountAction) => ({
      ...state,
      myAccounts
    }),
    [CEX_ACCOUNT_ADD]: (state: CexAccountState, { payload: { newAccount }}: CexAccountAction) => {
      let myAccounts = state.myAccounts.slice();
      myAccounts.unshift(newAccount);
      return {
        ...state,
        myAccounts
      }
    },
    [CEX_ACCOUNT_UPDATE]: (state: CexAccountState, { payload: { newAccount }}: CexAccountAction) => {
      let myAccounts = state.myAccounts.slice();
      return {
        ...state,
        myAccounts: myAccounts.map(account => {
          if (account._id === newAccount._id) return newAccount;
          else return account;
        })
      }
    },
    [CEX_ACCOUNT_DELETE]: (state: CexAccountState, { payload: { accountId }}: CexAccountAction) => {
      let accounts = state.myAccounts.slice();
      return {
        ...state,
        myAccounts: accounts.filter(item => item._id !== accountId)
      }
    }
  },
  initialState,
);
