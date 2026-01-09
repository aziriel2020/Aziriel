// @ts-nocheck
/**
 * Social Features Controller
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../config/database';

export class SocialController {
  /**
   * Get personalized feed
   */
  static async getFeed(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const posts = await prisma.post.findMany({
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
            },
          },
          likes: req.user ? {
            where: { userId: req.user.id },
            select: { id: true },
          } : false,
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });

      res.json({
        posts: posts.map((post) => ({
          ...post,
          isLiked: req.user ? post.likes.length > 0 : false,
          likes: post._count.likes,
          comments: post._count.comments,
        })),
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get single post
   */
  static async getPost(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
            },
          },
          likes: req.user ? {
            where: { userId: req.user.id },
            select: { id: true },
          } : false,
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      res.json({
        ...post,
        isLiked: req.user ? post.likes.length > 0 : false,
        likes: post._count.likes,
        comments: post._count.comments,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create post
   */
  static async createPost(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { title, content, mediaUrl, tags } = req.body;

      const post = await prisma.post.create({
        data: {
          title,
          content,
          mediaUrl,
          authorId: req.user.id,
          tags: tags ? {
            connectOrCreate: tags.map((name: string) => ({
              where: { name },
              create: { name },
            })),
          } : undefined,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
            },
          },
          tags: true,
        },
      });

      res.status(201).json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update post
   */
  static async updatePost(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const { title, content } = req.body;

      const post = await prisma.post.findUnique({
        where: { id },
        select: { authorId: true },
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      if (post.authorId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const updatedPost = await prisma.post.update({
        where: { id },
        data: { title, content },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });

      res.json(updatedPost);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Delete post
   */
  static async deletePost(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;

      const post = await prisma.post.findUnique({
        where: { id },
        select: { authorId: true },
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      if (post.authorId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await prisma.post.delete({ where: { id } });

      res.json({ message: 'Post deleted' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get comments
   */
  static async getComments(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const comments = await prisma.comment.findMany({
        where: { postId: id },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });

      res.json({ comments, page: Number(page), limit: Number(limit) });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create comment
   */
  static async createComment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const { content } = req.body;

      const comment = await prisma.comment.create({
        data: {
          content,
          postId: id,
          authorId: req.user.id,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Create notification for post author
      const post = await prisma.post.findUnique({
        where: { id },
        select: { authorId: true },
      });

      if (post && post.authorId !== req.user.id) {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            type: 'COMMENT',
            message: `${req.user.email} commented on your post`,
            link: `/posts/${id}`,
          },
        });
      }

      res.status(201).json(comment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update comment
   */
  static async updateComment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const { content } = req.body;

      const comment = await prisma.comment.findUnique({
        where: { id },
        select: { authorId: true },
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      if (comment.authorId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const updatedComment = await prisma.comment.update({
        where: { id },
        data: { content },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });

      res.json(updatedComment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Delete comment
   */
  static async deleteComment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;

      const comment = await prisma.comment.findUnique({
        where: { id },
        select: { authorId: true },
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      if (comment.authorId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await prisma.comment.delete({ where: { id } });

      res.json({ message: 'Comment deleted' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Like post
   */
  static async likePost(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;

      const like = await prisma.like.create({
        data: {
          postId: id,
          userId: req.user.id,
        },
      });

      // Create notification for post author
      const post = await prisma.post.findUnique({
        where: { id },
        select: { authorId: true },
      });

      if (post && post.authorId !== req.user.id) {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            type: 'LIKE',
            message: `${req.user.email} liked your post`,
            link: `/posts/${id}`,
          },
        });
      }

      res.status(201).json(like);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Already liked' });
      }
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Unlike post
   */
  static async unlikePost(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;

      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: req.user.id,
            postId: id,
          },
        },
      });

      res.json({ message: 'Unliked' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get likes
   */
  static async getLikes(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const likes = await prisma.like.findMany({
        where: { postId: id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });

      res.json({ likes, count: likes.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Follow user
   */
  static async followUser(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;

      if (id === req.user.id) {
        return res.status(400).json({ error: 'Cannot follow yourself' });
      }

      const follow = await prisma.follow.create({
        data: {
          followerId: req.user.id,
          followingId: id,
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: id,
          type: 'FOLLOW',
          message: `${req.user.email} started following you`,
          link: `/users/${req.user.id}`,
        },
      });

      res.status(201).json(follow);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Already following' });
      }
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Unfollow user
   */
  static async unfollowUser(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;

      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: req.user.id,
            followingId: id,
          },
        },
      });

      res.json({ message: 'Unfollowed' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get followers
   */
  static async getFollowers(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const followers = await prisma.follow.findMany({
        where: { followingId: id },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });

      res.json({ followers: followers.map((f) => f.follower), count: followers.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get following
   */
  static async getFollowing(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const following = await prisma.follow.findMany({
        where: { followerId: id },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });

      res.json({ following: following.map((f) => f.following), count: following.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get conversations
   */
  static async getConversations(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: req.user.id },
            { receiverId: req.user.id },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Group by conversation
      const conversations = new Map();
      messages.forEach((message) => {
        const otherId = message.senderId === req.user.id ? message.receiverId : message.senderId;
        if (!conversations.has(otherId)) {
          conversations.set(otherId, {
            user: message.senderId === req.user.id ? message.receiver : message.sender,
            lastMessage: message,
            unreadCount: 0,
          });
        }
      });

      res.json({ conversations: Array.from(conversations.values()) });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get messages with user
   */
  static async getMessages(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { userId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: req.user.id, receiverId: userId },
            { senderId: userId, receiverId: req.user.id },
          ],
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });

      res.json({ messages, page: Number(page), limit: Number(limit) });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Send message
   */
  static async sendMessage(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { userId } = req.params;
      const { content } = req.body;

      const message = await prisma.message.create({
        data: {
          content,
          senderId: req.user.id,
          receiverId: userId,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId,
          type: 'MESSAGE',
          message: `New message from ${req.user.email}`,
          link: `/messages/${req.user.id}`,
        },
      });

      res.status(201).json(message);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Delete message
   */
  static async deleteMessage(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;

      const message = await prisma.message.findUnique({
        where: { id },
        select: { senderId: true },
      });

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      if (message.senderId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await prisma.message.delete({ where: { id } });

      res.json({ message: 'Message deleted' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          bio: true,
          avatarUrl: true,
          role: true,
          plan: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if current user follows this user
      let isFollowing = false;
      if (req.user) {
        const follow = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: req.user.id,
              followingId: id,
            },
          },
        });
        isFollowing = !!follow;
      }

      res.json({
        ...user,
        postsCount: user._count.posts,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        isFollowing,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update profile
   */
  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { username, name, bio, avatarUrl } = req.body;

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { username, name, bio, avatarUrl },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          bio: true,
          avatarUrl: true,
        },
      });

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get user posts
   */
  static async getUserPosts(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const posts = await prisma.post.findMany({
        where: { authorId: id },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });

      res.json({ posts, page: Number(page), limit: Number(limit) });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get notifications
   */
  static async getNotifications(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { page = 1, limit = 50 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const notifications = await prisma.notification.findMany({
        where: { userId: req.user.id },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      });

      const unreadCount = await prisma.notification.count({
        where: {
          userId: req.user.id,
          read: false,
        },
      });

      res.json({ notifications, unreadCount, page: Number(page), limit: Number(limit) });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationRead(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;

      const notification = await prisma.notification.update({
        where: {
          id,
          userId: req.user.id,
        },
        data: { read: true },
      });

      res.json(notification);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllNotificationsRead(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      await prisma.notification.updateMany({
        where: {
          userId: req.user.id,
          read: false,
        },
        data: { read: true },
      });

      res.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get trending posts
   */
  static async getTrendingPosts(req: AuthRequest, res: Response) {
    try {
      const { limit = 10 } = req.query;

      // Posts with most likes in last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const posts = await prisma.post.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        take: Number(limit),
        orderBy: {
          likes: {
            _count: 'desc',
          },
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });

      res.json({ posts });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get trending tags
   */
  static async getTrendingTags(req: AuthRequest, res: Response) {
    try {
      const { limit = 20 } = req.query;

      const tags = await prisma.tag.findMany({
        take: Number(limit),
        orderBy: {
          posts: {
            _count: 'desc',
          },
        },
        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
      });

      res.json({ tags });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get trending users
   */
  static async getTrendingUsers(req: AuthRequest, res: Response) {
    try {
      const { limit = 10 } = req.query;

      const users = await prisma.user.findMany({
        take: Number(limit),
        orderBy: {
          followers: {
            _count: 'desc',
          },
        },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          avatarUrl: true,
          bio: true,
          _count: {
            select: {
              followers: true,
              posts: true,
            },
          },
        },
      });

      res.json({ users });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
