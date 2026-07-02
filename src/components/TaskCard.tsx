import { Task } from '../types';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  canEdit: boolean;
}

const priorityLabel: Record<Task['priority'], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export default function TaskCard({ task, onEdit, onDelete, canEdit }: Props) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', task._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="task-card" draggable onDragStart={handleDragStart}>
      <div className="task-card-top">
        <span className={`priority-dot priority-${task.priority}`} title={priorityLabel[task.priority]} />
        <h4>{task.title}</h4>
      </div>
      {task.description && <p className="task-card-desc">{task.description}</p>}
      <div className="task-card-meta">
        <span className="muted">{task.assignee ? task.assignee.name : 'Unassigned'}</span>
        {task.dueDate && <span className="muted">{new Date(task.dueDate).toLocaleDateString()}</span>}
      </div>
      <div className="task-card-actions">
        {canEdit && (
          <button className="link-btn" onClick={() => onEdit(task)}>
            Edit
          </button>
        )}
        <button className="link-btn link-btn-danger" onClick={() => onDelete(task._id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
