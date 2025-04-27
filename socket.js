import { Server } from 'socket.io';

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Or restrict to your frontend origin
      methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    console.log('🟢 A user connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('🔴 User disconnected:', socket.id);
    });
  });
};

const emitToAdmins = (event, data) => {
  if (io) {
    io.emit(event, data); // Broadcast to all connected admins (or filter later)
  }
};

// Use export for ES modules
export { initSocket, emitToAdmins };
