import { Dispatch } from 'redux'
import { showLoading, hideLoading } from 'react-redux-loading-bar';

import { BOT_LOAD_ALL, BOT_LOAD_MY, BOT_LOAD_BY_ID, BOT_ADD, BOT_DELETE, BOT_UPDATE, BOT_START, BOT_STOP, BOT_LOAD_STATUSES, BOT_ARCHIVE, BOT_RESPONSE_WAITING, BOT_SEARCH } from '../action-types';
import errorHandler from '../error-handler';
import { botService } from '../../services';
import { IBotUpdateRequest, IBotAddRequest, IBotTradingRequest, BotFilter } from '../../types';

export const getBots = () => async (dispatch: Dispatch) => {
    try {
        dispatch(showLoading());
        const bots = await botService.getAll();
        dispatch(hideLoading());

        dispatch({
            type: BOT_LOAD_ALL,
            payload: {
                bots
            },
        });
    } catch (error: any) {
        dispatch(hideLoading());
        errorHandler(error, BOT_LOAD_ALL)
    }
}

export const searchBots = (filter: BotFilter) => async (dispatch: Dispatch) => {
    try {
        // dispatch(showLoading());
        const result = await botService.searchBots(filter);
        // dispatch(hideLoading());

        dispatch({
            type: BOT_SEARCH,
            payload: {
                bots: result.data,
                total: result.total
            },
        });
    } catch (error: any) {
        // dispatch(hideLoading());
        errorHandler(error, BOT_SEARCH)
    }
}

export const getMyBots = () => async (dispatch: Dispatch) => {
    try {
        dispatch(showLoading());
        const myBots = await botService.getMyBots();
        dispatch(hideLoading());

        dispatch({
            type: BOT_LOAD_MY,
            payload: {
                myBots
            },
        });
    } catch (error: any) {
        dispatch(hideLoading());
        errorHandler(error, BOT_LOAD_MY)
    }
}

export const getBotById = (id: string) => async (dispatch: Dispatch) => {
    try {
        dispatch(showLoading());
        const bot = await botService.getBotById(id);
        dispatch(hideLoading());

        dispatch({
            type: BOT_LOAD_BY_ID,
            payload: {
                bot
            },
        });
    } catch (error: any) {
        dispatch(hideLoading());
        errorHandler(error, BOT_LOAD_BY_ID)
    }
}

export const addBot = (payload: IBotAddRequest) => async (dispatch: Dispatch) => {
    try {
        dispatch(showLoading());
        const newBot = await botService.addBot(payload);
        dispatch(hideLoading());

        dispatch({
            type: BOT_ADD,
            payload: {
                newBot
            },
        });
    } catch (error: any) {
        dispatch(hideLoading());
        errorHandler(error, BOT_ADD)
    }
}

export const updateBot = (id: string, payload: IBotUpdateRequest) => async (dispatch: Dispatch) => {
    try {
        dispatch(showLoading());
        const updatedBot = await botService.updateBot(id, payload);
        dispatch(hideLoading());

        dispatch({
            type: BOT_UPDATE,
            payload: {
                updatedBot
            },
        });
    } catch (error: any) {
        dispatch(hideLoading());
        errorHandler(error, BOT_UPDATE)
    }
}

export const deleteBot = (botId: string) => async (dispatch: Dispatch) => {
    try {
        await botService.deleteBot(botId);

        dispatch({
            type: BOT_DELETE,
            payload: {
                botId,
            },
        });
    } catch (error: any) {
        errorHandler(error, BOT_DELETE)
    }
}

export const discardBot = (payload: IBotUpdateRequest) => async (dispatch: Dispatch) => {
    try {
        await botService.updateBot(payload._id, payload);

        dispatch({
            type: BOT_ARCHIVE,
            payload: {
                botId: payload._id
            },
        });
    } catch (error: any) {
        errorHandler(error, BOT_DELETE)
    }
}

export const startBot = (payload: IBotTradingRequest) => async (dispatch: Dispatch) => {
    try {
        dispatch({
            type: BOT_RESPONSE_WAITING,
            payload: {
                botId: payload.botId
            },
        });
        
        await botService.startBot(payload);

        dispatch({
            type: BOT_START,
            payload: {
                botId: payload.botId
            },
        });
    } catch (error: any) {
        errorHandler(error, BOT_START)
    }
}

export const stopBot = (payload: IBotTradingRequest) => async (dispatch: Dispatch) => {
    try {
        await botService.stopBot(payload);
        dispatch({
            type: BOT_STOP,
            payload: {
                botId: payload.botId
            },
        });
    } catch (error: any) {
        errorHandler(error, BOT_STOP)
    }
}

export const getStatuses = () => async (dispatch: Dispatch) => {
    try {
        const statuses = await botService.getAllStatus();

        dispatch({
            type: BOT_LOAD_STATUSES,
            payload: {
                statuses
            },
        });
    } catch (error: any) {
        errorHandler(error, BOT_LOAD_STATUSES)
    }
}
