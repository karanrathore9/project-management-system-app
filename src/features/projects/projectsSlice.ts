import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CreateProjectPayload, projectApi } from '../../api/projectApi';
import { getErrorMessage } from '../../api/axiosClient';
import { Project } from '../../types';

interface ProjectsState {
  items: Project[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProjectsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await projectApi.list();
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const createProject = createAsyncThunk(
  'projects/create',
  async (payload: CreateProjectPayload, { rejectWithValue }) => {
    try {
      return await projectApi.create(payload);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (projectId: string, { rejectWithValue }) => {
    try {
      await projectApi.remove(projectId);
      return projectId;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    projectUpdatedFromSocket: (state, action: PayloadAction<Project>) => {
      const idx = state.items.findIndex((p) => p._id === action.payload._id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    projectDeletedFromSocket: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to load projects';
      })
      .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.items.unshift(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to create project';
      })
      .addCase(deleteProject.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      });
  },
});

export const { projectUpdatedFromSocket, projectDeletedFromSocket } = projectsSlice.actions;
export default projectsSlice.reducer;
