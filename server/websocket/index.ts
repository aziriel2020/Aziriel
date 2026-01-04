/**
 * WEBSOCKET SERVER
 *
 * Real-time communication for:
 * - Spatial Worlds (position updates, voice chat)
 * - Agent Collaboration (live negotiations)
 * - Generative UI (streaming UI updates)
 * - Translation Sessions (real-time audio streams)
 */

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import spatialHandler from './handlers/spatial.handler';
import collaborationHandler from './handlers/collaboration.handler';
import genuiHandler from './handlers/genui.handler';
import translationHandler from './handlers/translation.handler';

export function setupWebSocket(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      // Verify JWT token (would integrate with auth service)
      // const user = await verifyToken(token);
      // socket.data.userId = user.id;

      // For now, allow connection
      socket.data.userId = socket.handshake.auth.userId || 'anonymous';

      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`[WebSocket] User connected: ${userId} (${socket.id})`);

    // Register namespace handlers
    spatialHandler(io, socket);
    collaborationHandler(io, socket);
    genuiHandler(io, socket);
    translationHandler(io, socket);

    // Global events
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    socket.on('disconnect', (reason) => {
      console.log(`[WebSocket] User disconnected: ${userId} (${reason})`);
    });

    socket.on('error', (error) => {
      console.error(`[WebSocket] Socket error:`, error);
    });
  });

  // Monitor connections
  setInterval(() => {
    const sockets = io.sockets.sockets.size;
    console.log(`[WebSocket] Active connections: ${sockets}`);
  }, 60000); // Every minute

  return io;
}

export default setupWebSocket;
