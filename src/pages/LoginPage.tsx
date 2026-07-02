import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { login, clearAuthError } from '../features/auth/authSlice';
import { validateLoginForm, isValid } from '../utils/validators';
import ErrorMessage from '../components/ErrorMessage';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  const errors = validateLoginForm({ email, password });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    dispatch(clearAuthError());
    if (!isValid(errors)) return;
    const result = await dispatch(login({ email: email.trim(), password }));
    if (login.fulfilled.match(result)) {
      navigate('/projects');
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Log in</h1>
        <p className="muted">Internal Project Management Tool</p>
        <ErrorMessage message={error} />
        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          {touched && errors.email && <span className="field-error">{errors.email}</span>}
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {touched && errors.password && <span className="field-error">{errors.password}</span>}
        </label>
        <button type="submit" className="btn btn-primary btn-full" disabled={status === 'loading'}>
          {status === 'loading' ? 'Logging in…' : 'Log in'}
        </button>
        <p className="muted auth-switch">
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
