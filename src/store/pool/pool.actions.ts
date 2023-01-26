import { Dispatch } from 'redux'
import { hideLoading } from 'react-redux-loading-bar';

import { POOL_LOAD_ALL, AUTO_BOT_ADD, AUTO_BOT_UPDATE, AUTO_BOT_START, AUTO_BOT_STOP, AUTO_BOT_RESPONSE_WAITING, POOL_LOAD_RUNNING } from '../action-types';
import errorHandler from '../error-handler';
import { poolService, botService } from '../../services';
import { PoolFilter, IAutoBotAddRequest, IAutoBot, IBotTradingRequest } from '../../types';
import { showNotification } from "../../shared/helpers";

export const searchPools = (filter: PoolFilter) => async (dispatch: Dispatch) => {
    try {
        const res = await poolService.search(filter);

        dispatch({
            type: POOL_LOAD_ALL,
            payload: {
                pools: res.data,
                total: res.total
            },
        });
    } catch (error: any) {
        dispatch(hideLoading());
        errorHandler(error, POOL_LOAD_ALL)
    }
}

export const searchRunningPools = (filter: PoolFilter) => async (dispatch: Dispatch) => {
  try {
      const res = await poolService.searchRunning(filter);

      dispatch({
          type: POOL_LOAD_RUNNING,
          payload: {
            runningPools: res.data
          },
      });
  } catch (error: any) {
      dispatch(hideLoading());
      errorHandler(error, POOL_LOAD_RUNNING)
  }
}

export const addBot = (payload: IAutoBotAddRequest) => async (dispatch: Dispatch) => {
  try {
    const newBot = await botService.addAutoBot(payload);
    showNotification("Auto bot is created successfully", 'success', 'topRight');

    dispatch({
      type: AUTO_BOT_ADD,
      payload: {
        addBot: {
          _id: payload.pool,
          newBot
        }
      },
    });
  } catch (error: any) {
    errorHandler(error, AUTO_BOT_ADD);
  }
}

export const updateBot = (payload: IAutoBot) => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: AUTO_BOT_UPDATE,
      payload: {
        updateBot: payload
      },
    });
  } catch (error: any) {
    errorHandler(error, AUTO_BOT_UPDATE);
  }
}

export const startAutoBot = (payload: IBotTradingRequest) => async (dispatch: Dispatch) => {
  try {
      dispatch({
          type: AUTO_BOT_RESPONSE_WAITING,
          payload: {
              botId: payload.botId
          },
      });

      await botService.startAutoBot(payload);

      dispatch({
          type: AUTO_BOT_START,
          payload: {
              botId: payload.botId
          },
      });
  } catch (error: any) {
      errorHandler(error, AUTO_BOT_START)
  }
}

export const stopAutoBot = (payload: IBotTradingRequest) => async (dispatch: Dispatch) => {
  try {
      await botService.stopAutoBot(payload);

      dispatch({
          type: AUTO_BOT_STOP,
          payload: {
              botId: payload.botId
          },
      });
  } catch (error: any) {
      errorHandler(error, AUTO_BOT_STOP)
  }
}

// export const getStatuses = () => async (dispatch: Dispatch) => {
//   try {
//       const statuses = await botService.getLiquidatorStatus();

//       dispatch({
//           type: LIQUIDATOR_BOT_LOAD_STATUSES,
//           payload: {
//               statuses
//           },
//       });
//   } catch (error: any) {
//       errorHandler(error, LIQUIDATOR_BOT_LOAD_STATUSES)
//   }
// }
