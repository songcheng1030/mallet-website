import { createSelector } from 'reselect';

import { AppState } from '..';
import { LiquidatorBotState } from './liquidatorBot.reducer';
import { ILiquidatorBot } from '../../types';

export const selectLiquidatorBots = createSelector<AppState, LiquidatorBotState, ILiquidatorBot[]>(
  (state) => state.liquidatorBotModule,
  (liquidatorBotModule) => liquidatorBotModule.bots,
);

export const selectTotal = createSelector<AppState, LiquidatorBotState, number>(
  (state) => state.liquidatorBotModule,
  (liquidatorBotModule) => liquidatorBotModule.total,
);
