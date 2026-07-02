import { io, Socket } from 'socket.io-client';
import { ACCESS_TOKEN_KEY } from '../api/axiosClient';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (socket && socket.connected) return socket;

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  socket = io(SOCKET_URL, {
    auth: { token },
    autoConnect: true,
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinProjectRoom(projectId: string): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    const s = connectSocket();
    if (s.connected) {
      s.emit('project:join', projectId, resolve);
    } else {
      s.once('connect', () => s.emit('project:join', projectId, resolve));
    }
  });
}

export function leaveProjectRoom(projectId: string): void {
  const s = getSocket();
  s?.emit('project:leave', projectId);
}
