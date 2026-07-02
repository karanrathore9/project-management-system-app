import { useState } from 'react';
import { Task, TaskStatus } from '../types';
import TaskCard from './TaskCard';

interface Props {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onDropTask: (taskId: string, status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (status: TaskStatus) => void;
}

export default function TaskColumn({
  status,
  title,
  tasks,
  onDropTask,
  onEditTask,
  onDeleteTask,
  onAddTask,
}: Props) {
  const [isOver, setIsOver] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) onDropTask(taskId, status);
  };

  return (
    <div
      className={`task-column ${isOver ? 'task-column-over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
    >
      <div className="task-column-header">
        <h3>
          {title} <span className="muted">({tasks.length})</span>
        </h3>
        <button className="link-btn" onClick={() => onAddTask(status)}>
          + Add
        </button>
      </div>
      <div className="task-column-body">
        {tasks.length === 0 && <p className="muted empty-hint">No tasks</p>}
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} onEdit={onEditTask} onDelete={onDeleteTask} />
        ))}
      </div>
    </div>
  );
}
