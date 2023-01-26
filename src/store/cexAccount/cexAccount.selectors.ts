import { createSelector } from 'reselect';

import { AppState } from '..';
import { CexAccountState } from './cexAccount.reducer';
import { ICexAccount } from '../../types';

export const selectCexAccounts = createSelector<AppState, CexAccountState, ICexAccount[]>(
  (state) => state.cexAccountModule,
  (cexAccountModule) => cexAccountModule.accounts,
);

export const selectMyCexAccounts = createSelector<AppState, CexAccountState, ICexAccount[]>(
  (state) => state.cexAccountModule,
  (cexAccountModule) => cexAccountModule.myAccounts,
);
