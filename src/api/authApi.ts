import axiosClient from './axiosClient';
import { ApiSuccess, AuthResponse, User, UserRole } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    axiosClient.post<ApiSuccess<AuthResponse>>('/auth/register', payload).then((r) => r.data.data),

  login: (payload: LoginPayload) =>
    axiosClient.post<ApiSuccess<AuthResponse>>('/auth/login', payload).then((r) => r.data.data),

  me: () => axiosClient.get<ApiSuccess<User>>('/auth/me').then((r) => r.data.data),
};
