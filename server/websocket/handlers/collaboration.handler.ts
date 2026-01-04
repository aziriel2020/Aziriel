/**
 * AGENT COLLABORATION WEBSOCKET HANDLER
 *
 * Real-time events for agent collaboration:
 * - Negotiation updates
 * - Proposal/counter-proposal
 * - Collaboration status changes
 */

import { Server, Socket } from 'socket.io';
import { AgentCollaborationService } from '../../services/nexus/agent-collaboration.service';

export default function collaborationHandler(io: Server, socket: Socket) {
  // Subscribe to collaboration updates
  socket.on('collaboration:subscribe', (data: { collaborationId: string }) => {
    socket.join(`collaboration:${data.collaborationId}`);
    console.log(`[Collaboration] Subscribed to ${data.collaborationId}`);
  });

  // Unsubscribe
  socket.on('collaboration:unsubscribe', (data: { collaborationId: string }) => {
    socket.leave(`collaboration:${data.collaborationId}`);
  });

  // Send proposal
  socket.on('collaboration:proposal', (data: {
    collaborationId: string;
    userId: string;
    proposal: any;
  }) => {
    socket.to(`collaboration:${data.collaborationId}`).emit('collaboration:proposal-received', {
      userId: data.userId,
      proposal: data.proposal,
      timestamp: Date.now(),
    });
  });

  // Accept/reject proposal
  socket.on('collaboration:response', (data: {
    collaborationId: string;
    userId: string;
    response: 'accept' | 'reject';
    reason?: string;
  }) => {
    socket.to(`collaboration:${data.collaborationId}`).emit('collaboration:response-received', {
      userId: data.userId,
      response: data.response,
      reason: data.reason,
      timestamp: Date.now(),
    });
  });

  // Status update
  socket.on('collaboration:status', (data: {
    collaborationId: string;
    status: string;
    result?: any;
  }) => {
    io.to(`collaboration:${data.collaborationId}`).emit('collaboration:status-update', {
      status: data.status,
      result: data.result,
      timestamp: Date.now(),
    });
  });
}
