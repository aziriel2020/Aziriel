/**
 * Social Features Routes
 */

import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { SocialController } from '../controllers/social.controller';

const router = Router();

// Posts
router.get('/posts', optionalAuth, SocialController.getFeed);
router.get('/posts/:id', optionalAuth, SocialController.getPost);
router.post('/posts', authenticate, SocialController.createPost);
router.put('/posts/:id', authenticate, SocialController.updatePost);
router.delete('/posts/:id', authenticate, SocialController.deletePost);

// Comments
router.get('/posts/:id/comments', SocialController.getComments);
router.post('/posts/:id/comments', authenticate, SocialController.createComment);
router.put('/comments/:id', authenticate, SocialController.updateComment);
router.delete('/comments/:id', authenticate, SocialController.deleteComment);

// Likes
router.post('/posts/:id/like', authenticate, SocialController.likePost);
router.delete('/posts/:id/like', authenticate, SocialController.unlikePost);
router.get('/posts/:id/likes', SocialController.getLikes);

// Follows
router.post('/users/:id/follow', authenticate, SocialController.followUser);
router.delete('/users/:id/follow', authenticate, SocialController.unfollowUser);
router.get('/users/:id/followers', SocialController.getFollowers);
router.get('/users/:id/following', SocialController.getFollowing);

// Messages
router.get('/messages', authenticate, SocialController.getConversations);
router.get('/messages/:userId', authenticate, SocialController.getMessages);
router.post('/messages/:userId', authenticate, SocialController.sendMessage);
router.delete('/messages/:id', authenticate, SocialController.deleteMessage);

// Profile
router.get('/users/:id/profile', optionalAuth, SocialController.getUserProfile);
router.put('/profile', authenticate, SocialController.updateProfile);
router.get('/users/:id/posts', optionalAuth, SocialController.getUserPosts);

// Notifications
router.get('/notifications', authenticate, SocialController.getNotifications);
router.put('/notifications/:id/read', authenticate, SocialController.markNotificationRead);
router.put('/notifications/read-all', authenticate, SocialController.markAllNotificationsRead);

// Trending
router.get('/trending/posts', SocialController.getTrendingPosts);
router.get('/trending/tags', SocialController.getTrendingTags);
router.get('/trending/users', SocialController.getTrendingUsers);

export default router;
