import { Action, Reducer } from 'redux';
import { handleActions } from 'redux-actions';

import { EVolumeBotStatus, IVolumeBot, IVolumeBotStatus } from '../../types';
import { 
  VOLUME_BOT_ADD, 
  VOLUME_BOT_LOAD_ALL, 
  VOLUME_BOT_DELETE, 
  VOLUME_BOT_UPDATE, 
  VOLUME_BOT_RESPONSE_WAITING, 
  VOLUME_BOT_START, 
  VOLUME_BOT_STOP,
  VOLUME_BOT_LOAD_STATUSES,
  VOLUME_BOT_SEARCH
} from '../action-types';

export interface VolumeBotState {
  bots: IVolumeBot[];
  total: number;
}

interface VolumeBotAction extends Action {
  payload: {
    bots: IVolumeBot[],
    total: number,
    newBot: IVolumeBot,
    botId: string,
    updatedBot: IVolumeBot,
    statuses: IVolumeBotStatus[]
  }
}

const initialState: VolumeBotState = {
  bots: [],
  total: 0
}

export const volumeBotReducer: Reducer<VolumeBotState, VolumeBotAction> = handleActions(
  {
    [VOLUME_BOT_LOAD_ALL]: (state: VolumeBotState, { payload: { bots }}: VolumeBotAction) => ({
      ...state,
      bots,
    }),
    [VOLUME_BOT_SEARCH]: (state: VolumeBotState, { payload: { bots, total }}: VolumeBotAction) => {
      let newBots = bots.map(el => {
        const temp = state.bots.find(bot => bot._id === el._id && bot.state === EVolumeBotStatus.WAITING);
        if (temp) {
          return temp;
        } else {
          return el;
        }
      });

      return {
        ...state,
        bots: newBots,
        total: total
      }
    },
    [VOLUME_BOT_ADD]: (state: VolumeBotState, { payload: { newBot }}: VolumeBotAction) => {
      let bots = state.bots.slice();
      bots.unshift(newBot);
      return {
        ...state,
        bots
      }
    },
    [VOLUME_BOT_DELETE]: (state: VolumeBotState, { payload: { botId }}: VolumeBotAction) => {
      let bots = state.bots.slice();
      return {
        ...state,
        bots: bots.filter(item => item._id !== botId)
      }
    },
    [VOLUME_BOT_UPDATE]: (state: VolumeBotState, { payload: { updatedBot }}: VolumeBotAction) => {
      const bots = state.bots.map(item => item._id === updatedBot._id ? updatedBot : item);
      return {
        ...state,
        bots,
      };
    },
    [VOLUME_BOT_START]: (state: VolumeBotState, { payload: { botId }}: VolumeBotAction) => {
      const bots = state.bots.map(item => {
        if (item._id === botId) {
          const temp = {
            ...item,
            state: EVolumeBotStatus.RUNNING
          };
          return temp;
        }
        else return item;
      });

      return {
        ...state,
        bots,
      };
    },
    [VOLUME_BOT_STOP]: (state: VolumeBotState, { payload: { botId }}: VolumeBotAction) => {
      const bots = state.bots.map(item => {
        if (item._id === botId) {
          const temp = {
            ...item,
            state: EVolumeBotStatus.FAILED
          };
          
          return temp;
        }
        else return item;
      });

      return {
        ...state,
        bots,
      };
    },
    [VOLUME_BOT_RESPONSE_WAITING]: (state: VolumeBotState, { payload: { botId }}: VolumeBotAction) => {
      const bots = state.bots.map(item => {
        if (item._id === botId) {
          const temp = {
            ...item,
            state: EVolumeBotStatus.WAITING
          };
          
          return temp;
        }
        else return item;
      });

      return {
        ...state,
        bots,
      };
    },
    [VOLUME_BOT_LOAD_STATUSES]: (state: VolumeBotState, { payload: { statuses }}: VolumeBotAction) => {
      const bots = state.bots.map(item => {
        const temp = statuses.find(status => status._id === item._id && item.state !== EVolumeBotStatus.WAITING);
        if (temp) {
          return {
            ...item,
            state: temp.state,
            addLiquiditySchedule: temp.addLiquiditySchedule,
            sellingSchedule: temp.sellingSchedule
          }
        }
        else return item;
      });

      return {
        ...state,
        bots,
      };
    },
  },
  initialState,
);
