import { createSelector } from 'reselect';

import { AppState } from '..';
import { PoolState } from './pool.reducer';
import { IPool } from '../../types';

export const selectPools = createSelector<AppState, PoolState, IPool[]>(
  (state) => state.poolModule,
  (poolModule) => poolModule.pools,
);

export const selectTotal = createSelector<AppState, PoolState, number>(
  (state) => state.poolModule,
  (poolModule) => poolModule.total,
);

export const selectRunningPools = createSelector<AppState, PoolState, IPool[]>(
  (state) => state.poolModule,
  (poolModule) => poolModule.runningPools,
);
