import { Dispatch } from 'redux'
import { hideLoading } from 'react-redux-loading-bar';

import {
  TOKEN_CREATOR_ADD,
  TOKEN_CREATOR_DELETE,
  TOKEN_CREATOR_LOAD_ALL,
  // TOKEN_CREATOR_RESPONSE_WAITING,
  TOKEN_CREATOR_SEARCH,
  TOKEN_CREATOR_UPDATE
} from '../action-types';
import errorHandler from '../error-handler';
import { tokenService } from '../../services';
import { ITokenCreateRequest, TokenCreatorFilter } from '../../types';
import { showNotification } from "../../shared/helpers";

export const searchTokenCreators = (filter: TokenCreatorFilter) => async (dispatch: Dispatch) => {
  try {
      const res = await tokenService.searchTokenCreators(filter);
      dispatch({
        type: TOKEN_CREATOR_SEARCH,
        payload: {
          tokenCreators: res.data ? res.data : [],
          total: res.total
        },
      });
  } catch (error: any) {
    errorHandler(error, TOKEN_CREATOR_SEARCH)
  }
}

export const getTokenCreators = () => async (dispatch: Dispatch) => {
  try {
    const tokenCreators = await tokenService.getTokenCreators();
    dispatch({
        type: TOKEN_CREATOR_LOAD_ALL,
        payload: {
          tokenCreators: tokenCreators.slice()
        },
    });
  } catch (error: any) {
    errorHandler(error, TOKEN_CREATOR_LOAD_ALL)
  }
}

export const deleteTokenCreator = (tokenCreatorId: string) => async (dispatch: Dispatch) => {
  try {
      await tokenService.deleteTokenCreator(tokenCreatorId);
      dispatch({
          type: TOKEN_CREATOR_DELETE,
          payload: {
            tokenCreatorId,
          },
      });
  } catch (error: any) {
      errorHandler(error, TOKEN_CREATOR_DELETE)
  }
}

export const addTokenCreator = (payload: ITokenCreateRequest) => async (dispatch: Dispatch) => {
  try {
    const newTokenCreator = await tokenService.addTokenCreator(payload);
    showNotification("Token bot is created successfully", 'success', 'topRight');

    dispatch({
      type: TOKEN_CREATOR_ADD,
      payload: {
        newTokenCreator
      },
    });
  } catch (error: any) {
    errorHandler(error, TOKEN_CREATOR_ADD);
  }
}

export const updateTokenCreator = (id: string, payload: ITokenCreateRequest) => async (dispatch: Dispatch) => {
  try {
      const updatedTokenCreator = await tokenService.updateTokenCreator(id, payload);
      dispatch({
          type: TOKEN_CREATOR_UPDATE,
          payload: {
            updatedTokenCreator
          },
      });
  } catch (error: any) {
      dispatch(hideLoading());
      errorHandler(error, TOKEN_CREATOR_UPDATE)
  }
}
