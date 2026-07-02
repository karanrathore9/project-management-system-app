import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CreateTaskPayload, taskApi, UpdateTaskPayload } from '../../api/taskApi';
import { getErrorMessage } from '../../api/axiosClient';
import { Task, TaskStatus } from '../../types';

interface TasksState {
  items: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  currentProjectId: string | null;
}

const initialState: TasksState = {
  items: [],
  status: 'idle',
  error: null,
  currentProjectId: null,
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchForProject',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const tasks = await taskApi.list(projectId);
      return { projectId, tasks };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (
    { projectId, payload }: { projectId: string; payload: CreateTaskPayload },
    { rejectWithValue }
  ) => {
    try {
      return await taskApi.create(projectId, payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ taskId, payload }: { taskId: string; payload: UpdateTaskPayload }, { rejectWithValue }) => {
    try {
      return await taskApi.update(taskId, payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateStatus',
  async (
    { taskId, status, order }: { taskId: string; status: TaskStatus; order?: number },
    { rejectWithValue }
  ) => {
    try {
      return await taskApi.updateStatus(taskId, status, order);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteTask = createAsyncThunk('tasks/delete', async (taskId: string, { rejectWithValue }) => {
  try {
    await taskApi.remove(taskId);
    return taskId;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    taskAddedFromSocket: (state, action: PayloadAction<Task>) => {
      const exists = state.items.some((t) => t._id === action.payload._id);
      if (!exists) state.items.push(action.payload);
    },
    taskUpdatedFromSocket: (state, action: PayloadAction<Task>) => {
      const idx = state.items.findIndex((t) => t._id === action.payload._id);
      if (idx !== -1) state.items[idx] = action.payload;
      else state.items.push(action.payload);
    },
    taskDeletedFromSocket: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((t) => t._id !== action.payload);
    },
    clearTasks: (state) => {
      state.items = [];
      state.currentProjectId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.tasks;
        state.currentProjectId = action.payload.projectId;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to load tasks';
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        const exists = state.items.some((t) => t._id === action.payload._id);
        if (!exists) state.items.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to create task';
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        const idx = state.items.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action: PayloadAction<Task>) => {
        const idx = state.items.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to update task status';
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((t) => t._id !== action.payload);
      });
  },
});

export const { taskAddedFromSocket, taskUpdatedFromSocket, taskDeletedFromSocket, clearTasks } =
  tasksSlice.actions;
export default tasksSlice.reducer;
