import { Dispatch } from 'redux'
import { notification } from 'antd';
import { showLoading, hideLoading } from 'react-redux-loading-bar';

import { AUTH_REGISTER, AUTH_LOGIN, AUTH_LOGOUT, TIMER_INCREASE, AUTH_2FA_VERIFY, AUTH_2FA_ACTIVATE, AUTH_2FA_DEACTIVATE, AUTH_ME } from '../action-types';
import errorHandler from '../error-handler';
import { authService } from '../../services';
import { EUserStatus, IUser, I2FASecret } from '../../types';
import { showNotification } from "../../shared/helpers";

const setLocalStorageForAUth = (user: IUser) => {
  localStorage.setItem('user_id', String(user._id));
  localStorage.setItem('email', user.email);
  localStorage.setItem('role', user.role);
  localStorage.setItem('username', user.username);
  localStorage.setItem('status', user.status);
}

export const register = (username: string, email: string, password: string) => async (dispatch: Dispatch) => {
  try {
    dispatch(showLoading());
    await authService.register({username, email, password});
    dispatch(hideLoading());

    notification.open({
        message: "You've signed up successfully!",
        description: "You'll be able to log in once the Administrator approves your account.",
    });
  } catch (error: any) {
    dispatch(hideLoading());
    notification.open({
      message: 'Error',
      description: error.message,
    });
    errorHandler(error, AUTH_REGISTER)
  }
}

export const login = (username: string, password: string) => async (dispatch: Dispatch) => {
  try {
    localStorage.clear();
    dispatch(showLoading());
    const tokens = await authService.login({username, password});
    localStorage.setItem('accessToken', tokens.access_token);
    const user = tokens.user;
    dispatch(hideLoading());

    if (user.status === EUserStatus.TBA) {
      localStorage.clear();
      notification.open({
        message: 'Failed',
        description: 'Your account should be approved by admin!',
      });
      return;
    } else if (user.status === EUserStatus.BLOCKED) {
      localStorage.clear();
      notification.open({
        message: 'Failed',
        description: 'Your account is blocked!',
      });
      return;
    } else if (user.totpRequired) {
      window.location.href = '/auth/2fa-authentication';
    } else {
      loginSuccess(tokens, dispatch);
    }
  } catch (error: any) {
    dispatch(hideLoading());
    errorHandler(error, AUTH_LOGIN)
  }
}

export const verify2FA = (userToken: string) => async (dispatch: Dispatch) => {
  try {
    const tokens = await authService.verify2FA({userToken});
    localStorage.removeItem('totpRequest');
    localStorage.setItem('totpRequest', '1');
    dispatch({ type: AUTH_2FA_ACTIVATE });
    loginSuccess(tokens, dispatch);
  } catch (error: any) {
    showNotification("Verification code is not valid", "error", "topRight");
    errorHandler(error, AUTH_2FA_VERIFY)
  }
}

export const get2FASecret = async (dispatch: Dispatch): Promise<I2FASecret | undefined> => {
  try {
    const res = await authService.get2FASecret();
    return res;
  } catch (error: any) {
    errorHandler(error, AUTH_2FA_ACTIVATE)
  }
}

export const deactive2FASecret = (userToken: string) => async (dispatch: Dispatch) => {
  try {
    await authService.deactive2FASecret({userToken});
    localStorage.removeItem('totpRequest');
    dispatch({type: AUTH_2FA_DEACTIVATE});
  } catch (error: any) {
    errorHandler(error, AUTH_2FA_DEACTIVATE)
  }
}

export const logout = (dispatch: Dispatch) => {
    localStorage.clear();

    dispatch({ type: AUTH_LOGOUT })
};

export const increaseTime = (dispatch: Dispatch) => {

  dispatch({ type: TIMER_INCREASE })
};

const loginSuccess = (tokens: {access_token: string, user: IUser}, dispatch: Dispatch) => {
  setLocalStorageForAUth(tokens.user);

  dispatch({
      type: AUTH_LOGIN,
      payload: {
          user: tokens.user
      },
  });
}

export const me = () => async (dispatch: Dispatch) => {
  try {
    const user = await authService.me();

    dispatch({
      type: AUTH_ME,
      payload: {
        user
      },
    });
  } catch (error: any) {
    errorHandler(error, AUTH_2FA_ACTIVATE)
  }
}
