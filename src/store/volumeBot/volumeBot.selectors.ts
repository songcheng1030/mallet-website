import { createSelector } from 'reselect';

import { AppState } from '..';
import { VolumeBotState } from './volumeBot.reducer';
import { IVolumeBot } from '../../types';

export const selectVolumeBots = createSelector<AppState, VolumeBotState, IVolumeBot[]>(
  (state) => state.volumeBotModule,
  (volumeBotModule) => volumeBotModule.bots,
);

export const selectTotal = createSelector<AppState, VolumeBotState, number>(
  (state) => state.volumeBotModule,
  (volumeBotModule) => volumeBotModule.total,
);
