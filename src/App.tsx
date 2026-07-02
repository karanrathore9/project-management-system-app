import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { loadCurrentUser } from './features/auth/authSlice';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProjectsPage from './pages/ProjectsPage';
import TaskBoardPage from './pages/TaskBoardPage';

export default function App() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(loadCurrentUser());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/projects" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/projects" replace /> : <RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<TaskBoardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}
