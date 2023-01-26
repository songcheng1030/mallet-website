import { Action, Reducer } from 'redux';
import { handleActions } from 'redux-actions';

import { IBot, IBotStatus, ERunningStatus } from '../../types';
import { 
  MANUAL_BOT_LOAD_ALL, 
  MANUAL_BOT_UPDATE, 
  MANUAL_BOT_DELETE, 
  MANUAL_BOT_LOAD_MY, 
  MANUAL_BOT_ADD, 
  MANUAL_BOT_START, 
  MANUAL_BOT_STOP, 
  MANUAL_BOT_LOAD_STATUSES, 
  MANUAL_BOT_ARCHIVE
} from '../action-types';

export interface ManualBotState {
  manualBots: IBot[],
  myManualBots: IBot[],
}

interface BotAction extends Action {
  payload: {
    bots: IBot[],
    myBots: IBot[],
    newBot: IBot,
    updatedBot: IBot,
    botId: string,
    statuses: IBotStatus[],
  }
}

const initialState: ManualBotState = {
  manualBots: [],
  myManualBots: [],
}

export const manualBotReducer: Reducer<ManualBotState, BotAction> = handleActions(
  {
    [MANUAL_BOT_LOAD_ALL]: (state: ManualBotState, { payload: { bots }}: BotAction) => ({
      ...state,
      manualBots: bots,
    }),
    [MANUAL_BOT_LOAD_MY]: (state: ManualBotState, { payload: { myBots }}: BotAction) => ({
      ...state,
      myManualBots: myBots
    }),
    [MANUAL_BOT_ADD]: (state: ManualBotState, { payload: { newBot }}: BotAction) => {
      let bots = state.manualBots.slice();
      bots.unshift(newBot);
      return {
        ...state,
        manualBots: bots
      }
    },
    [MANUAL_BOT_DELETE]: (state: ManualBotState, { payload: { botId }}: BotAction) => {
      let bots = state.manualBots.slice();
      return {
        ...state,
        manualBots: bots.filter(item => item._id !== botId)
      }
    },
    [MANUAL_BOT_UPDATE]: (state: ManualBotState, { payload: { updatedBot }}: BotAction) => {
      const bots = state.manualBots.map(item => item._id === updatedBot._id ? updatedBot : item);
      return {
        ...state,
        manualBots: bots,
      };
    },
    [MANUAL_BOT_START]: (state: ManualBotState, { payload: { botId }}: BotAction) => {
      const bots = state.manualBots.map(item => {
        if (item._id === botId) {
          const temp = {
            ...item.state,
            active: true,
            status: ERunningStatus.RUNNING
          };

          return {
            ...item,
            state: temp,
          }
        }
        else return item;
      });

      return {
        ...state,
        bots,
      };
    },
    [MANUAL_BOT_STOP]: (state: ManualBotState, { payload: { botId }}: BotAction) => {
      const bots = state.manualBots.map(item => {
        if (item._id === botId) {
          const temp = {
            ...item.state,
            active: false,
            status: ERunningStatus.FAILED
          };
          
          return {
            ...item,
            state: temp
          }
        }
        else return item;
      });

      return {
        ...state,
        bots,
      };
    },

    [MANUAL_BOT_LOAD_STATUSES]: (state: ManualBotState, { payload: { statuses }}: BotAction) => {
      const bots = state.manualBots.map(item => {
        const temp = statuses.find(status => status._id === item._id);
        if (temp) {
          return {
            ...item,
            state: temp.state
          }
        }
        else return item;
      });

      return {
        ...state,
        manualBots: bots,
      };
    },
    
    [MANUAL_BOT_ARCHIVE]: (state: ManualBotState, { payload: { botId }}: BotAction) => {
      const bots = state.manualBots.map(item => {
        if (item._id === botId) {
          const temp = {
            ...item.state,
            status: ERunningStatus.ARCHIVED
          };
          
          return {
            ...item,
            state: temp
          }
        }
        else return item;
      });

      return {
        ...state,
        manualBots: bots,
      };
    },
  },
  initialState,
);
