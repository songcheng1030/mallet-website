import { Action, Reducer } from 'redux';
import { handleActions } from 'redux-actions';

import { ITokenCreator } from '../../types';
import { 
  TOKEN_CREATOR_ADD,
  TOKEN_CREATOR_DELETE,
  TOKEN_CREATOR_LOAD_ALL,
  // TOKEN_CREATOR_RESPONSE_WAITING,
  TOKEN_CREATOR_SEARCH,
  TOKEN_CREATOR_UPDATE
} from '../action-types';

export interface TokenCreatorState {
  tokenCreators: ITokenCreator[],
  total: number
}

interface TokenCreatorAction extends Action {
  payload: {
    tokenCreators: ITokenCreator[],
    total: number,
    newTokenCreator: ITokenCreator,
    updatedTokenCreator: ITokenCreator,
    tokenCreatorId: string
  }
}

const initialState: TokenCreatorState = {
  tokenCreators: [],
  total: 0
}

export const TokenCreatorReducer: Reducer<TokenCreatorState, TokenCreatorAction> = handleActions(
  {
    [TOKEN_CREATOR_LOAD_ALL]: (state: TokenCreatorState, { payload: { tokenCreators }}: TokenCreatorAction) => {
      return {
        ...state,
        tokenCreators: tokenCreators
      }
    },
    [TOKEN_CREATOR_SEARCH]: (state: TokenCreatorState, { payload: { tokenCreators, total }}: TokenCreatorAction) => {
      return {
        ...state,
        tokenCreators: tokenCreators,
        total: total
      }
    },
    [TOKEN_CREATOR_ADD]: (state: TokenCreatorState, { payload: { newTokenCreator }}: TokenCreatorAction) => {
      let tokenCreators = state.tokenCreators.slice();
      tokenCreators.unshift(newTokenCreator);
      return {
        ...state,
        tokenCreators
      }
    },
    [TOKEN_CREATOR_DELETE]: (state: TokenCreatorState, { payload: { tokenCreatorId }}: TokenCreatorAction) => {
      let tokenCreators = state.tokenCreators.slice();
      return {
        ...state,
        tokenCreators: tokenCreators.filter(item => item._id !== tokenCreatorId)
      }
    },
    [TOKEN_CREATOR_UPDATE]: (state: TokenCreatorState, { payload: { updatedTokenCreator }}: TokenCreatorAction) => {
      const tokenCreators = state.tokenCreators.map(item => {
        if (item._id === updatedTokenCreator._id) return updatedTokenCreator;
        else return item;
      });
      return {
        ...state,
        tokenCreators,
      };
    },
  },
  initialState,
);
