/**
 * SPATIAL WORLDS WEBSOCKET HANDLER
 *
 * Real-time events for 3D spatial worlds:
 * - Position/rotation updates
 * - Voice chat
 * - Participant join/leave
 * - Object interactions
 */

import { Server, Socket } from 'socket.io';
import { SpatialWorldsService } from '../../services/nexus/spatial-worlds.service';

export default function spatialHandler(io: Server, socket: Socket) {
  // Join spatial world
  socket.on('spatial:join', async (data: { worldId: string; userId: string }) => {
    try {
      const { worldId, userId } = data;

      // Join Socket.IO room
      await socket.join(`world:${worldId}`);

      // Update database
      const result = await SpatialWorldsService.joinWorld({ worldId, userId });

      // Broadcast to other participants
      socket.to(`world:${worldId}`).emit('spatial:user-joined', {
        userId,
        avatar: result.avatar,
        timestamp: new Date(),
      });

      // Send world state to new participant
      socket.emit('spatial:joined', {
        world: result.world,
        avatar: result.avatar,
      });

      console.log(`[Spatial] ${userId} joined world ${worldId}`);
    } catch (error: any) {
      socket.emit('spatial:error', { error: error.message });
    }
  });

  // Leave spatial world
  socket.on('spatial:leave', async (data: { worldId: string; userId: string }) => {
    try {
      const { worldId, userId } = data;

      await SpatialWorldsService.leaveWorld({ worldId, userId });

      socket.leave(`world:${worldId}`);

      socket.to(`world:${worldId}`).emit('spatial:user-left', {
        userId,
        timestamp: new Date(),
      });

      console.log(`[Spatial] ${userId} left world ${worldId}`);
    } catch (error: any) {
      socket.emit('spatial:error', { error: error.message });
    }
  });

  // Position update (high-frequency)
  socket.on('spatial:position', async (data: {
    worldId: string;
    userId: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
  }) => {
    try {
      const { worldId, userId, position, rotation } = data;

      // Update in database (debounced in production)
      await SpatialWorldsService.updatePosition({
        worldId,
        userId,
        position,
        rotation,
      });

      // Broadcast to other participants (exclude sender)
      socket.to(`world:${worldId}`).emit('spatial:position-update', {
        userId,
        position,
        rotation,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      // Silently fail for high-frequency updates
    }
  });

  // Voice chat (WebRTC signaling)
  socket.on('spatial:voice-offer', (data: {
    worldId: string;
    fromUserId: string;
    toUserId: string;
    offer: any;
  }) => {
    socket.to(`world:${data.worldId}`).emit('spatial:voice-offer', data);
  });

  socket.on('spatial:voice-answer', (data: {
    worldId: string;
    fromUserId: string;
    toUserId: string;
    answer: any;
  }) => {
    socket.to(`world:${data.worldId}`).emit('spatial:voice-answer', data);
  });

  socket.on('spatial:voice-ice-candidate', (data: {
    worldId: string;
    fromUserId: string;
    toUserId: string;
    candidate: any;
  }) => {
    socket.to(`world:${data.worldId}`).emit('spatial:voice-ice-candidate', data);
  });

  // Object interaction
  socket.on('spatial:interact', (data: {
    worldId: string;
    userId: string;
    objectId: string;
    action: string;
  }) => {
    socket.to(`world:${data.worldId}`).emit('spatial:interaction', {
      userId: data.userId,
      objectId: data.objectId,
      action: data.action,
      timestamp: Date.now(),
    });
  });
}
