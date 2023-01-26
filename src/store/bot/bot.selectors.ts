import { createSelector } from 'reselect';

import { AppState } from '..';
import { BotState } from './bot.reducer';
import { IBot } from '../../types';

export const selectBots = createSelector<AppState, BotState, IBot[]>(
  (state) => state.botModule,
  (botModule) => botModule.bots,
);

export const selectMyBots = createSelector<AppState, BotState, IBot[]>(
  (state) => state.botModule,
  (botModule) => botModule.myBots,
);

export const selectTotal = createSelector<AppState, BotState, number>(
  (state) => state.botModule,
  (botModule) => botModule.total,
);
