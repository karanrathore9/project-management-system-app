export type UserRole = 'admin' | 'manager' | 'member';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export type ProjectMemberRole = 'manager' | 'member';

export interface ProjectMember {
  user: User | string;
  role: ProjectMemberRole;
}

export type ProjectStatus = 'active' | 'archived';

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: User | string;
  members: ProjectMember[];
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  _id: string;
  title: string;
  description: string;
  project: string;
  status: TaskStatus;
  assignee: User | null;
  createdBy: User | string;
  priority: TaskPriority;
  order: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserBasic {
  id: string;
  name: string;
  email: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: Array<{ field?: string; message: string }>;
}