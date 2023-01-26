import { Action, Reducer } from 'redux';
import { handleActions } from 'redux-actions';

import { ELiquidatorBotStatus, ILiquidatorBot, ILiquidatorBotStatus } from '../../types';
import { 
  LIQUIDATOR_BOT_ADD, 
  LIQUIDATOR_BOT_DELETE, 
  LIQUIDATOR_BOT_LOAD_ALL, 
  LIQUIDATOR_BOT_UPDATE, 
  LIQUIDATOR_BOT_START, 
  LIQUIDATOR_BOT_STOP, 
  LIQUIDATOR_BOT_RESPONSE_WAITING,
  LIQUIDATOR_BOT_LOAD_STATUSES,
  LIQUIDATOR_BOT_SEARCH
} from '../action-types';

export interface LiquidatorBotState {
  bots: ILiquidatorBot[],
  total: number
}

interface LiquidatorBotAction extends Action {
  payload: {
    bots: ILiquidatorBot[],
    total: number,
    newBot: ILiquidatorBot,
    botId: string,
    updatedBot: ILiquidatorBot,
    statuses: ILiquidatorBotStatus[]
  }
}

const initialState: LiquidatorBotState = {
  bots: [],
  total: 0
}

export const liquidatorBotReducer: Reducer<LiquidatorBotState, LiquidatorBotAction> = handleActions(
  {
    [LIQUIDATOR_BOT_LOAD_ALL]: (state: LiquidatorBotState, { payload: { bots }}: LiquidatorBotAction) => {
      let newBots = bots.map(el => {
        const temp = state.bots.find(bot => bot._id === el._id && bot.state === ELiquidatorBotStatus.WAITING);
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
    [LIQUIDATOR_BOT_SEARCH]: (state: LiquidatorBotState, { payload: { bots, total }}: LiquidatorBotAction) => {
      let newBots = bots.map(el => {
        const temp = state.bots.find(bot => bot._id === el._id && bot.state === ELiquidatorBotStatus.WAITING);
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
    [LIQUIDATOR_BOT_ADD]: (state: LiquidatorBotState, { payload: { newBot }}: LiquidatorBotAction) => {
      let bots = state.bots.slice();
      bots.unshift(newBot);
      return {
        ...state,
        bots
      }
    },
    [LIQUIDATOR_BOT_DELETE]: (state: LiquidatorBotState, { payload: { botId }}: LiquidatorBotAction) => {
      let bots = state.bots.slice();
      return {
        ...state,
        bots: bots.filter(item => item._id !== botId)
      }
    },
    [LIQUIDATOR_BOT_UPDATE]: (state: LiquidatorBotState, { payload: { updatedBot }}: LiquidatorBotAction) => {
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

    [LIQUIDATOR_BOT_START]: (state: LiquidatorBotState, { payload: { botId }}: LiquidatorBotAction) => {
      const bots = state.bots.map(item => {
        if (item._id === botId) {
          const temp = {
            ...item,
            state: ELiquidatorBotStatus.RUNNING
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

    [LIQUIDATOR_BOT_STOP]: (state: LiquidatorBotState, { payload: { botId }}: LiquidatorBotAction) => {
      const bots = state.bots.map(item => {
        if (item._id === botId) {
          const temp = {
            ...item,
            state: ELiquidatorBotStatus.STOPPED
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

    [LIQUIDATOR_BOT_RESPONSE_WAITING]: (state: LiquidatorBotState, { payload: { botId }}: LiquidatorBotAction) => {
      const bots = state.bots.map(item => {
        if (item._id === botId) {
          const temp = {
            ...item,
            state: ELiquidatorBotStatus.WAITING
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

    [LIQUIDATOR_BOT_LOAD_STATUSES]: (state: LiquidatorBotState, { payload: { statuses }}: LiquidatorBotAction) => {
      const bots = state.bots.map(item => {
        const temp = statuses.find(status => status._id === item._id && item.state !== ELiquidatorBotStatus.WAITING);
        if (temp) {
          return {
            ...item,
            state: temp.state,
            tokenSold: temp.tokenSold
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
