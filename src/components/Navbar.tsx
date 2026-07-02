import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <header className="navbar">
      <Link to="/projects" className="navbar-brand">
        PM Tool
      </Link>
      {user && (
        <div className="navbar-right">
          <span className="navbar-user">
            {user.name} <span className="badge">{user.role}</span>
          </span>
          <button className="btn btn-secondary btn-small" onClick={() => dispatch(logout())}>
            Log out
          </button>
        </div>
      )}
    </header>
  );
}
