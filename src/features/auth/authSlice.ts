import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi, LoginPayload, RegisterPayload } from '../../api/authApi';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, getErrorMessage } from '../../api/axiosClient';
import { connectSocket, disconnectSocket } from '../../socket/socket';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
  initialized: false,
};

export const login = createAsyncThunk('auth/login', async (payload: LoginPayload, { rejectWithValue }) => {
  try {
    const data = await authApi.login(payload);
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    connectSocket();
    return data.user;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const register = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const data = await authApi.register(payload);
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      connectSocket();
      return data.user;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// Runs once on app startup to restore the session if a token is saved.
export const loadCurrentUser = createAsyncThunk('auth/loadCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return null;
    const user = await authApi.me();
    connectSocket();
    return user;
  } catch (err) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    return rejectWithValue(getErrorMessage(err));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      disconnectSocket();
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Registration failed';
      })
      .addCase(loadCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadCurrentUser.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.status = 'idle';
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(loadCurrentUser.rejected, (state) => {
        state.status = 'idle';
        state.user = null;
        state.initialized = true;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
