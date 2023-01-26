import { createSelector } from 'reselect';

import { AppState } from '..';
import { ManualBotState } from './manualBot.reducer';
import { IBot } from '../../types';

export const selectManualBots = createSelector<AppState, ManualBotState, IBot[]>(
  (state) => state.manualBotModule,
  (botModule) => botModule.manualBots,
);

export const selectMyManualBots = createSelector<AppState, ManualBotState, IBot[]>(
  (state) => state.manualBotModule,
  (botModule) => botModule.myManualBots,
);
