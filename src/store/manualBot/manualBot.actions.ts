import { Dispatch } from 'redux'
import { showLoading, hideLoading } from 'react-redux-loading-bar';

import { MANUAL_BOT_LOAD_ALL,
  MANUAL_BOT_LOAD_MY, 
  MANUAL_BOT_LOAD_BY_ID, 
  MANUAL_BOT_ADD, 
  MANUAL_BOT_DELETE, 
  MANUAL_BOT_UPDATE, 
  MANUAL_BOT_START, 
  MANUAL_BOT_STOP, 
  MANUAL_BOT_LOAD_STATUSES, 
  MANUAL_BOT_ARCHIVE
} from '../action-types';
import errorHandler from '../error-handler';
import { botService } from '../../services';
import { IBotUpdateRequest, IBotAddRequest, IBotTradingRequest, ETradingInitiator } from '../../types';

export const getBots = () => async (dispatch: Dispatch) => {
  try {
    dispatch(showLoading());
    const bots = await botService.getAll(ETradingInitiator.DIRECT);
    dispatch(hideLoading());

    dispatch({
      type: MANUAL_BOT_LOAD_ALL,
      payload: {
        bots
      },
    });
  } catch (error: any) {
    dispatch(hideLoading());
    errorHandler(error, MANUAL_BOT_LOAD_ALL)
  }
}

export const getMyBots = () => async (dispatch: Dispatch) => {
  try {
    dispatch(showLoading());
    const myBots = await botService.getMyBots();
    dispatch(hideLoading());

    dispatch({
      type: MANUAL_BOT_LOAD_MY,
      payload: {
        myBots
      },
    });
  } catch (error: any) {
    dispatch(hideLoading());
    errorHandler(error, MANUAL_BOT_LOAD_MY)
  }
}

export const getBotById = (id: string) => async (dispatch: Dispatch) => {
  try {
    dispatch(showLoading());
    const bot = await botService.getBotById(id);
    dispatch(hideLoading());

    dispatch({
      type: MANUAL_BOT_LOAD_BY_ID,
      payload: {
        bot
      },
    });
  } catch (error: any) {
    dispatch(hideLoading());
    errorHandler(error, MANUAL_BOT_LOAD_BY_ID)
  }
}

export const addBot = (payload: IBotAddRequest) => async (dispatch: Dispatch) => {
  try {
    dispatch(showLoading());
    const newBot = await botService.addBot(payload);
    dispatch(hideLoading());

    dispatch({
      type: MANUAL_BOT_ADD,
      payload: {
        newBot
      },
    });

    await botService.startBot({
      botId: newBot._id,
      type: newBot.type,
      active: true,
    });
    dispatch({
      type: MANUAL_BOT_START,
      payload: {
        botId: newBot._id
      },
    });
  } catch (error: any) {
    dispatch(hideLoading());
    errorHandler(error, MANUAL_BOT_ADD)
  }
}

export const updateBot = (id: string, payload: IBotUpdateRequest) => async (dispatch: Dispatch) => {
  try {
    dispatch(showLoading());
    const updatedBot = await botService.updateBot(id, payload);
    dispatch(hideLoading());

    dispatch({
      type: MANUAL_BOT_UPDATE,
      payload: {
        updatedBot
      },
    });
  } catch (error: any) {
      dispatch(hideLoading());
      errorHandler(error, MANUAL_BOT_UPDATE)
  }
}

export const deleteBot = (botId: string) => async (dispatch: Dispatch) => {
  try {
    await botService.deleteBot(botId);

    dispatch({
      type: MANUAL_BOT_DELETE,
      payload: {
          botId,
      },
    });
  } catch (error: any) {
    errorHandler(error, MANUAL_BOT_DELETE)
  }
}

export const discardBot = (payload: IBotUpdateRequest) => async (dispatch: Dispatch) => {
  try {
    await botService.updateBot(payload._id, payload);

    dispatch({
      type: MANUAL_BOT_ARCHIVE,
      payload: {
        botId: payload._id
      },
    });
  } catch (error: any) {
    errorHandler(error, MANUAL_BOT_DELETE)
  }
}

export const startBot = (payload: IBotTradingRequest) => async (dispatch: Dispatch) => {
  try {
    await botService.startBot(payload);

    dispatch({
      type: MANUAL_BOT_START,
      payload: {
        botId: payload.botId
      },
    });
  } catch (error: any) {
    errorHandler(error, MANUAL_BOT_START)
  }
}

export const stopBot = (payload: IBotTradingRequest) => async (dispatch: Dispatch) => {
  try {
    await botService.stopBot(payload);

    dispatch({
      type: MANUAL_BOT_STOP,
      payload: {
        botId: payload.botId
      },
    });
  } catch (error: any) {
    errorHandler(error, MANUAL_BOT_STOP)
  }
}

export const getStatuses = () => async (dispatch: Dispatch) => {
  try {
    const statuses = await botService.getAllStatus(ETradingInitiator.DIRECT);

    dispatch({
      type: MANUAL_BOT_LOAD_STATUSES,
      payload: {
        statuses
      },
    });
  } catch (error: any) {
    errorHandler(error, MANUAL_BOT_LOAD_STATUSES)
  }
}
