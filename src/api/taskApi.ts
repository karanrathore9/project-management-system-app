import axiosClient from './axiosClient';
import { ApiSuccess, Task, TaskPriority, TaskStatus } from '../types';

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  assignee?: string | null;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  assignee?: string | null;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export const taskApi = {
  list: (projectId: string) =>
    axiosClient.get<ApiSuccess<Task[]>>(`/projects/${projectId}/tasks`).then((r) => r.data.data),

  create: (projectId: string, payload: CreateTaskPayload) =>
    axiosClient
      .post<ApiSuccess<Task>>(`/projects/${projectId}/tasks`, payload)
      .then((r) => r.data.data),

  update: (taskId: string, payload: UpdateTaskPayload) =>
    axiosClient.patch<ApiSuccess<Task>>(`/tasks/${taskId}`, payload).then((r) => r.data.data),

  updateStatus: (taskId: string, status: TaskStatus, order?: number) =>
    axiosClient
      .patch<ApiSuccess<Task>>(`/tasks/${taskId}/status`, { status, order })
      .then((r) => r.data.data),

  remove: (taskId: string) => axiosClient.delete(`/tasks/${taskId}`),
};
