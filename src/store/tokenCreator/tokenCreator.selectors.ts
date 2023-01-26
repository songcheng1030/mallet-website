import { createSelector } from 'reselect';

import { AppState } from '..';
import { TokenCreatorState } from './tokenCreator.reducer';
import { ITokenCreator } from 'types';

export const selectTokenCreators = createSelector<AppState, TokenCreatorState, ITokenCreator[]>(
  (state) => state.TokenCreatorModule,
  (TokenCreatorModule) => TokenCreatorModule.tokenCreators,
);

export const selectTotal = createSelector<AppState, TokenCreatorState, number>(
  (state) => state.TokenCreatorModule,
  (TokenCreatorModule) => TokenCreatorModule.total,
);
