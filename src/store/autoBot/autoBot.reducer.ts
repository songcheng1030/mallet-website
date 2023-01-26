import { Action, Reducer } from 'redux';
import { handleActions } from 'redux-actions';

import { IBot, IBotStatus, ERunningStatus } from '../../types';
import { BOT_LOAD_ALL, BOT_UPDATE, BOT_DELETE, BOT_LOAD_MY, BOT_ADD, BOT_START, BOT_STOP, BOT_LOAD_STATUSES, BOT_ARCHIVE } from '../action-types';

export interface BotState {
  bots: IBot[],
  myBots: IBot[],
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

const initialState: BotState = {
  bots: [],
  myBots: [],
}

export const botReducer: Reducer<BotState, BotAction> = handleActions(
  {
    [BOT_LOAD_ALL]: (state: BotState, { payload: { bots }}: BotAction) => ({
      ...state,
      bots,
    }),
    [BOT_LOAD_MY]: (state: BotState, { payload: { myBots }}: BotAction) => ({
      ...state,
      myBots
    }),
    [BOT_ADD]: (state: BotState, { payload: { newBot }}: BotAction) => {
      let bots = state.bots.slice();
      bots.unshift(newBot);
      return {
        ...state,
        bots
      }
    },
    [BOT_DELETE]: (state: BotState, { payload: { botId }}: BotAction) => {
      let bots = state.bots.slice();
      return {
        ...state,
        bots: bots.filter(item => item._id !== botId)
      }
    },
    [BOT_UPDATE]: (state: BotState, { payload: { updatedBot }}: BotAction) => {
      const bots = state.bots.map(item => item._id === updatedBot._id ? updatedBot : item);
      return {
        ...state,
        bots,
      };
    },
    [BOT_START]: (state: BotState, { payload: { botId }}: BotAction) => {
      const bots = state.bots.map(item => {
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
    [BOT_STOP]: (state: BotState, { payload: { botId }}: BotAction) => {
      const bots = state.bots.map(item => {
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

    [BOT_LOAD_STATUSES]: (state: BotState, { payload: { statuses }}: BotAction) => {
      const bots = state.bots.map(item => {
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
        bots,
      };
    },
    
    [BOT_ARCHIVE]: (state: BotState, { payload: { botId }}: BotAction) => {
      const bots = state.bots.map(item => {
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
        bots,
      };
    },
  },
  initialState,
);
