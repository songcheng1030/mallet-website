import { Action, Reducer } from 'redux';
import { handleActions } from 'redux-actions';
import { ISocketData, ESocketType, IChainMaxGasPrice, ISocketAutoBotState } from '../../types';

import { SOCKET_RECEIVED_DATA } from '../action-types';

export interface SocketState {
  chainMaxGasPrice: IChainMaxGasPrice,
  autoBotState: ISocketAutoBotState
}

interface SocketAction extends Action {
  payload: {
    socketData: ISocketData
  }
}

const initialState: SocketState = {
  chainMaxGasPrice: {
    blockchainId: '',
    maxGasPrice: 0
  },
  autoBotState: {
    botId: '',
    state: ''
  }
}

export const socketReducer: Reducer<SocketState, SocketAction> = handleActions(
  {
    [SOCKET_RECEIVED_DATA]: (state: SocketState, { payload: { socketData } }: SocketAction) => {
      let temp = {
        ...state
      };
      switch(socketData.type) {
        case ESocketType.CHAIN_MAX_GAS_PRICE: 
          temp = {
            ...temp,
            chainMaxGasPrice: socketData.data
          };
          break;
        case ESocketType.AUTO_BOT_STATE:
          temp = {
            ...temp,
            autoBotState: socketData.data
          };
          break;
        default:
          break;
      }
      
      return {
        ...temp
      }
    }
  },
  initialState
)