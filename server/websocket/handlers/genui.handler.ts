/**
 * GENERATIVE UI WEBSOCKET HANDLER
 *
 * Real-time UI streaming:
 * - Stream UI components as they're generated
 * - UI state synchronization
 * - Context updates
 */

import { Server, Socket } from 'socket.io';
import { GenerativeUIService } from '../../services/nexus/generative-ui.service';

export default function genuiHandler(io: Server, socket: Socket) {
  // Subscribe to UI updates for conversation
  socket.on('genui:subscribe', (data: { conversationId: string }) => {
    socket.join(`genui:${data.conversationId}`);
    console.log(`[GenUI] Subscribed to conversation ${data.conversationId}`);
  });

  // Unsubscribe
  socket.on('genui:unsubscribe', (data: { conversationId: string }) => {
    socket.leave(`genui:${data.conversationId}`);
  });

  // Request UI generation
  socket.on('genui:generate', async (data: {
    conversationId: string;
    userId: string;
    context: any;
  }) => {
    try {
      const { conversationId, userId, context } = data;

      // Generate UI
      const ui = await GenerativeUIService.generateUI({
        conversationId,
        userId,
        ...context,
      });

      // Stream components one by one
      for (const component of ui.components) {
        socket.emit('genui:component', {
          conversationId,
          component,
          timestamp: Date.now(),
        });

        // Small delay for progressive rendering
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Send complete signal
      socket.emit('genui:complete', {
        conversationId,
        ui,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      socket.emit('genui:error', { error: error.message });
    }
  });

  // Update context
  socket.on('genui:context-update', (data: {
    conversationId: string;
    context: any;
  }) => {
    socket.to(`genui:${data.conversationId}`).emit('genui:context-updated', {
      context: data.context,
      timestamp: Date.now(),
    });
  });
}
