import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const ACCESS_TOKEN_KEY = 'pm_access_token';
export const REFRESH_TOKEN_KEY = 'pm_refresh_token';

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

function resolveQueue() {
  pendingQueue.forEach((cb) => cb());
  pendingQueue = [];
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/auth/')) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      await new Promise<void>((resolve) => pendingQueue.push(resolve));
      const newToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (originalRequest.headers && newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return axiosClient(originalRequest);
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = data.data;
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
      isRefreshing = false;
      resolveQueue();

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }
      return axiosClient(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      resolveQueue();
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);

export default axiosClient;

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || err.message || 'Something went wrong';
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}
