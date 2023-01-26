import { Action, Reducer } from 'redux';
import { handleActions } from 'redux-actions';

import { IUser, EUserRole, UserRoleStrings, EUserStatus, UserStatusStrings } from '../../types';
import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_REGISTER, TIMER_INCREASE, AUTH_2FA_VERIFY, AUTH_2FA_DEACTIVATE, AUTH_ME } from '../action-types';

export interface AuthState {
  user: IUser,
  loggedIn: boolean,
  elapsedTime: number,
}

interface AuthAction extends Action {
  payload: {
    user: IUser,
    loggedIn: boolean,
    elapsedTime: number
  }
}

const role = localStorage.getItem('role');
const status = localStorage.getItem('status');

const initialState: AuthState = {
  user: {
    username: localStorage.getItem('username') || 'admin',
    email: localStorage.getItem('email') || 'admin@admin.com',
    role: role ? EUserRole[role as UserRoleStrings] : EUserRole.TRADER,
    status: status ? EUserStatus[status as UserStatusStrings] : EUserStatus.TBA,
    totpRequired: localStorage.getItem('totpRequest') === '1',
    online: true
  },
  loggedIn: localStorage.getItem('user_id') ? true : false,
  elapsedTime: 0,
}

export const authReducer: Reducer<AuthState, AuthAction> = handleActions(
  {
    [AUTH_REGISTER]: (state: AuthState, { payload: { user }}: AuthAction) => ({
      ...state,
      user,
      loggedIn: true
    }),
    [AUTH_LOGIN]: (state: AuthState, { payload: { user }}: AuthAction) => ({
      ...state,
      user,
      loggedIn: true
    }),
    [AUTH_2FA_VERIFY]: (state: AuthState) => {
      const user = {
        ...state.user,
        totpRequired: true
      };

      return {
        ...state,
        user
      }
    },
    [AUTH_2FA_DEACTIVATE]: (state: AuthState) => {
      const user = {
        ...state.user,
        totpRequired: false
      };

      return {
        ...state,
        user
      }
    },
    [AUTH_LOGOUT]: () => ({
      user: {
        username: '',
        email: '',
        role: EUserRole.TRADER,
        status: EUserStatus.TBA,
        online: false
      },
      loggedIn: false,
      elapsedTime: 0,
    }),
    [TIMER_INCREASE]: (state: AuthState) => ({
      ...state,
      elapsedTime: state.elapsedTime + 1,
    }),
    [AUTH_ME]: (state: AuthState, { payload: { user }}: AuthAction) => ({
      ...state
    }),
  },
  initialState,
);
