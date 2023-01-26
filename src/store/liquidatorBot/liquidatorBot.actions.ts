import { Dispatch } from 'redux'
import { showLoading, hideLoading } from 'react-redux-loading-bar';

import { LIQUIDATOR_BOT_ADD, 
  LIQUIDATOR_BOT_DELETE, 
  LIQUIDATOR_BOT_LOAD_ALL, 
  LIQUIDATOR_BOT_START, 
  LIQUIDATOR_BOT_STOP, 
  LIQUIDATOR_BOT_UPDATE, 
  LIQUIDATOR_BOT_RESPONSE_WAITING,
  LIQUIDATOR_BOT_LOAD_STATUSES,
  LIQUIDATOR_BOT_SEARCH
} from '../action-types';
import errorHandler from '../error-handler';
import { botService } from '../../services';
import { ILiquidatorBot, ILiquidatorBotAddRequest, IBotTradingRequest, LiquidatorFilter } from '../../types';
import { showNotification } from "../../shared/helpers";

export const searchLiquidatorBots = (filter: LiquidatorFilter) => async (dispatch: Dispatch) => {
  try {
      const res = await botService.searchLiquidatorBots(filter);

      dispatch({
          type: LIQUIDATOR_BOT_SEARCH,
          payload: {
            bots: res.data ? res.data : [],
            total: res.total
          },
      });
  } catch (error: any) {
      dispatch(hideLoading());
      errorHandler(error, LIQUIDATOR_BOT_SEARCH)
  }
}

export const getLiquidatorBots = () => async (dispatch: Dispatch) => {
  try {
      dispatch(showLoading());
      const bots = await botService.getLiquidatorBots();
      dispatch(hideLoading());

      dispatch({
          type: LIQUIDATOR_BOT_LOAD_ALL,
          payload: {
              bots
          },
      });
  } catch (error: any) {
      dispatch(hideLoading());
      errorHandler(error, LIQUIDATOR_BOT_LOAD_ALL)
  }
}

export const deleteLiquidatorBot = (botId: string) => async (dispatch: Dispatch) => {
  try {
      await botService.deleteLiquidatorBot(botId);

      dispatch({
          type: LIQUIDATOR_BOT_DELETE,
          payload: {
              botId,
          },
      });
  } catch (error: any) {
      errorHandler(error, LIQUIDATOR_BOT_DELETE)
  }
}

export const addLiquidatorBot = (payload: ILiquidatorBotAddRequest) => async (dispatch: Dispatch) => {
  try {
    const newBot = await botService.addLiquidatorBot(payload);
    showNotification("Liquidator is created successfully", 'success', 'topRight');

    dispatch({
      type: LIQUIDATOR_BOT_ADD,
      payload: {
          newBot
      },
    });
  } catch (error: any) {
    errorHandler(error, LIQUIDATOR_BOT_ADD);
  }
}

export const updateLiquidatorBot = (id: string, payload: ILiquidatorBotAddRequest) => async (dispatch: Dispatch) => {
  try {
      const updatedBot = await botService.updateLiquidatorBot(id, payload);

      dispatch({
          type: LIQUIDATOR_BOT_UPDATE,
          payload: {
              updatedBot
          },
      });
  } catch (error: any) {
      dispatch(hideLoading());
      errorHandler(error, LIQUIDATOR_BOT_UPDATE)
  }
}

export const updateLiquidatorBotStatus = (payload: ILiquidatorBot) => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: LIQUIDATOR_BOT_UPDATE,
      payload: {
        updatedBot: payload
      },
    });
  } catch (error: any) {
    errorHandler(error, LIQUIDATOR_BOT_UPDATE);
  }
}

export const startLiquidatorBot = (payload: IBotTradingRequest) => async (dispatch: Dispatch) => {
  try {
      dispatch({
          type: LIQUIDATOR_BOT_RESPONSE_WAITING,
          payload: {
              botId: payload.botId
          },
      });

      await botService.startLiquidatorBot(payload);

      dispatch({
          type: LIQUIDATOR_BOT_START,
          payload: {
              botId: payload.botId
          },
      });
  } catch (error: any) {
      errorHandler(error, LIQUIDATOR_BOT_START)
  }
}

export const stopLiquidatorBot = (payload: IBotTradingRequest) => async (dispatch: Dispatch) => {
  try {
      await botService.stopLiquidatorBot(payload);

      dispatch({
          type: LIQUIDATOR_BOT_STOP,
          payload: {
              botId: payload.botId
          },
      });
  } catch (error: any) {
      errorHandler(error, LIQUIDATOR_BOT_STOP)
  }
}

export const getStatuses = () => async (dispatch: Dispatch) => {
  try {
      const statuses = await botService.getLiquidatorStatus();

      dispatch({
          type: LIQUIDATOR_BOT_LOAD_STATUSES,
          payload: {
              statuses
          },
      });
  } catch (error: any) {
      errorHandler(error, LIQUIDATOR_BOT_LOAD_STATUSES)
  }
}