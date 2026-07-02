import axiosClient from './axiosClient';
import { ApiSuccess, UserBasic } from '../types';

export const userApi = {
  search: (query: string) =>
    axiosClient
      .get<ApiSuccess<UserBasic[]>>('/users/search', { params: { q: query } })
      .then((r) => r.data.data),
};
