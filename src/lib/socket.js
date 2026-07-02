import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Connect manually when needed
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const joinMatchRoom = (matchId) => {
  socket.emit('join_match', matchId);
};

export const leaveMatchRoom = (matchId) => {
  socket.emit('leave_match', matchId);
};
