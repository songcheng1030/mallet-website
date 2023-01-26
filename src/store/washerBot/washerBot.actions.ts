import { Dispatch } from 'redux'
import { showLoading, hideLoading } from 'react-redux-loading-bar';

import { WASHER_BOT_ADD, 
  WASHER_BOT_DELETE, 
  WASHER_BOT_LOAD_ALL, 
  WASHER_BOT_START, 
  WASHER_BOT_STOP, 
  WASHER_BOT_UPDATE, 
  WASHER_BOT_RESPONSE_WAITING,
  WASHER_BOT_SEARCH
} from '../action-types';
import errorHandler from '../error-handler';
import { botService } from '../../services';
import { IWasherBot, IBotTradingRequest, WasherFilter } from '../../types';
import { showNotification } from "../../shared/helpers";

export const searchWasherBots = (filter: WasherFilter) => async (dispatch: Dispatch) => {
  try {
      const res = await botService.searchWasherBots(filter);
      dispatch({
          type: WASHER_BOT_SEARCH,
          payload: {
            bots: res.data ? res.data : [],
            total: res.total
          },
      });
  } catch (error: any) {
      dispatch(hideLoading());
      errorHandler(error, WASHER_BOT_SEARCH)
  }
}

export const getWasherBots = () => async (dispatch: Dispatch) => {
  try {
      dispatch(showLoading());
      const bots = await botService.getWasherBots();
      dispatch(hideLoading());

      dispatch({
          type: WASHER_BOT_LOAD_ALL,
          payload: {
              bots
          },
      });
  } catch (error: any) {
      dispatch(hideLoading());
      errorHandler(error, WASHER_BOT_LOAD_ALL)
  }
}

export const deleteWasherBot = (botId: string) => async (dispatch: Dispatch) => {
  try {
      await botService.deleteWasherBot(botId);

      dispatch({
          type: WASHER_BOT_DELETE,
          payload: {
              botId,
          },
      });
  } catch (error: any) {
      errorHandler(error, WASHER_BOT_DELETE)
  }
}

export const addWasherBot = (payload: IWasherBot) => async (dispatch: Dispatch) => {
  try {
    const newBot = await botService.addWasherBot(payload);
    showNotification("Washer bot is created successfully", 'success', 'topRight');

    dispatch({
      type: WASHER_BOT_ADD,
      payload: {
          newBot
      },
    });
  } catch (error: any) {
    errorHandler(error, WASHER_BOT_ADD);
  }
}

export const updateWasherBot = (id: string, payload: IWasherBot) => async (dispatch: Dispatch) => {
  try {
      const updatedBot = await botService.updateWasherBot(id, payload);

      dispatch({
          type: WASHER_BOT_UPDATE,
          payload: {
              updatedBot
          },
      });
  } catch (error: any) {
      dispatch(hideLoading());
      errorHandler(error, WASHER_BOT_UPDATE)
  }
}

export const updateWasherBotStatus = (payload: IWasherBot) => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: WASHER_BOT_UPDATE,
      payload: {
        updatedBot: payload
      },
    });
  } catch (error: any) {
    errorHandler(error, WASHER_BOT_UPDATE);
  }
}

export const startWasherBot = (payload: IBotTradingRequest) => async (dispatch: Dispatch) => {
  try {
      dispatch({
          type: WASHER_BOT_RESPONSE_WAITING,
          payload: {
              botId: payload.botId
          },
      });

      await botService.startWasherBot(payload);

      dispatch({
          type: WASHER_BOT_START,
          payload: {
              botId: payload.botId
          },
      });
  } catch (error: any) {
      errorHandler(error, WASHER_BOT_START)
  }
}

export const stopWasherBot = (payload: IBotTradingRequest) => async (dispatch: Dispatch) => {
  try {
      await botService.stopWasherBot(payload);

      dispatch({
          type: WASHER_BOT_STOP,
          payload: {
              botId: payload.botId
          },
      });
  } catch (error: any) {
      errorHandler(error, WASHER_BOT_STOP)
  }
}
