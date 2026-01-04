/**
 * ACTIVITYPUB FEDERATION API ROUTES
 *
 * W3C ActivityPub protocol endpoints for Fediverse interoperability
 * - WebFinger discovery
 * - Actor endpoints
 * - Inbox/Outbox
 * - Follow/Post/Like activities
 */

import express, { Request, Response } from 'express';
import { ActivityPubService } from '../../services/nexus/activitypub.service';

const router = express.Router();

/**
 * WebFinger discovery (RFC 7033)
 * GET /.well-known/webfinger?resource=acct:user@domain.com
 *
 * IMPORTANT: This must be mounted at root level, not under /api
 */
router.get('/.well-known/webfinger', async (req: Request, res: Response) => {
  try {
    const { resource } = req.query;

    if (!resource || typeof resource !== 'string') {
      return res.status(400).json({ error: 'Resource parameter required' });
    }

    const webfinger = await ActivityPubService.webfinger(resource);

    res.setHeader('Content-Type', 'application/jrd+json');
    res.json(webfinger);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * Get Actor (User profile for ActivityPub)
 * GET /users/:username
 *
 * IMPORTANT: This must accept application/activity+json
 */
router.get('/users/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const accept = req.headers.accept || '';

    // Only respond with ActivityPub data if client accepts it
    if (!accept.includes('application/activity+json') && !accept.includes('application/ld+json')) {
      // Redirect to web profile
      return res.redirect(`/@${username}`);
    }

    const actor = await ActivityPubService.getActor(username);

    res.setHeader('Content-Type', 'application/activity+json; charset=utf-8');
    res.json(actor);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * Inbox endpoint (receive activities)
 * POST /users/:username/inbox
 */
router.post('/users/:username/inbox', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const activity = req.body;
    const signature = req.headers.signature as string;

    if (!signature) {
      return res.status(401).json({ error: 'Signature required' });
    }

    await ActivityPubService.handleInbox({
      username,
      activity,
      signature,
    });

    res.status(202).json({ message: 'Accepted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Shared inbox (for efficient delivery)
 * POST /inbox
 */
router.post('/inbox', async (req: Request, res: Response) => {
  try {
    const activity = req.body;
    const signature = req.headers.signature as string;

    if (!signature) {
      return res.status(401).json({ error: 'Signature required' });
    }

    // Extract target username from activity
    const targetUsername = 'shared'; // Would parse from activity

    await ActivityPubService.handleInbox({
      username: targetUsername,
      activity,
      signature,
    });

    res.status(202).json({ message: 'Accepted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Outbox endpoint (user's activities)
 * GET /users/:username/outbox
 */
router.get('/users/:username/outbox', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    // Return OrderedCollection of user's activities
    const outbox = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `https://${process.env.DOMAIN}/users/${username}/outbox`,
      type: 'OrderedCollection',
      totalItems: 0,
      orderedItems: [],
    };

    res.setHeader('Content-Type', 'application/activity+json; charset=utf-8');
    res.json(outbox);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Followers collection
 * GET /users/:username/followers
 */
router.get('/users/:username/followers', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const followers = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `https://${process.env.DOMAIN}/users/${username}/followers`,
      type: 'OrderedCollection',
      totalItems: 0,
      orderedItems: [],
    };

    res.setHeader('Content-Type', 'application/activity+json; charset=utf-8');
    res.json(followers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Following collection
 * GET /users/:username/following
 */
router.get('/users/:username/following', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const following = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `https://${process.env.DOMAIN}/users/${username}/following`,
      type: 'OrderedCollection',
      totalItems: 0,
      orderedItems: [],
    };

    res.setHeader('Content-Type', 'application/activity+json; charset=utf-8');
    res.json(following);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create post (Outbox POST)
 * POST /api/nexus/activitypub/post
 */
router.post('/post', async (req: Request, res: Response) => {
  try {
    const { username, content, attachments, visibility } = req.body;

    const note = await ActivityPubService.createPost({
      username,
      content,
      attachments,
      visibility: visibility || 'public',
    });

    res.json({ success: true, note });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Follow remote actor
 * POST /api/nexus/activitypub/follow
 */
router.post('/follow', async (req: Request, res: Response) => {
  try {
    const { username, remoteActorId } = req.body;

    await ActivityPubService.followRemoteActor({
      username,
      remoteActorId,
    });

    res.json({ success: true, message: 'Follow request sent' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
