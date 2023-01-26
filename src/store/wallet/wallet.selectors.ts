import { createSelector } from 'reselect';

import { AppState } from '..';
import { WalletState } from './wallet.reducer';
import { IWallet } from '../../types';

export const selectWallets = createSelector<AppState, WalletState, IWallet[]>(
  (state) => state.walletModule,
  (walletModule) => walletModule.wallets,
);

export const selectMyWallets = createSelector<AppState, WalletState, IWallet[]>(
  (state) => state.walletModule,
  (walletModule) => walletModule.myWallets,
);
