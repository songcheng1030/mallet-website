import { Dispatch } from 'redux'
import { AUTO_BOT_ADD } from '../action-types';
import errorHandler from '../error-handler';
import { botService } from '../../services';
import { IAutoBotAddRequest } from '../../types';
import { showNotification } from "../../shared/helpers";

export const addAutoBot = (payload: IAutoBotAddRequest) => async (dispatch: Dispatch) => {
  try {
    const newBot = await botService.addAutoBot(payload);
    showNotification("Auto bot is created successfully", 'success', 'topRight');

    dispatch({
      type: AUTO_BOT_ADD,
      payload: {
          newBot
      },
    });
  } catch (error: any) {
    errorHandler(error, AUTO_BOT_ADD);
  }
}

// export const startBot = (botId: string) => async (dispatch: Dispatch) => {
//   try {
//     ws.wsAction(ESocketType.AUTO_BOT_START_REQ, {botId: botId});
//   } catch (error: any) {
//     errorHandler(error, AUTO_BOT_ADD);
//   }
// }

// export const endBot = (botId: string) => async (dispatch: Dispatch) => {
//   try {
//     ws.wsAction(ESocketType.AUTO_BOT_STOP_REQ, {botId: botId});
//   } catch (error: any) {
//     errorHandler(error, AUTO_BOT_ADD);
//   }
// }
