import { Link } from 'react-router-dom';
import { Project, User } from '../types';
import { getUserId } from '../utils/user';

interface Props {
  project: Project;
  currentUserId: string | undefined;
  onDelete: (id: string) => void;
}

export default function ProjectCard({ project, currentUserId, onDelete }: Props) {
  const owner = project.owner as User;
  const isOwner = getUserId(project.owner) === currentUserId;

  return (
    <div className="card project-card">
      <div className="project-card-header">
        <Link to={`/projects/${project._id}`} className="project-card-title">
          {project.name}
        </Link>
        <span className={`badge badge-${project.status}`}>{project.status}</span>
      </div>
      <p className="project-card-desc">{project.description || 'No description'}</p>
      <div className="project-card-footer">
        <span className="muted">
          Owner: {typeof project.owner === 'object' ? owner.name : 'Unknown'} · {project.members.length}{' '}
          member{project.members.length === 1 ? '' : 's'}
        </span>
        {isOwner && (
          <button className="btn btn-danger btn-small" onClick={() => onDelete(project._id)}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}