import { Action, Reducer } from 'redux';
import { handleActions } from 'redux-actions';

import { EWasherBotActionResult, EWasherBotStatus, IWasherBot } from '../../types';
import { 
  WASHER_BOT_ADD, 
  WASHER_BOT_DELETE, 
  WASHER_BOT_LOAD_ALL,
  WASHER_BOT_RESPONSE_WAITING, 
  WASHER_BOT_SEARCH, 
  WASHER_BOT_START,
  WASHER_BOT_STOP,
  WASHER_BOT_UPDATE
} from '../action-types';

export interface WasherBotState {
  bots: IWasherBot[],
  total: number
}

interface WasherBotAction extends Action {
  payload: {
    bots: IWasherBot[],
    total: number,
    newBot: IWasherBot,
    botId: string,
    updatedBot: IWasherBot
  }
}

const initialState: WasherBotState = {
  bots: [],
  total: 0
}

export const washerBotReducer: Reducer<WasherBotState, WasherBotAction> = handleActions(
  {
    [WASHER_BOT_LOAD_ALL]: (state: WasherBotState, { payload: { bots }}: WasherBotAction) => {
      let newBots = bots.map(el => {
        const temp = state.bots.find(bot => bot._id === el._id && bot.state.status === EWasherBotStatus.WAITING);
        if (temp) {
          return temp;
        } else {
          return el;
        }
      });
      return {
        ...state,
        bots: newBots
      }
    },
    [WASHER_BOT_SEARCH]: (state: WasherBotState, { payload: { bots, total }}: WasherBotAction) => {
      let newBots = bots.map(el => {
        const temp = state.bots.find(bot => bot._id === el._id && bot.state.status === EWasherBotStatus.WAITING);
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
    [WASHER_BOT_ADD]: (state: WasherBotState, { payload: { newBot }}: WasherBotAction) => {
      let bots = state.bots.slice();
      bots.unshift(newBot);
      return {
        ...state,
        bots
      }
    },
    [WASHER_BOT_DELETE]: (state: WasherBotState, { payload: { botId }}: WasherBotAction) => {
      let bots = state.bots.slice();
      return {
        ...state,
        bots: bots.filter(item => item._id !== botId)
      }
    },
    [WASHER_BOT_UPDATE]: (state: WasherBotState, { payload: { updatedBot }}: WasherBotAction) => {
      const bots = state.bots.map(item => {
        if (item._id === updatedBot._id) return updatedBot;
        else return item;
      });
      // bots.unshift(updatedBot);
      return {
        ...state,
        bots,
      };
    },

    [WASHER_BOT_START]: (state: WasherBotState, { payload: { botId }}: WasherBotAction) => {
      const bots = state.bots.map(item => {
        if (item._id === botId) {
          const temp = {
            ...item,
            state: {
              status: EWasherBotStatus.RUNNING,
              result: EWasherBotActionResult.DRAFT
            }
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

    [WASHER_BOT_STOP]: (state: WasherBotState, { payload: { botId }}: WasherBotAction) => {
      const bots = state.bots.map(item => {
        if (item._id === botId) {
          const temp = {
            ...item,
            state: {
              status: EWasherBotStatus.STOPPED,
              result: EWasherBotActionResult.DRAFT
            }
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

    [WASHER_BOT_RESPONSE_WAITING]: (state: WasherBotState, { payload: { botId }}: WasherBotAction) => {
      const bots = state.bots.map(item => {
        if (item._id === botId) {
          const temp = {
            ...item,
            state: {
              status: EWasherBotStatus.WAITING,
              result: EWasherBotActionResult.DRAFT
            }
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
  },
  initialState,
);
