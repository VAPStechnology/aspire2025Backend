import { Server } from 'socket.io';

let io; // Declare a variable to hold the Socket.IO instance

// Initialize socket.io and set it up
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // You can modify the origin as per your requirements
      methods: ['GET', 'POST']
    }
  });
};

// Broadcast message to all connected clients
export const broadcast = (message) => {
  if (io) {
    io.emit('message', message); // Broadcasting to all connected clients
  }
};
