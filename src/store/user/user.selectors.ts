import { createSelector } from 'reselect';

import { AppState } from '..';
import { UserState } from './user.reducer';
import { IUser } from '../../types';

export const selectUsers = createSelector<AppState, UserState, IUser[]>(
  (state) => state.userModule,
  (userModule) => userModule.users,
);
