import { http } from '../services/api'
import { IUser, IUserUpdateRequest } from '../types/user.types'

class UserService {
  async getAll () {
    const res = await http.get<IUser[]>('/user/all');
    return res.data;
  }

  async updateUser (userId: string, payload: IUserUpdateRequest) {
    const res = await http.put<IUser>(`/user/${userId}`, payload);
    return res.data;
  }
}

export const userService = new UserService()
