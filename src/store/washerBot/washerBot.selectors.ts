import { createSelector } from 'reselect';

import { AppState } from '..';
import { WasherBotState } from './washerBot.reducer';
import { IWasherBot } from '../../types';

export const selectWasherBots = createSelector<AppState, WasherBotState, IWasherBot[]>(
  (state) => state.washerBotModule,
  (washerBotModule) => washerBotModule.bots,
);

export const selectTotal = createSelector<AppState, WasherBotState, number>(
  (state) => state.washerBotModule,
  (washerBotModule) => washerBotModule.total,
);
