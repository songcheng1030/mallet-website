import { Action, Reducer } from 'redux';
import { handleActions } from 'redux-actions';
import { ITransactionHistory } from '../../types';

import { TRANSACTION_LOAD_ALL } from '../action-types';

export interface TransactionState {
    transactions: ITransactionHistory[],
}

interface TransactionAction extends Action {
    payload: {
        transactions: ITransactionHistory[],
    }
}

const initialState: TransactionState = {
    transactions: [],
}

export const transactionReducer: Reducer<TransactionState, TransactionAction> = handleActions(
    {
        [TRANSACTION_LOAD_ALL]: (state: TransactionState, { payload: { transactions } }: TransactionAction) => ({
            ...state,
            transactions
        })
    },
    initialState
)