import { Action, Reducer } from 'redux';
import { handleActions } from 'redux-actions';

import { IAutoBot, IPool, ERunningStatus } from '../../types';
import { POOL_LOAD_ALL, AUTO_BOT_ADD, AUTO_BOT_UPDATE, AUTO_BOT_START, AUTO_BOT_STOP, AUTO_BOT_RESPONSE_WAITING, POOL_LOAD_RUNNING } from '../action-types';

export interface PoolState {
  pools: IPool[];
  runningPools: IPool[];
  total: number;
}

interface PoolAction extends Action {
  payload: {
    pools: IPool[],
    total: number,
    runningPools: IPool[],
    addBot: {
      _id: string,
      newBot: IAutoBot
    },
    updateBot: IAutoBot,
    botId: string;
  }
}

const initialState: PoolState = {
  pools: [],
  total: 0,
  runningPools: [],
}

export const poolReducer: Reducer<PoolState, PoolAction> = handleActions(
  {
    [POOL_LOAD_ALL]: (state: PoolState, { payload: { pools, total }}: PoolAction) => ({
      ...state,
      pools,
      total: total
    }),

    [POOL_LOAD_RUNNING]: (state: PoolState, { payload: { runningPools }}: PoolAction) => ({
      ...state,
      runningPools
    }),
    
    [AUTO_BOT_ADD]: (state: PoolState, { payload: { addBot }}: PoolAction) => {
      const pools = state.pools.map(el => {
        if (el._id === addBot._id) {
          return {
            ...el,
            autoBot: addBot.newBot
          }
        } else {
          return el;
        }
      });

      return {
        ...state,
        pools,
      };
    },

    [AUTO_BOT_UPDATE]: (state: PoolState, { payload: { updateBot }}: PoolAction) => {
      const pools = state.pools.map(el => {
        if (el.autoBot?._id === updateBot._id) {
          return {
            ...el,
            autoBot: updateBot
          }
        } else {
          return el;
        }
      });

      return {
        ...state,
        pools,
      };
    },

    [AUTO_BOT_START]: (state: PoolState, { payload: { botId }}: PoolAction) => {
      const pools = state.pools.map(el => {
        if (el.autoBot?._id === botId) {
          const state = {
            ...el.autoBot.state,
            active: true,
            status: ERunningStatus.RUNNING
          }
          return {
            ...el,
            autoBot: {
              ...el.autoBot,
              state: state
            }
          }
        } else {
          return el;
        }
      });

      return {
        ...state,
        pools,
      };
    },

    [AUTO_BOT_STOP]: (state: PoolState, { payload: { botId }}: PoolAction) => {
      const pools = state.pools.map(el => {
        if (el.autoBot?._id === botId) {
          const state = {
            ...el.autoBot.state,
            active: false,
            status: ERunningStatus.FAILED
          }
          return {
            ...el,
            autoBot: {
              ...el.autoBot,
              state: state
            }
          }
        } else {
          return el;
        }
      });

      return {
        ...state,
        pools,
      };
    },

    [AUTO_BOT_RESPONSE_WAITING]: (state: PoolState, { payload: { botId }}: PoolAction) => {
      const pools = state.pools.map(el => {
        if (el.autoBot?._id === botId) {
          const state = {
            ...el.autoBot.state,
            active: true,
            status: ERunningStatus.WAITING
          }
          return {
            ...el,
            autoBot: {
              ...el.autoBot,
              state: state
            }
          }
        } else {
          return el;
        }
      });

      return {
        ...state,
        pools,
      };
    },

    // [LIQUIDATOR_BOT_LOAD_STATUSES]: (state: LiquidatorBotState, { payload: { statuses }}: LiquidatorBotAction) => {
    //   const bots = state.bots.map(item => {
    //     const temp = statuses.find(status => status._id === item._id);
    //     if (temp) {
    //       return {
    //         ...item,
    //         state: temp.state
    //       }
    //     }
    //     else return item;
    //   });

    //   return {
    //     ...state,
    //     bots,
    //   };
    // },
  },
  initialState,
);
