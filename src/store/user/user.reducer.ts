import { Action, Reducer } from 'redux';
import { handleActions } from 'redux-actions';

import { IUser, IUserUpdateRequest } from '../../types';
import { USER_LOAD_ALL, USER_UPDATE } from '../action-types';

export interface UserState {
  users: IUser[],
}

interface UserAction extends Action {
  payload: {
    users: IUser[],
    updateUser: {
      id: string,
      payload: IUserUpdateRequest
    },
  }
}

const initialState: UserState = {
  users: [],
}

export const userReducer: Reducer<UserState, UserAction> = handleActions(
  {
    [USER_LOAD_ALL]: (state: UserState, { payload: { users }}: UserAction) => ({
      ...state,
      users,
    }),
    [USER_UPDATE]: (state: UserState, { payload: { updateUser }}: UserAction) => {
      const users = state.users.map(item => {
        if (item._id === updateUser.id) {
          return {
            ...item,
            ...updateUser.payload
          }
        } else {
          return item;
        }
      });

      return {
        ...state,
        users,
      };
    }
  },
  initialState,
);
