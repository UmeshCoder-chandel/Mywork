import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace('/api', '')

let socket = null

export const initSocket = (token) => {
  if (socket) return socket
  socket = io(SOCKET_URL, { autoConnect: false, auth: { token }, transports: ['websocket'] })
  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export default { initSocket, getSocket, disconnectSocket }

