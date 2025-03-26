import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initializeSocket = (url: string): Socket => {
  if (!socket) {
    socket = io(url);
  }
  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};