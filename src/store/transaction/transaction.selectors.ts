import { createSelector } from "reselect";

import { AppState } from '..';
import { TransactionState } from "./transaction.reducer";
import { ITransactionHistory } from "../../types";

export const selectTransactions = createSelector<AppState, TransactionState, ITransactionHistory[]>(
    (state) => state.transactionModule,
    (transactionModule) => transactionModule.transactions
)
