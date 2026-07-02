import { FormEvent, useState } from 'react';
import { validateProjectForm, isValid } from '../utils/validators';

interface Props {
  onClose: () => void;
  onSubmit: (name: string, description: string) => Promise<void> | void;
}

export default function CreateProjectModal({ onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const errors = validateProjectForm({ name, description });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid(errors)) return;
    setSubmitting(true);
    await onSubmit(name.trim(), description.trim());
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>New project</h2>
        <form onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Website Redesign"
              autoFocus
            />
            {touched && errors.name && <span className="field-error">{errors.name}</span>}
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
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
