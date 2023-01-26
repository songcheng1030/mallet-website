import { createSelector } from 'reselect';

import { AppState } from '..';
import { BotState } from './autoBot.reducer';
import { IBot } from '../../types';

export const selectBots = createSelector<AppState, BotState, IBot[]>(
  (state) => state.botModule,
  (botModule) => botModule.bots,
);

export const selectMyBots = createSelector<AppState, BotState, IBot[]>(
  (state) => state.botModule,
  (botModule) => botModule.myBots,
);
