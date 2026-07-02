import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { register, clearAuthError } from '../features/auth/authSlice';
import { validateRegisterForm, isValid } from '../utils/validators';
import ErrorMessage from '../components/ErrorMessage';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  const errors = validateRegisterForm({ name, email, password });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    dispatch(clearAuthError());
    if (!isValid(errors)) return;
    const result = await dispatch(register({ name: name.trim(), email: email.trim(), password }));
    if (register.fulfilled.match(result)) {
      navigate('/projects');
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Create account</h1>
        <p className="muted">Internal Project Management Tool</p>
        <ErrorMessage message={error} />
        <label className="field">
          <span>Name</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          {touched && errors.name && <span className="field-error">{errors.name}</span>}
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {touched && errors.email && <span className="field-error">{errors.email}</span>}
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {touched && errors.password && <span className="field-error">{errors.password}</span>}
        </label>
        <button type="submit" className="btn btn-primary btn-full" disabled={status === 'loading'}>
          {status === 'loading' ? 'Creating account…' : 'Register'}
        </button>
        <p className="muted auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
