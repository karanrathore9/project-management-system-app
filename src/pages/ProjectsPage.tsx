import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { createProject, deleteProject, fetchProjects } from '../features/projects/projectsSlice';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.projects);
  const user = useAppSelector((state) => state.auth.user);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleCreate = async (name: string, description: string) => {
    const result = await dispatch(createProject({ name, description }));
    if (createProject.fulfilled.match(result)) {
      setShowModal(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this project? This cannot be undone.')) {
      dispatch(deleteProject(id));
    }
  };

  return (
    <div>
      <Navbar />
      <main className="page">
        <div className="page-header">
          <h1>Projects</h1>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New project
          </button>
        </div>

        <ErrorMessage message={error} />

        {status === 'loading' && items.length === 0 ? (
          <Loader label="Loading projects…" />
        ) : items.length === 0 ? (
          <p className="muted">No projects yet. Create your first one to get started.</p>
        ) : (
          <div className="project-grid">
            {items.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                currentUserId={user?.id}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && <CreateProjectModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />}
    </div>
  );
}
