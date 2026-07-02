import { FormEvent, useState } from 'react';
import { Task, TaskPriority, TaskStatus, UserBasic } from '../types';

import { isValid, validateTaskForm } from '../utils/validators';
import { getUserId } from '../utils/user';

interface Props {
  initial?: Task | null;
  assignableUsers: UserBasic[];
  onClose: () => void;
  onSubmit: (values: {
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string;
    assignee: string | null;
  }) => Promise<void> | void;
}

export default function TaskFormModal({ initial, assignableUsers, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? 'medium');
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'todo');
  const [dueDate, setDueDate] = useState(initial?.dueDate ? initial.dueDate.slice(0, 10) : '');
  const [assigneeId, setAssigneeId] = useState<string>(getUserId(initial?.assignee) ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const isEdit = Boolean(initial);
  const errors = validateTaskForm({ title, description, dueDate, isEdit });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid(errors)) return;
    setSubmitting(true);
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      dueDate,
      assignee: assigneeId || null,
    });
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? 'Edit task' : 'New task'}</h2>
        <form onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span>Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Set up CI pipeline"
              autoFocus
            />
            {touched && errors.title && <span className="field-error">{errors.title}</span>}
          </label>
          <label className="field">
            <span>Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              rows={3}
            />
            {touched && errors.description && <span className="field-error">{errors.description}</span>}
          </label>
          <label className="field">
            <span>Assignee</span>
            <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
              <option value="">Unassigned</option>
              {assignableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            {assignableUsers.length === 0 && (
              <span className="field-hint">No members on this project yet — add one first.</span>
            )}
          </label>
          <div className="field-row">
            <label className="field">
              <span>Priority</span>
              <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            {!isEdit && (
              <label className="field">
                <span>Status</span>
                <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </label>
            )}
            <label className="field">
              <span>Due date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={isEdit ? undefined : new Date().toISOString().slice(0, 10)}
              />
              {touched && errors.dueDate && <span className="field-error">{errors.dueDate}</span>}
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}