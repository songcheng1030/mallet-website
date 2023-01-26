import { Dispatch } from 'redux'
import { showLoading, hideLoading } from 'react-redux-loading-bar';

import { TRANSACTION_LOAD_ALL } from '../action-types';
import errorHandler from '../error-handler';
import { transactionService } from '../../services';

export const getAllTransactions = () => async (dispatch: Dispatch) => {
  try {
    dispatch(showLoading());
    const transactions = await transactionService.getHistory();
    dispatch(hideLoading());

    dispatch({
      type: TRANSACTION_LOAD_ALL,
      payload: {
        transactions
      },
    });
  } catch (error: any) {
    dispatch(hideLoading());
    errorHandler(error, TRANSACTION_LOAD_ALL);
  }
}
