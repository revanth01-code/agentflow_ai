import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (socket) return socket;
  if (typeof window === 'undefined') return null;
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5050';
  socket = io(socketUrl, {
    transports: ['websocket', 'polling'],
    autoConnect: true
  });
  return socket;
}
