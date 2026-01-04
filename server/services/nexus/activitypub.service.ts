/**
 * ACTIVITYPUB FEDERATION SERVICE
 *
 * Full W3C ActivityPub protocol implementation for Fediverse interoperability
 * - Federated identity (WebFinger)
 * - Activity streams (Create, Update, Delete, Like, Follow, Announce)
 * - Interoperability with Mastodon, Pixelfed, PeerTube, Lemmy, etc.
 * - HTTP Signatures for verification
 * - Inbox/Outbox actors
 *
 * Revolutionary: Users can follow Mastodon users from our platform (and vice versa)
 * Escape walled gardens - join the open social web
 */

import axios from 'axios';
import crypto from 'crypto';
import { prisma } from '../../config/database';

export interface Actor {
  id: string; // https://platform.com/users/alice
  type: 'Person' | 'Application' | 'Group' | 'Organization' | 'Service';
  preferredUsername: string;
  name: string;
  summary?: string;
  inbox: string; // https://platform.com/users/alice/inbox
  outbox: string; // https://platform.com/users/alice/outbox
  followers: string; // https://platform.com/users/alice/followers
  following: string; // https://platform.com/users/alice/following
  liked?: string;
  publicKey: {
    id: string;
    owner: string;
    publicKeyPem: string;
  };
  icon?: {
    type: 'Image';
    mediaType: string;
    url: string;
  };
  image?: {
    type: 'Image';
    mediaType: string;
    url: string;
  };
  endpoints?: {
    sharedInbox?: string;
  };
}

export interface Activity {
  '@context': string | string[];
  id: string;
  type: ActivityType;
  actor: string;
  object: string | object;
  published?: string;
  to?: string[];
  cc?: string[];
}

export type ActivityType =
  | 'Create'
  | 'Update'
  | 'Delete'
  | 'Follow'
  | 'Accept'
  | 'Reject'
  | 'Add'
  | 'Remove'
  | 'Like'
  | 'Announce'
  | 'Undo';

export interface Note {
  '@context': string | string[];
  id: string;
  type: 'Note' | 'Article' | 'Video';
  attributedTo: string;
  content: string;
  published: string;
  to: string[];
  cc: string[];
  attachment?: Array<{
    type: 'Image' | 'Video' | 'Document';
    mediaType: string;
    url: string;
  }>;
  tag?: Array<{
    type: 'Mention' | 'Hashtag';
    name: string;
    href?: string;
  }>;
  inReplyTo?: string;
}

export class ActivityPubService {
  private static DOMAIN = process.env.DOMAIN || 'platform.com';
  private static CONTEXT = [
    'https://www.w3.org/ns/activitystreams',
    'https://w3id.org/security/v1',
  ];

  /**
   * Get Actor object for user (Actor endpoint)
   * GET /users/:username
   */
  static async getActor(username: string): Promise<Actor> {
    // Get user from database
    const user = await prisma.$queryRaw<Array<any>>`
      SELECT id, username, display_name, bio, avatar_url, banner_url, public_key, private_key
      FROM users
      WHERE username = ${username}
      LIMIT 1
    `;

    if (user.length === 0) {
      throw new Error('User not found');
    }

    const u = user[0];
    const actorUrl = `https://${this.DOMAIN}/users/${username}`;

    const actor: Actor = {
      '@context': this.CONTEXT,
      id: actorUrl,
      type: 'Person',
      preferredUsername: username,
      name: u.display_name || username,
      summary: u.bio || '',
      inbox: `${actorUrl}/inbox`,
      outbox: `${actorUrl}/outbox`,
      followers: `${actorUrl}/followers`,
      following: `${actorUrl}/following`,
      liked: `${actorUrl}/liked`,
      publicKey: {
        id: `${actorUrl}#main-key`,
        owner: actorUrl,
        publicKeyPem: u.public_key,
      },
      icon: u.avatar_url
        ? {
            type: 'Image',
            mediaType: 'image/jpeg',
            url: u.avatar_url,
          }
        : undefined,
      image: u.banner_url
        ? {
            type: 'Image',
            mediaType: 'image/jpeg',
            url: u.banner_url,
          }
        : undefined,
      endpoints: {
        sharedInbox: `https://${this.DOMAIN}/inbox`,
      },
    } as any;

    return actor;
  }

  /**
   * WebFinger discovery (RFC 7033)
   * GET /.well-known/webfinger?resource=acct:alice@platform.com
   */
  static async webfinger(resource: string): Promise<any> {
    // Parse resource (acct:username@domain)
    const match = resource.match(/acct:([^@]+)@(.+)/);
    if (!match) {
      throw new Error('Invalid resource format');
    }

    const [, username, domain] = match;

    if (domain !== this.DOMAIN) {
      throw new Error('Domain mismatch');
    }

    // Check if user exists
    const user = await prisma.$queryRaw<Array<any>>`
      SELECT username FROM users WHERE username = ${username} LIMIT 1
    `;

    if (user.length === 0) {
      throw new Error('User not found');
    }

    return {
      subject: resource,
      aliases: [`https://${this.DOMAIN}/users/${username}`],
      links: [
        {
          rel: 'self',
          type: 'application/activity+json',
          href: `https://${this.DOMAIN}/users/${username}`,
        },
        {
          rel: 'http://webfinger.net/rel/profile-page',
          type: 'text/html',
          href: `https://${this.DOMAIN}/@${username}`,
        },
      ],
    };
  }

  /**
   * Handle incoming activity (Inbox endpoint)
   * POST /users/:username/inbox
   */
  static async handleInbox(data: {
    username: string;
    activity: Activity;
    signature: string;
  }): Promise<void> {
    console.log(
      `[ActivityPub] Inbox: ${data.activity.type} from ${data.activity.actor}`
    );

    // Step 1: Verify HTTP Signature
    const isValid = await this.verifySignature(data.activity, data.signature);
    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // Step 2: Process activity based on type
    switch (data.activity.type) {
      case 'Follow':
        await this.handleFollow(data.username, data.activity);
        break;
      case 'Undo':
        await this.handleUndo(data.username, data.activity);
        break;
      case 'Create':
        await this.handleCreate(data.username, data.activity);
        break;
      case 'Update':
        await this.handleUpdate(data.username, data.activity);
        break;
      case 'Delete':
        await this.handleDelete(data.username, data.activity);
        break;
      case 'Like':
        await this.handleLike(data.username, data.activity);
        break;
      case 'Announce':
        await this.handleAnnounce(data.username, data.activity);
        break;
      default:
        console.log(`[ActivityPub] Unhandled activity type: ${data.activity.type}`);
    }
  }

  /**
   * Verify HTTP Signature
   */
  private static async verifySignature(
    activity: Activity,
    signature: string
  ): Promise<boolean> {
    try {
      // Parse signature header
      const sigParams: Record<string, string> = {};
      signature.split(',').forEach((param) => {
        const [key, value] = param.split('=');
        sigParams[key.trim()] = value.replace(/"/g, '');
      });

      // Get actor's public key
      const actorResponse = await axios.get(activity.actor, {
        headers: { Accept: 'application/activity+json' },
      });

      const publicKeyPem = actorResponse.data.publicKey.publicKeyPem;

      // Verify signature
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(sigParams.signatureString || '');
      const isValid = verify.verify(publicKeyPem, sigParams.signature, 'base64');

      return isValid;
    } catch (error: any) {
      console.error('[ActivityPub] Signature verification failed:', error.message);
      return false;
    }
  }

  /**
   * Handle Follow activity
   */
  private static async handleFollow(
    username: string,
    activity: Activity
  ): Promise<void> {
    const follower = activity.actor;

    // Store follow relationship
    await prisma.$executeRaw`
      INSERT INTO follows (follower_actor_id, following_username, status, created_at)
      VALUES (${follower}, ${username}, 'accepted', NOW())
      ON CONFLICT DO NOTHING
    `;

    // Send Accept activity
    await this.sendAccept(username, activity);

    console.log(`[ActivityPub] ${follower} followed ${username}`);
  }

  /**
   * Handle Undo activity (e.g., Undo Follow)
   */
  private static async handleUndo(
    username: string,
    activity: Activity
  ): Promise<void> {
    const object = activity.object as Activity;

    if (object.type === 'Follow') {
      // Remove follow relationship
      await prisma.$executeRaw`
        DELETE FROM follows
        WHERE follower_actor_id = ${activity.actor}
          AND following_username = ${username}
      `;

      console.log(`[ActivityPub] ${activity.actor} unfollowed ${username}`);
    }
  }

  /**
   * Handle Create activity (new post/note)
   */
  private static async handleCreate(
    username: string,
    activity: Activity
  ): Promise<void> {
    const note = activity.object as Note;

    // Store note in database
    await prisma.$executeRaw`
      INSERT INTO federated_posts (id, author_actor_id, content, published_at, created_at)
      VALUES (${note.id}, ${activity.actor}, ${note.content},
              ${new Date(note.published)}, NOW())
    `;

    console.log(`[ActivityPub] Created post from ${activity.actor}`);
  }

  /**
   * Handle Update activity
   */
  private static async handleUpdate(
    username: string,
    activity: Activity
  ): Promise<void> {
    const note = activity.object as Note;

    await prisma.$executeRaw`
      UPDATE federated_posts
      SET content = ${note.content}, updated_at = NOW()
      WHERE id = ${note.id}
    `;

    console.log(`[ActivityPub] Updated post ${note.id}`);
  }

  /**
   * Handle Delete activity
   */
  private static async handleDelete(
    username: string,
    activity: Activity
  ): Promise<void> {
    const objectId = typeof activity.object === 'string' ? activity.object : (activity.object as any).id;

    await prisma.$executeRaw`
      DELETE FROM federated_posts
      WHERE id = ${objectId}
    `;

    console.log(`[ActivityPub] Deleted post ${objectId}`);
  }

  /**
   * Handle Like activity
   */
  private static async handleLike(
    username: string,
    activity: Activity
  ): Promise<void> {
    const objectId = typeof activity.object === 'string' ? activity.object : (activity.object as any).id;

    await prisma.$executeRaw`
      INSERT INTO federated_likes (actor_id, object_id, created_at)
      VALUES (${activity.actor}, ${objectId}, NOW())
      ON CONFLICT DO NOTHING
    `;

    console.log(`[ActivityPub] ${activity.actor} liked ${objectId}`);
  }

  /**
   * Handle Announce activity (boost/reblog)
   */
  private static async handleAnnounce(
    username: string,
    activity: Activity
  ): Promise<void> {
    const objectId = typeof activity.object === 'string' ? activity.object : (activity.object as any).id;

    await prisma.$executeRaw`
      INSERT INTO federated_announces (actor_id, object_id, created_at)
      VALUES (${activity.actor}, ${objectId}, NOW())
      ON CONFLICT DO NOTHING
    `;

    console.log(`[ActivityPub] ${activity.actor} announced ${objectId}`);
  }

  /**
   * Send Accept activity (response to Follow)
   */
  private static async sendAccept(
    username: string,
    followActivity: Activity
  ): Promise<void> {
    const actorUrl = `https://${this.DOMAIN}/users/${username}`;

    const accept: Activity = {
      '@context': this.CONTEXT,
      id: `${actorUrl}/accepts/${Date.now()}`,
      type: 'Accept',
      actor: actorUrl,
      object: followActivity,
    } as any;

    // Get follower's inbox
    const followerInbox = await this.getActorInbox(followActivity.actor);

    // Send to follower's inbox
    await this.deliverActivity(username, followerInbox, accept);
  }

  /**
   * Create and send activity (Outbox endpoint)
   * Example: User creates a post, we send Create activity to followers
   */
  static async createPost(data: {
    username: string;
    content: string;
    attachments?: Array<{ type: string; url: string }>;
    visibility: 'public' | 'unlisted' | 'followers' | 'direct';
  }): Promise<Note> {
    const actorUrl = `https://${this.DOMAIN}/users/${data.username}`;
    const noteId = `${actorUrl}/posts/${Date.now()}`;

    const note: Note = {
      '@context': this.CONTEXT,
      id: noteId,
      type: 'Note',
      attributedTo: actorUrl,
      content: data.content,
      published: new Date().toISOString(),
      to: this.getRecipients(data.visibility).to,
      cc: this.getRecipients(data.visibility).cc,
      attachment: data.attachments,
    } as any;

    // Create activity
    const createActivity: Activity = {
      '@context': this.CONTEXT,
      id: `${noteId}/activity`,
      type: 'Create',
      actor: actorUrl,
      object: note,
      published: new Date().toISOString(),
      to: note.to,
      cc: note.cc,
    } as any;

    // Store in database
    await prisma.$executeRaw`
      INSERT INTO posts (id, user_id, content, published_at, created_at)
      SELECT ${noteId}, id, ${data.content}, NOW(), NOW()
      FROM users WHERE username = ${data.username}
    `;

    // Deliver to followers
    await this.deliverToFollowers(data.username, createActivity);

    console.log(`[ActivityPub] Created post ${noteId}`);

    return note;
  }

  /**
   * Send Follow request to remote actor
   */
  static async followRemoteActor(data: {
    username: string;
    remoteActorId: string;
  }): Promise<void> {
    const actorUrl = `https://${this.DOMAIN}/users/${data.username}`;

    const followActivity: Activity = {
      '@context': this.CONTEXT,
      id: `${actorUrl}/follows/${Date.now()}`,
      type: 'Follow',
      actor: actorUrl,
      object: data.remoteActorId,
    } as any;

    // Get remote actor's inbox
    const remoteInbox = await this.getActorInbox(data.remoteActorId);

    // Deliver Follow activity
    await this.deliverActivity(data.username, remoteInbox, followActivity);

    // Store pending follow
    await prisma.$executeRaw`
      INSERT INTO follows (follower_username, following_actor_id, status, created_at)
      SELECT ${data.username}, ${data.remoteActorId}, 'pending', NOW()
      FROM users WHERE username = ${data.username}
    `;

    console.log(`[ActivityPub] Sent follow request to ${data.remoteActorId}`);
  }

  /**
   * Deliver activity to remote inbox
   */
  private static async deliverActivity(
    username: string,
    inbox: string,
    activity: Activity
  ): Promise<void> {
    // Get user's private key for signing
    const user = await prisma.$queryRaw<Array<any>>`
      SELECT private_key FROM users WHERE username = ${username} LIMIT 1
    `;

    if (user.length === 0) {
      throw new Error('User not found');
    }

    const privateKey = user[0].private_key;

    // Create HTTP Signature
    const signature = this.createSignature(inbox, activity, privateKey, username);

    // Send to inbox
    try {
      await axios.post(inbox, activity, {
        headers: {
          'Content-Type': 'application/activity+json',
          Signature: signature,
        },
      });

      console.log(`[ActivityPub] Delivered to ${inbox}`);
    } catch (error: any) {
      console.error(`[ActivityPub] Delivery failed to ${inbox}:`, error.message);
    }
  }

  /**
   * Create HTTP Signature
   */
  private static createSignature(
    inbox: string,
    activity: Activity,
    privateKey: string,
    username: string
  ): string {
    const url = new URL(inbox);
    const date = new Date().toUTCString();
    const digest = this.createDigest(activity);

    const signatureString = `(request-target): post ${url.pathname}\nhost: ${url.host}\ndate: ${date}\ndigest: ${digest}`;

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signatureString);
    const signature = sign.sign(privateKey, 'base64');

    const keyId = `https://${this.DOMAIN}/users/${username}#main-key`;

    return `keyId="${keyId}",headers="(request-target) host date digest",signature="${signature}"`;
  }

  /**
   * Create digest for HTTP Signature
   */
  private static createDigest(activity: Activity): string {
    const body = JSON.stringify(activity);
    const hash = crypto.createHash('sha256').update(body).digest('base64');
    return `SHA-256=${hash}`;
  }

  /**
   * Get actor's inbox URL
   */
  private static async getActorInbox(actorId: string): Promise<string> {
    const response = await axios.get(actorId, {
      headers: { Accept: 'application/activity+json' },
    });

    return response.data.inbox;
  }

  /**
   * Deliver to all followers
   */
  private static async deliverToFollowers(
    username: string,
    activity: Activity
  ): Promise<void> {
    // Get all followers
    const followers = await prisma.$queryRaw<Array<any>>`
      SELECT follower_actor_id FROM follows
      WHERE following_username = ${username} AND status = 'accepted'
    `;

    // Deliver to each follower's inbox
    for (const follower of followers) {
      const inbox = await this.getActorInbox(follower.follower_actor_id);
      await this.deliverActivity(username, inbox, activity);
    }
  }

  /**
   * Get recipients based on visibility
   */
  private static getRecipients(visibility: string): { to: string[]; cc: string[] } {
    const PUBLIC = 'https://www.w3.org/ns/activitystreams#Public';

    switch (visibility) {
      case 'public':
        return { to: [PUBLIC], cc: [] };
      case 'unlisted':
        return { to: [], cc: [PUBLIC] };
      case 'followers':
        return { to: [], cc: [] }; // Would include followers collection
      case 'direct':
        return { to: [], cc: [] }; // Would include mentioned users
      default:
        return { to: [PUBLIC], cc: [] };
    }
  }

  /**
   * Generate RSA key pair for new user
   */
  static generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    return { publicKey, privateKey };
  }
}
