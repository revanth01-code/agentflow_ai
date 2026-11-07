import { io } from 'socket.io-client';

let socket;

export function getSocket() {
  // TODO: Create the socket.io client once against NEXT_PUBLIC_SOCKET_URL and reuse it.
  return socket;
}
