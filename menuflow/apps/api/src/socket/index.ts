import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    socket.on('join:restaurant', (restaurantId: string) => {
      socket.join(`restaurant:${restaurantId}`);
    });

    socket.on('join:customer', (customerId: string) => {
      socket.join(`customer:${customerId}`);
    });

    socket.on('join:kitchen', (restaurantId: string) => {
      socket.join(`kitchen:${restaurantId}`);
    });

    socket.on('disconnect', () => {
      // cleanup handled by socket.io
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}
