import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  clearTasks,
  taskAddedFromSocket,
  taskUpdatedFromSocket,
  taskDeletedFromSocket,
} from '../features/tasks/tasksSlice';
import { getSocket, joinProjectRoom, leaveProjectRoom } from '../socket/socket';
import { projectApi } from '../api/projectApi';
import { getErrorMessage } from '../api/axiosClient';
import { Project, ProjectMemberRole, Task, TaskStatus, User, UserBasic } from '../types';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import AddMemberModal from '../components/AddMemberModal';

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'todo', title: 'Todo' },
  { status: 'in-progress', title: 'In Progress' },
  { status: 'done', title: 'Done' },
];

import { getUserId } from '../utils/user';
import { isProjectManager } from '../utils/permissions';
import TaskColumn from '../components/TaskColumn';
import TaskFormModal from '../components/TaskFormModal';

function asUser(value: User | string | undefined | null): UserBasic | null {
  if (!value || typeof value === 'string') return null;
  const id = getUserId(value);
  if (!id) return null;
  return { id, name: value.name, email: value.email };
}

export default function TaskBoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  const { items: tasks, status, error } = useAppSelector((state) => state.tasks);
  const currentUserId = useAppSelector((state) => state.auth.user?.id ?? null);

  const [project, setProject] = useState<Project | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{ open: boolean; task: Task | null; status: TaskStatus }>({
    open: false,
    task: null,
    status: 'todo',
  });
  const [showAddMember, setShowAddMember] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!projectId) return;

    let active = true;
    setProjectError(null);

    projectApi
      .get(projectId)
      .then((p) => {
        if (active) setProject(p);
      })
      .catch((err) => {
        if (active) setProjectError(getErrorMessage(err));
      });

    dispatch(fetchTasks(projectId));
    joinProjectRoom(projectId).then((res) => {
      if (!res.ok) setProjectError(res.error || 'Could not join real-time room');
    });

    return () => {
      active = false;
      leaveProjectRoom(projectId);
      dispatch(clearTasks());
    };
  }, [projectId, dispatch]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onTaskCreated = ({ task }: { task: Task }) => {
      if (task.project === projectId) dispatch(taskAddedFromSocket(task));
    };
    const onTaskUpdated = ({ task }: { task: Task }) => {
      if (task.project === projectId) dispatch(taskUpdatedFromSocket(task));
    };
    const onTaskStatusChanged = ({ task }: { task: Task }) => {
      if (task.project === projectId) dispatch(taskUpdatedFromSocket(task));
    };
    const onTaskDeleted = ({ taskId }: { taskId: string }) => {
      dispatch(taskDeletedFromSocket(taskId));
    };
    
    const onProjectUpdated = ({ project: updated }: { project: Project }) => {
      if (updated._id === projectId) setProject(updated);
    };
    const onUserJoined = () => setOnlineCount((c) => c + 1);
    const onUserLeft = () => setOnlineCount((c) => Math.max(0, c - 1));

    socket.on('task:created', onTaskCreated);
    socket.on('task:updated', onTaskUpdated);
    socket.on('task:statusChanged', onTaskStatusChanged);
    socket.on('task:deleted', onTaskDeleted);
    socket.on('project:updated', onProjectUpdated);
    socket.on('presence:userJoined', onUserJoined);
    socket.on('presence:userLeft', onUserLeft);

    return () => {
      socket.off('task:created', onTaskCreated);
      socket.off('task:updated', onTaskUpdated);
      socket.off('task:statusChanged', onTaskStatusChanged);
      socket.off('task:deleted', onTaskDeleted);
      socket.off('project:updated', onProjectUpdated);
      socket.off('presence:userJoined', onUserJoined);
      socket.off('presence:userLeft', onUserLeft);
    };
  }, [projectId, dispatch]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = { todo: [], 'in-progress': [], done: [] };
    for (const task of tasks) {
      grouped[task.status].push(task);
    }
    for (const key of Object.keys(grouped) as TaskStatus[]) {
      grouped[key].sort((a, b) => a.order - b.order);
    }
    return grouped;
  }, [tasks]);

  const assignableUsers: UserBasic[] = useMemo(() => {
    if (!project) return [];
    const seen = new Set<string>();
    const users: UserBasic[] = [];
    const owner = asUser(project.owner);
    if (owner && !seen.has(owner.id)) {
      seen.add(owner.id);
      users.push(owner);
    }
    for (const member of project.members) {
      const u = asUser(member.user);
      if (u && !seen.has(u.id)) {
        seen.add(u.id);
        users.push(u);
      }
    }
    return users;
  }, [project]);

  
  const canEditTasks = useMemo(
    () => isProjectManager(project, currentUserId),
    [project, currentUserId]
  );

  const handleDropTask = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;
    const newOrder = tasksByStatus[newStatus].length;
    dispatch(updateTaskStatus({ taskId, status: newStatus, order: newOrder }));
  };

  const handleAddTask = (statusForColumn: TaskStatus) => {
    setModalState({ open: true, task: null, status: statusForColumn });
  };

  const handleEditTask = (task: Task) => {
    setModalState({ open: true, task, status: task.status });
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Delete this task?')) {
      dispatch(deleteTask(taskId));
    }
  };

  const handleModalSubmit = async (values: {
    title: string;
    description: string;
    priority: Task['priority'];
    status: TaskStatus;
    dueDate: string;
    assignee: string | null;
  }) => {
    if (!projectId) return;
    const dueDate = values.dueDate ? new Date(values.dueDate).toISOString() : null;

    if (modalState.task) {
      await dispatch(
        updateTask({
          taskId: modalState.task._id,
          payload: {
            title: values.title,
            description: values.description,
            priority: values.priority,
            dueDate,
            assignee: values.assignee,
          },
        })
      );
    } else {
      await dispatch(
        createTask({
          projectId,
          payload: {
            title: values.title,
            description: values.description,
            priority: values.priority,
            status: values.status,
            dueDate,
            assignee: values.assignee,
          },
        })
      );
    }
    setModalState({ open: false, task: null, status: 'todo' });
  };

  const handleAddMember = async (userId: string, role: ProjectMemberRole) => {
    if (!projectId) return;
    setMemberError(null);
    try {
      const updated = await projectApi.addMember(projectId, userId, role);
      setProject(updated);
      setShowAddMember(false);
    } catch (err) {
      setMemberError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <Navbar />
      <main className="page">
        <div className="page-header">
          <div>
            <Link to="/projects" className="back-link">
              ← Projects
            </Link>
            <h1>{project?.name || 'Task Board'}</h1>
            {project?.description && <p className="muted">{project.description}</p>}
          </div>
          {onlineCount > 0 && (
            <span className="badge badge-active">
              {onlineCount} other{onlineCount === 1 ? '' : 's'} online
            </span>
          )}
        </div>

        <ErrorMessage message={projectError || error} />

        {project && (
          <div className="members-panel">
            <div className="members-panel-header">
              <h3>Members</h3>
              <button className="link-btn" onClick={() => setShowAddMember(true)}>
                + Add member
              </button>
            </div>
            <div className="members-list">
              {assignableUsers.length === 0 && <span className="muted">No members yet</span>}
              {assignableUsers.map((u) => (
                <span key={u.id} className="member-chip">
                  {u.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {status === 'loading' && tasks.length === 0 ? (
          <Loader label="Loading tasks…" />
        ) : (
          <div className="board">
            {COLUMNS.map((col) => (
              <TaskColumn
                key={col.status}
                status={col.status}
                title={col.title}
                tasks={tasksByStatus[col.status]}
                onDropTask={handleDropTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onAddTask={handleAddTask}
                canEdit={canEditTasks}
              />
            ))}
          </div>
        )}
      </main>

      {modalState.open && (
        <TaskFormModal
          initial={modalState.task}
          assignableUsers={assignableUsers}
          onClose={() => setModalState({ open: false, task: null, status: 'todo' })}
          onSubmit={handleModalSubmit}
        />
      )}

      {showAddMember && (
        <AddMemberModal
          submitError={memberError}
          onClose={() => {
            setShowAddMember(false);
            setMemberError(null);
          }}
          onSubmit={handleAddMember}
        />
      )}
    </div>
  );
}