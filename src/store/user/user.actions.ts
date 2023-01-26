import { Dispatch } from 'redux'
import { showLoading, hideLoading } from 'react-redux-loading-bar';

import { USER_LOAD_ALL, USER_UPDATE } from '../action-types';
import errorHandler from '../error-handler';
import { userService } from '../../services';
import { IUserUpdateRequest } from '../../types';

export const getUsers = () => async (dispatch: Dispatch) => {
    try {
        dispatch(showLoading());
        const users = await userService.getAll();
        dispatch(hideLoading());

        dispatch({
            type: USER_LOAD_ALL,
            payload: {
                users
            },
        });
    } catch (error: any) {
        dispatch(hideLoading());
        errorHandler(error, USER_LOAD_ALL)
    }
}

export const updateUser = (id: string, payload: IUserUpdateRequest) => async (dispatch: Dispatch) => {
    try {
        await userService.updateUser(id, payload);

        dispatch({
            type: USER_UPDATE,
            payload: {
                updateUser: {
                    id,
                    payload
                }
            },
        });
    } catch (error: any) {
        errorHandler(error, USER_UPDATE)
    }
}
