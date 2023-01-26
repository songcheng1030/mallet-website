import { createSelector } from 'reselect';

import { AppState } from '..';
import { AuthState } from './auth.reducer';
import { IUser } from '../../types';

export const selectUser = createSelector<AppState, AuthState, IUser>(
  (state) => state.authModule,
  (authModule) => authModule.user,
);

export const selectLoggedIn = createSelector<AppState, AuthState, boolean>(
  (state) => state.authModule,
  (authModule) => authModule.loggedIn
);

export const selectElapsedTime = createSelector<AppState, AuthState, number>(
  (state) => state.authModule,
  (authModule) => authModule.elapsedTime
);
