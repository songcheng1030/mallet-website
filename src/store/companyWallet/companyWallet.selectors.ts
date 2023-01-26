import { createSelector } from 'reselect';

import { AppState } from '..';
import { CompanyWalletState } from './companyWallet.reducer';
import { ICompanyWallet } from '../../types';

export const selectCompanyWallets = createSelector<AppState, CompanyWalletState, ICompanyWallet[]>(
  (state) => state.companyWalletModule,
  (companyWalletModule) => companyWalletModule.wallets,
);

export const selectMyCompanyWallets = createSelector<AppState, CompanyWalletState, ICompanyWallet[]>(
  (state) => state.companyWalletModule,
  (companyWalletModule) => companyWalletModule.myWallets,
);
