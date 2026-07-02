import { Project } from '../types';
import { getUserId } from './user';

// Mirrors backend project.service.ts#isManager:
// the project owner, or any member explicitly added with role 'manager',
// can edit task details. Everyone else can still move tasks between columns.
export function isProjectManager(project: Project | null, currentUserId: string | null | undefined): boolean {
  if (!project || !currentUserId) return false;

  const ownerId = getUserId(project.owner);
  if (ownerId === currentUserId) return true;

  return project.members.some((m) => getUserId(m.user) === currentUserId && m.role === 'manager');
}
