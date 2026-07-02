import axiosClient from './axiosClient';
import { ApiSuccess, Project } from '../types';

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  status?: 'active' | 'archived';
}

export const projectApi = {
  list: () => axiosClient.get<ApiSuccess<Project[]>>('/projects').then((r) => r.data.data),

  get: (projectId: string) =>
    axiosClient.get<ApiSuccess<Project>>(`/projects/${projectId}`).then((r) => r.data.data),

  create: (payload: CreateProjectPayload) =>
    axiosClient.post<ApiSuccess<Project>>('/projects', payload).then((r) => r.data.data),

  update: (projectId: string, payload: UpdateProjectPayload) =>
    axiosClient.patch<ApiSuccess<Project>>(`/projects/${projectId}`, payload).then((r) => r.data.data),

  remove: (projectId: string) => axiosClient.delete(`/projects/${projectId}`),

  addMember: (projectId: string, userId: string, role: 'manager' | 'member' = 'member') =>
    axiosClient
      .post<ApiSuccess<Project>>(`/projects/${projectId}/members`, { userId, role })
      .then((r) => r.data.data),
};
