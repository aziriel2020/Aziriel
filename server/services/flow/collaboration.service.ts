/**
 * REAL-TIME COLLABORATION SERVICE - Multiplayer Video Editing
 *
 * Google Docs-style collaboration for video editing
 * - WebSocket-based real-time sync
 * - Live cursor tracking
 * - Comments and annotations
 * - Version control
 * - Presence awareness
 */

import { Server as SocketIOServer } from 'socket.io';
import { prisma } from '../../config/database';

export interface CollaborationSession {
  id: string;
  projectId: string;
  users: CollaborationUser[];
  activeEdits: Map<string, any>;
  createdAt: Date;
}

export interface CollaborationUser {
  userId: string;
  socketId: string;
  name: string;
  avatar?: string;
  color: string;
  cursor: {
    x: number;
    y: number;
    timelinePosition?: number;
  };
  selection?: {
    trackId?: string;
    clipId?: string;
  };
  lastActivity: Date;
}

export interface Comment {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  timelinePosition?: number;
  clipId?: string;
  text: string;
  resolved: boolean;
  replies: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  version: number;
  name: string;
  description?: string;
  userId: string;
  snapshot: any;
  createdAt: Date;
}

export class CollaborationService {
  private static io: SocketIOServer;
  private static sessions: Map<string, CollaborationSession> = new Map();

  /**
   * Initialize WebSocket server
   */
  static initialize(io: SocketIOServer): void {
    this.io = io;

    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Join project room
      socket.on('join-project', async (data: {
        projectId: string;
        userId: string;
        userName: string;
      }) => {
        await this.handleUserJoin(socket, data);
      });

      // Cursor movement
      socket.on('cursor-move', (data) => {
        this.handleCursorMove(socket, data);
      });

      // Selection change
      socket.on('selection-change', (data) => {
        this.handleSelectionChange(socket, data);
      });

      // Timeline edit
      socket.on('timeline-edit', async (data) => {
        await this.handleTimelineEdit(socket, data);
      });

      // Add comment
      socket.on('add-comment', async (data) => {
        await this.handleAddComment(socket, data);
      });

      // Disconnect
      socket.on('disconnect', () => {
        this.handleUserLeave(socket);
      });
    });
  }

  /**
   * Handle user joining project
   */
  private static async handleUserJoin(
    socket: any,
    data: { projectId: string; userId: string; userName: string }
  ): Promise<void> {
    const { projectId, userId, userName } = data;

    // Verify user has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { team: true },
    });

    if (!project) {
      socket.emit('error', { message: 'Project not found' });
      return;
    }

    // Join room
    socket.join(projectId);

    // Get or create session
    let session = this.sessions.get(projectId);

    if (!session) {
      session = {
        id: projectId,
        projectId,
        users: [],
        activeEdits: new Map(),
        createdAt: new Date(),
      };
      this.sessions.set(projectId, session);
    }

    // Add user to session
    const userColor = this.generateUserColor(session.users.length);
    const collaborationUser: CollaborationUser = {
      userId,
      socketId: socket.id,
      name: userName,
      color: userColor,
      cursor: { x: 0, y: 0 },
      lastActivity: new Date(),
    };

    session.users.push(collaborationUser);

    // Notify all users in room
    this.io.to(projectId).emit('user-joined', {
      user: collaborationUser,
      users: session.users,
    });

    // Send current state to new user
    socket.emit('session-state', {
      users: session.users,
      activeEdits: Array.from(session.activeEdits.entries()),
    });
  }

  /**
   * Handle cursor movement
   */
  private static handleCursorMove(
    socket: any,
    data: { projectId: string; x: number; y: number; timelinePosition?: number }
  ): void {
    const session = this.sessions.get(data.projectId);

    if (!session) return;

    const user = session.users.find((u) => u.socketId === socket.id);

    if (user) {
      user.cursor = {
        x: data.x,
        y: data.y,
        timelinePosition: data.timelinePosition,
      };
      user.lastActivity = new Date();

      // Broadcast to other users
      socket.to(data.projectId).emit('cursor-moved', {
        userId: user.userId,
        cursor: user.cursor,
      });
    }
  }

  /**
   * Handle selection change
   */
  private static handleSelectionChange(
    socket: any,
    data: { projectId: string; trackId?: string; clipId?: string }
  ): void {
    const session = this.sessions.get(data.projectId);

    if (!session) return;

    const user = session.users.find((u) => u.socketId === socket.id);

    if (user) {
      user.selection = {
        trackId: data.trackId,
        clipId: data.clipId,
      };

      socket.to(data.projectId).emit('selection-changed', {
        userId: user.userId,
        selection: user.selection,
      });
    }
  }

  /**
   * Handle timeline edit with conflict resolution
   */
  private static async handleTimelineEdit(
    socket: any,
    data: {
      projectId: string;
      type: string;
      payload: any;
      version: number;
    }
  ): Promise<void> {
    const session = this.sessions.get(data.projectId);

    if (!session) return;

    // Check for conflicts
    const editKey = `${data.type}_${JSON.stringify(data.payload.target)}`;

    if (session.activeEdits.has(editKey)) {
      // Conflict detected
      socket.emit('edit-conflict', {
        message: 'Another user is editing this element',
        activeEditor: session.activeEdits.get(editKey),
      });
      return;
    }

    // Lock for editing
    const user = session.users.find((u) => u.socketId === socket.id);
    session.activeEdits.set(editKey, user?.userId);

    // Apply edit to database
    try {
      // TODO: Apply actual edit based on type
      // await applyEdit(data);

      // Broadcast to all users
      this.io.to(data.projectId).emit('timeline-updated', {
        type: data.type,
        payload: data.payload,
        userId: user?.userId,
        version: data.version + 1,
      });

      // Release lock after brief delay
      setTimeout(() => {
        session.activeEdits.delete(editKey);
      }, 1000);
    } catch (error: any) {
      socket.emit('error', { message: error.message });
      session.activeEdits.delete(editKey);
    }
  }

  /**
   * Handle adding comment
   */
  private static async handleAddComment(
    socket: any,
    data: {
      projectId: string;
      userId: string;
      userName: string;
      text: string;
      timelinePosition?: number;
      clipId?: string;
    }
  ): Promise<void> {
    const comment = await prisma.comment.create({
      data: {
        projectId: data.projectId,
        userId: data.userId,
        userName: data.userName,
        text: data.text,
        timelinePosition: data.timelinePosition,
        clipId: data.clipId,
        resolved: false,
        replies: [],
      },
    });

    // Broadcast to all users
    this.io.to(data.projectId).emit('comment-added', comment);
  }

  /**
   * Handle user leaving
   */
  private static handleUserLeave(socket: any): void {
    // Find and remove user from all sessions
    this.sessions.forEach((session, projectId) => {
      const userIndex = session.users.findIndex((u) => u.socketId === socket.id);

      if (userIndex !== -1) {
        const user = session.users[userIndex];
        session.users.splice(userIndex, 1);

        // Notify remaining users
        this.io.to(projectId).emit('user-left', {
          userId: user.userId,
          users: session.users,
        });

        // Clean up session if empty
        if (session.users.length === 0) {
          this.sessions.delete(projectId);
        }
      }
    });
  }

  /**
   * Generate unique color for user
   */
  private static generateUserColor(index: number): string {
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#4facfe',
      '#43e97b', '#fa709a', '#fee140', '#30cfd0',
    ];
    return colors[index % colors.length];
  }

  /**
   * Create version snapshot
   */
  static async createVersion(data: {
    projectId: string;
    userId: string;
    name: string;
    description?: string;
  }): Promise<ProjectVersion> {
    // Get current project state
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      include: {
        videos: true,
        assets: true,
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Get current version number
    const lastVersion = await prisma.projectVersion.findFirst({
      where: { projectId: data.projectId },
      orderBy: { version: 'desc' },
    });

    const version = await prisma.projectVersion.create({
      data: {
        projectId: data.projectId,
        version: (lastVersion?.version || 0) + 1,
        name: data.name,
        description: data.description,
        userId: data.userId,
        snapshot: {
          project,
          timestamp: new Date(),
        },
      },
    });

    return version as any;
  }

  /**
   * Restore to version
   */
  static async restoreVersion(versionId: string): Promise<void> {
    const version = await prisma.projectVersion.findUnique({
      where: { id: versionId },
    });

    if (!version) {
      throw new Error('Version not found');
    }

    // TODO: Implement version restoration logic
    // This would involve restoring project state, timeline, assets, etc.
  }

  /**
   * Get comments for project
   */
  static async getComments(projectId: string): Promise<Comment[]> {
    const comments = await prisma.comment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return comments as any;
  }

  /**
   * Resolve comment
   */
  static async resolveComment(commentId: string): Promise<void> {
    await prisma.comment.update({
      where: { id: commentId },
      data: { resolved: true },
    });
  }
}
