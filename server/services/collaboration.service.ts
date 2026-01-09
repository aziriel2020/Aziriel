/**
 * Collaboration Service - TEAM FEATURES
 * Workspaces, sharing, comments, permissions
 */

import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { io } from '../app';

export interface WorkspaceCreate {
  name: string;
  description?: string;
  ownerId: string;
}

export interface WorkspaceMemberAdd {
  workspaceId: string;
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
}

export interface CommentCreate {
  jobId: string;
  userId: string;
  text: string;
  timestamp?: number; // Video timestamp in seconds
}

export class CollaborationService {
  /**
   * Create workspace
   */
  static async createWorkspace(data: WorkspaceCreate) {
    const workspace = await prisma.workspace.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId: data.ownerId,
        members: {
          create: {
            userId: data.ownerId,
            role: 'owner',
          },
        },
      },
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    logger.info(\`Workspace created: \${workspace.id}\`);
    return workspace;
  }

  /**
   * Add member to workspace
   */
  static async addMember(data: WorkspaceMemberAdd) {
    // Check permission
    const workspace = await prisma.workspace.findUnique({
      where: { id: data.workspaceId },
      include: { members: true },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId: data.workspaceId,
        userId: data.userId,
        role: data.role,
      },
      include: { user: true },
    });

    // Notify user
    io.to(\`user:\${data.userId}\`).emit('workspace:invited', {
      workspaceId: data.workspaceId,
      workspaceName: workspace.name,
      role: data.role,
    });

    return member;
  }

  /**
   * Remove member from workspace
   */
  static async removeMember(workspaceId: string, userId: string, removedBy: string) {
    // Check permission (only owner/admin can remove)
    const removerMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: removedBy,
        role: { in: ['owner', 'admin'] },
      },
    });

    if (!removerMember) {
      throw new Error('Permission denied');
    }

    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    io.to(\`user:\${userId}\`).emit('workspace:removed', { workspaceId });
  }

  /**
   * Share job to workspace
   */
  static async shareJobToWorkspace(jobId: string, workspaceId: string, userId: string) {
    // Verify user is workspace member
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });

    if (!member) {
      throw new Error('Not a workspace member');
    }

    await prisma.job.update({
      where: { id: jobId },
      data: {
        workspaceId,
        sharedAt: new Date(),
      },
    });

    // Notify workspace members
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    workspace?.members.forEach((member) => {
      if (member.userId !== userId) {
        io.to(\`user:\${member.userId}\`).emit('workspace:video_shared', {
          jobId,
          workspaceId,
          sharedBy: userId,
        });
      }
    });
  }

  /**
   * Add comment to video
   */
  static async addComment(data: CommentCreate) {
    const comment = await prisma.comment.create({
      data: {
        jobId: data.jobId,
        userId: data.userId,
        text: data.text,
        timestamp: data.timestamp,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get job to find workspace
    const job = await prisma.job.findUnique({
      where: { id: data.jobId },
    });

    if (job?.workspaceId) {
      // Notify workspace members
      const workspace = await prisma.workspace.findUnique({
        where: { id: job.workspaceId },
        include: { members: true },
      });

      workspace?.members.forEach((member) => {
        if (member.userId !== data.userId) {
          io.to(\`user:\${member.userId}\`).emit('comment:new', {
            comment,
            jobId: data.jobId,
          });
        }
      });
    }

    return comment;
  }

  /**
   * Get comments for job
   */
  static async getComments(jobId: string) {
    const comments = await prisma.comment.findMany({
      where: { jobId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return comments;
  }

  /**
   * Reply to comment
   */
  static async replyToComment(commentId: string, userId: string, text: string) {
    const reply = await prisma.comment.create({
      data: {
        jobId: '', // Will be set from parent
        userId,
        text,
        parentId: commentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Notify original commenter
    const parentComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (parentComment && parentComment.userId !== userId) {
      io.to(\`user:\${parentComment.userId}\`).emit('comment:reply', {
        reply,
        parentCommentId: commentId,
      });
    }

    return reply;
  }

  /**
   * Get workspace jobs
   */
  static async getWorkspaceJobs(workspaceId: string, userId: string) {
    // Verify access
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });

    if (!member) {
      throw new Error('Access denied');
    }

    const jobs = await prisma.job.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    return jobs;
  }

  /**
   * Get user workspaces
   */
  static async getUserWorkspaces(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            _count: {
              select: {
                members: true,
                jobs: true,
              },
            },
          },
        },
      },
    });

    return memberships.map(m => ({
      ...m.workspace,
      role: m.role,
    }));
  }

  /**
   * Update member role
   */
  static async updateMemberRole(
    workspaceId: string,
    userId: string,
    newRole: string,
    updatedBy: string
  ) {
    // Check permission
    const updater = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: updatedBy,
        role: { in: ['owner', 'admin'] },
      },
    });

    if (!updater) {
      throw new Error('Permission denied');
    }

    const updated = await prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      data: {
        role: newRole as any,
      },
    });

    io.to(\`user:\${userId}\`).emit('workspace:role_updated', {
      workspaceId,
      newRole,
    });

    return updated;
  }

  /**
   * Check permission
   */
  static async checkPermission(
    workspaceId: string,
    userId: string,
    requiredRole: 'owner' | 'admin' | 'editor' | 'viewer'
  ): Promise<boolean> {
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });

    if (!member) return false;

    const roleHierarchy = ['viewer', 'editor', 'admin', 'owner'];
    const userRoleIndex = roleHierarchy.indexOf(member.role);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

    return userRoleIndex >= requiredRoleIndex;
  }
}

export default CollaborationService;
