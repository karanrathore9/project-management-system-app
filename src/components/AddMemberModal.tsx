import { FormEvent, useState } from 'react';
import { ProjectMemberRole, UserBasic } from '../types';
import { validateAddMemberForm, isValid } from '../utils/validators';
import UserSearchSelect from './UserSearchSelect';
import ErrorMessage from './ErrorMessage';

interface Props {
  onClose: () => void;
  onSubmit: (userId: string, role: ProjectMemberRole) => Promise<void> | void;
  submitError: string | null;
}

export default function AddMemberModal({ onClose, onSubmit, submitError }: Props) {
  const [user, setUser] = useState<UserBasic | null>(null);
  const [role, setRole] = useState<ProjectMemberRole>('member');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const errors = validateAddMemberForm({ userId: user?.id ?? '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid(errors) && user) return;
    if (!user) return;
    setSubmitting(true);
    await onSubmit(user.id, role);
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add member</h2>
        <ErrorMessage message={submitError} />
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>User</span>
            <UserSearchSelect selected={user} onSelect={setUser} />
            {touched && errors.userId && <span className="field-error">{errors.userId}</span>}
          </label>
          <label className="field">
            <span>Role</span>
            <select value={role} onChange={(e) => setRole(e.target.value as ProjectMemberRole)}>
              <option value="member">Member</option>
              <option value="manager">Manager</option>
            </select>
          </label>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Adding…' : 'Add member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
