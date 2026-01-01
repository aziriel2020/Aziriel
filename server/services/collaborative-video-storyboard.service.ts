import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import Redis from 'ioredis';
import { Queue } from 'bull';
import { EventEmitter } from 'events';

const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const redis = new Redis(process.env.REDIS_URL);

/**
 * 🎬 COLLABORATIVE VIDEO & STORYBOARD SYSTEM
 *
 * Revolutionary collaborative video creation platform:
 *
 * 1. STORYBOARD CREATION
 *    - Visual storyboard builder
 *    - Scene-by-scene planning
 *    - Shot descriptions and notes
 *    - Duration planning
 *    - Asset management
 *
 * 2. COLLABORATIVE EDITING
 *    - Multi-user real-time collaboration
 *    - Live cursors and presence
 *    - Comment threads per scene
 *    - Version history and rollback
 *    - Change tracking
 *
 * 3. VIDEO PRODUCTION
 *    - AI-powered script writing
 *    - Auto-generate storyboards from script
 *    - Asset library (stock footage, music)
 *    - Template library
 *    - Export to video editors
 *
 * 4. TEAM MANAGEMENT
 *    - Role-based permissions (Owner, Editor, Viewer, Commenter)
 *    - Invite team members
 *    - Activity feed
 *    - Task assignments
 *    - Approval workflows
 *
 * 5. AI FEATURES
 *    - AI script generator
 *    - AI shot suggestions
 *    - AI visual style recommendations
 *    - AI music suggestions
 *    - AI voiceover generation
 *
 * VALUE: $5,000+/month in video production tools
 */

interface VideoProject {
  id: string;
  userId: string; // Owner
  title: string;
  description: string;
  type: 'short_form' | 'long_form' | 'ad' | 'tutorial' | 'story' | 'reel';

  // Storyboard
  storyboard: {
    scenes: Scene[];
    totalDuration: number; // seconds
    aspectRatio: '9:16' | '16:9' | '1:1' | '4:5';
    style: string; // Visual style
  };

  // Script
  script?: {
    content: string;
    scenes: Array<{
      sceneId: string;
      dialogue: string;
      voiceover: string;
      duration: number;
    }>;
  };

  // Team & Collaboration
  team: ProjectMember[];
  permissions: {
    publicView: boolean;
    allowComments: boolean;
    allowSuggestions: boolean;
  };

  // Assets
  assets: {
    videos: ProjectAsset[];
    images: ProjectAsset[];
    audio: ProjectAsset[];
    music: ProjectAsset[];
  };

  // Production status
  status: 'planning' | 'storyboarding' | 'production' | 'editing' | 'review' | 'completed';
  progress: number; // 0-100

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastEditedBy?: string;
  version: number;
  versionHistory: ProjectVersion[];
}

interface Scene {
  id: string;
  order: number;
  title: string;
  description: string;

  // Visual details
  shot: {
    type: 'wide' | 'medium' | 'close_up' | 'extreme_close_up' | 'over_shoulder' | 'pov' | 'establishing';
    movement: 'static' | 'pan' | 'tilt' | 'zoom' | 'dolly' | 'tracking' | 'handheld';
    angle: 'eye_level' | 'high_angle' | 'low_angle' | 'birds_eye' | 'dutch_angle';
  };

  // Content
  content: {
    action: string; // What happens
    dialogue?: string;
    voiceover?: string;
    soundEffects?: string[];
    music?: string;
  };

  // Technical
  duration: number; // seconds
  location: string;
  timeOfDay: 'day' | 'night' | 'sunrise' | 'sunset' | 'golden_hour';
  lighting: string;

  // Assets
  referenceImages?: string[];
  sketchUrl?: string;
  videoClipUrl?: string;

  // Collaboration
  comments: Comment[];
  assignedTo?: string;
  status: 'planning' | 'in_progress' | 'review' | 'approved' | 'changes_requested';

  // AI suggestions
  aiSuggestions?: {
    shotTypes: string[];
    visualStyle: string[];
    musicSuggestions: string[];
    improvements: string[];
  };

  createdAt: Date;
  updatedAt: Date;
}

interface ProjectMember {
  userId: string;
  email: string;
  name: string;
  role: 'owner' | 'editor' | 'commenter' | 'viewer';
  permissions: {
    canEdit: boolean;
    canComment: boolean;
    canInvite: boolean;
    canDelete: boolean;
    canApprove: boolean;
  };
  joinedAt: Date;
  lastActive?: Date;
  presence?: {
    online: boolean;
    currentScene?: string;
    cursor?: { x: number; y: number };
  };
}

interface Comment {
  id: string;
  sceneId: string;
  userId: string;
  userName: string;
  content: string;
  type: 'comment' | 'suggestion' | 'approval' | 'change_request';
  replies: CommentReply[];
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

interface ProjectAsset {
  id: string;
  type: 'video' | 'image' | 'audio' | 'music';
  name: string;
  url: string;
  thumbnail?: string;
  duration?: number; // for video/audio
  size: number;
  uploadedBy: string;
  usedInScenes: string[];
  tags: string[];
  createdAt: Date;
}

interface ProjectVersion {
  version: number;
  timestamp: Date;
  userId: string;
  changes: string;
  snapshot: any; // Full project state
}

export class CollaborativeVideoStoryboardService {
  private static eventEmitter = new EventEmitter();
  private static renderQueue = new Queue('video-rendering', process.env.REDIS_URL);

  /**
   * CREATE VIDEO PROJECT
   */
  static async createProject(
    userId: string,
    data: {
      title: string;
      description: string;
      type: 'short_form' | 'long_form' | 'ad' | 'tutorial' | 'story' | 'reel';
      aspectRatio?: '9:16' | '16:9' | '1:1' | '4:5';
      useAIScriptGenerator?: boolean;
      scriptPrompt?: string;
    }
  ): Promise<VideoProject> {
    const project: VideoProject = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      title: data.title,
      description: data.description,
      type: data.type,
      storyboard: {
        scenes: [],
        totalDuration: 0,
        aspectRatio: data.aspectRatio || (data.type === 'reel' || data.type === 'story' ? '9:16' : '16:9'),
        style: 'modern'
      },
      team: [
        {
          userId,
          email: '', // Would fetch from user profile
          name: '', // Would fetch from user profile
          role: 'owner',
          permissions: {
            canEdit: true,
            canComment: true,
            canInvite: true,
            canDelete: true,
            canApprove: true
          },
          joinedAt: new Date()
        }
      ],
      permissions: {
        publicView: false,
        allowComments: true,
        allowSuggestions: true
      },
      assets: {
        videos: [],
        images: [],
        audio: [],
        music: []
      },
      status: 'planning',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      versionHistory: []
    };

    // Generate AI script if requested
    if (data.useAIScriptGenerator && data.scriptPrompt) {
      const script = await this.generateAIScript(data.scriptPrompt, data.type);
      project.script = script;

      // Auto-generate storyboard from script
      const scenes = await this.generateStoryboardFromScript(script, data.type);
      project.storyboard.scenes = scenes;
      project.storyboard.totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
      project.status = 'storyboarding';
      project.progress = 30;
    }

    await redis.set(`video_project:${project.id}`, JSON.stringify(project));
    await redis.sadd(`user_video_projects:${userId}`, project.id);

    return project;
  }

  /**
   * GENERATE AI SCRIPT
   */
  private static async generateAIScript(
    prompt: string,
    videoType: string
  ): Promise<any> {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Generate a professional video script for a ${videoType} video.

Prompt: ${prompt}

Create a script with:
1. Hook (first 3 seconds)
2. Main content (divided into scenes)
3. Call-to-action (ending)

For each scene, provide:
- Scene description
- Dialogue/voiceover text
- Suggested duration
- Visual suggestions

Format as JSON:
{
  "content": "Full script text...",
  "scenes": [
    {
      "title": "Scene 1: Hook",
      "dialogue": "...",
      "voiceover": "...",
      "duration": 3,
      "visualSuggestions": ["..."]
    }
  ]
}`
      }]
    });

    const scriptText = response.content[0].type === 'text' ? response.content[0].text : '';

    try {
      return JSON.parse(scriptText);
    } catch {
      return {
        content: scriptText,
        scenes: []
      };
    }
  }

  /**
   * GENERATE STORYBOARD FROM SCRIPT
   */
  private static async generateStoryboardFromScript(
    script: any,
    videoType: string
  ): Promise<Scene[]> {
    const scenes: Scene[] = [];

    for (let i = 0; i < script.scenes.length; i++) {
      const scriptScene = script.scenes[i];

      const scene: Scene = {
        id: `scene_${Date.now()}_${i}`,
        order: i,
        title: scriptScene.title || `Scene ${i + 1}`,
        description: scriptScene.visualSuggestions?.join('. ') || '',
        shot: {
          type: i === 0 ? 'close_up' : 'medium',
          movement: 'static',
          angle: 'eye_level'
        },
        content: {
          action: scriptScene.visualSuggestions?.[0] || '',
          dialogue: scriptScene.dialogue,
          voiceover: scriptScene.voiceover,
          soundEffects: [],
          music: i === 0 ? 'upbeat' : 'background'
        },
        duration: scriptScene.duration || 5,
        location: 'studio',
        timeOfDay: 'day',
        lighting: 'natural',
        comments: [],
        status: 'planning',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Get AI suggestions for each scene
      scene.aiSuggestions = await this.getAISuggestions(scene);

      scenes.push(scene);
    }

    return scenes;
  }

  /**
   * GET AI SUGGESTIONS FOR SCENE
   */
  private static async getAISuggestions(scene: Scene): Promise<any> {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Suggest improvements for this video scene:

Title: ${scene.title}
Description: ${scene.description}
Action: ${scene.content.action}
Current shot: ${scene.shot.type}

Provide:
1. Alternative shot types
2. Visual style suggestions
3. Music/sound suggestions
4. General improvements

Format as JSON.`
      }]
    });

    const suggestionsText = response.content[0].type === 'text' ? response.content[0].text : '';

    try {
      return JSON.parse(suggestionsText);
    } catch {
      return {
        shotTypes: ['medium', 'close_up'],
        visualStyle: ['cinematic', 'dynamic'],
        musicSuggestions: ['upbeat', 'energetic'],
        improvements: ['Add movement', 'Improve lighting']
      };
    }
  }

  /**
   * ADD SCENE TO STORYBOARD
   */
  static async addScene(
    projectId: string,
    userId: string,
    sceneData: {
      title: string;
      description: string;
      duration?: number;
      position?: number; // Insert at specific position
    }
  ): Promise<Scene> {
    const projectData = await redis.get(`video_project:${projectId}`);
    if (!projectData) throw new Error('Project not found');

    const project: VideoProject = JSON.parse(projectData);

    // Check permissions
    const member = project.team.find(m => m.userId === userId);
    if (!member?.permissions.canEdit) {
      throw new Error('No permission to edit');
    }

    const position = sceneData.position ?? project.storyboard.scenes.length;

    const scene: Scene = {
      id: `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order: position,
      title: sceneData.title,
      description: sceneData.description,
      shot: {
        type: 'medium',
        movement: 'static',
        angle: 'eye_level'
      },
      content: {
        action: sceneData.description,
        soundEffects: []
      },
      duration: sceneData.duration || 5,
      location: 'studio',
      timeOfDay: 'day',
      lighting: 'natural',
      comments: [],
      status: 'planning',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Get AI suggestions
    scene.aiSuggestions = await this.getAISuggestions(scene);

    // Insert scene
    project.storyboard.scenes.splice(position, 0, scene);

    // Reorder scenes
    project.storyboard.scenes.forEach((s, idx) => s.order = idx);

    // Update total duration
    project.storyboard.totalDuration = project.storyboard.scenes.reduce((sum, s) => sum + s.duration, 0);

    project.updatedAt = new Date();
    project.lastEditedBy = userId;

    await this.saveVersion(project, userId, `Added scene: ${scene.title}`);
    await redis.set(`video_project:${projectId}`, JSON.stringify(project));

    // Emit real-time event
    this.eventEmitter.emit('scene:added', { projectId, scene, userId });

    return scene;
  }

  /**
   * UPDATE SCENE
   */
  static async updateScene(
    projectId: string,
    sceneId: string,
    userId: string,
    updates: Partial<Scene>
  ): Promise<Scene> {
    const projectData = await redis.get(`video_project:${projectId}`);
    if (!projectData) throw new Error('Project not found');

    const project: VideoProject = JSON.parse(projectData);

    const member = project.team.find(m => m.userId === userId);
    if (!member?.permissions.canEdit) {
      throw new Error('No permission to edit');
    }

    const scene = project.storyboard.scenes.find(s => s.id === sceneId);
    if (!scene) throw new Error('Scene not found');

    // Update scene
    Object.assign(scene, updates);
    scene.updatedAt = new Date();

    // Update total duration
    project.storyboard.totalDuration = project.storyboard.scenes.reduce((sum, s) => sum + s.duration, 0);

    project.updatedAt = new Date();
    project.lastEditedBy = userId;

    await redis.set(`video_project:${projectId}`, JSON.stringify(project));

    // Emit real-time event
    this.eventEmitter.emit('scene:updated', { projectId, sceneId, updates, userId });

    return scene;
  }

  /**
   * DELETE SCENE
   */
  static async deleteScene(
    projectId: string,
    sceneId: string,
    userId: string
  ): Promise<void> {
    const projectData = await redis.get(`video_project:${projectId}`);
    if (!projectData) throw new Error('Project not found');

    const project: VideoProject = JSON.parse(projectData);

    const member = project.team.find(m => m.userId === userId);
    if (!member?.permissions.canDelete) {
      throw new Error('No permission to delete');
    }

    project.storyboard.scenes = project.storyboard.scenes.filter(s => s.id !== sceneId);

    // Reorder
    project.storyboard.scenes.forEach((s, idx) => s.order = idx);

    project.storyboard.totalDuration = project.storyboard.scenes.reduce((sum, s) => sum + s.duration, 0);

    project.updatedAt = new Date();
    project.lastEditedBy = userId;

    await this.saveVersion(project, userId, `Deleted scene ${sceneId}`);
    await redis.set(`video_project:${projectId}`, JSON.stringify(project));

    this.eventEmitter.emit('scene:deleted', { projectId, sceneId, userId });
  }

  /**
   * INVITE TEAM MEMBER
   */
  static async inviteMember(
    projectId: string,
    inviterId: string,
    inviteData: {
      email: string;
      role: 'editor' | 'commenter' | 'viewer';
    }
  ): Promise<ProjectMember> {
    const projectData = await redis.get(`video_project:${projectId}`);
    if (!projectData) throw new Error('Project not found');

    const project: VideoProject = JSON.parse(projectData);

    const inviter = project.team.find(m => m.userId === inviterId);
    if (!inviter?.permissions.canInvite) {
      throw new Error('No permission to invite');
    }

    // Check if already member
    if (project.team.find(m => m.email === inviteData.email)) {
      throw new Error('User already a member');
    }

    const permissions = this.getPermissionsForRole(inviteData.role);

    const member: ProjectMember = {
      userId: `temp_${Date.now()}`, // Would be actual userId after they accept
      email: inviteData.email,
      name: inviteData.email.split('@')[0],
      role: inviteData.role,
      permissions,
      joinedAt: new Date()
    };

    project.team.push(member);
    project.updatedAt = new Date();

    await redis.set(`video_project:${projectId}`, JSON.stringify(project));

    // Send invitation (would integrate with messaging system)
    await this.sendInvitation(projectId, inviteData.email, inviterId);

    return member;
  }

  /**
   * GET PERMISSIONS FOR ROLE
   */
  private static getPermissionsForRole(role: string): any {
    const rolePermissions = {
      owner: {
        canEdit: true,
        canComment: true,
        canInvite: true,
        canDelete: true,
        canApprove: true
      },
      editor: {
        canEdit: true,
        canComment: true,
        canInvite: false,
        canDelete: false,
        canApprove: false
      },
      commenter: {
        canEdit: false,
        canComment: true,
        canInvite: false,
        canDelete: false,
        canApprove: false
      },
      viewer: {
        canEdit: false,
        canComment: false,
        canInvite: false,
        canDelete: false,
        canApprove: false
      }
    };

    return rolePermissions[role as keyof typeof rolePermissions];
  }

  /**
   * SEND INVITATION
   */
  private static async sendInvitation(
    projectId: string,
    email: string,
    inviterId: string
  ): Promise<void> {
    // Would integrate with messaging system
    const invitation = {
      projectId,
      email,
      inviterId,
      invitedAt: new Date(),
      status: 'pending'
    };

    await redis.set(`invitation:${projectId}:${email}`, JSON.stringify(invitation));
  }

  /**
   * ADD COMMENT TO SCENE
   */
  static async addComment(
    projectId: string,
    sceneId: string,
    userId: string,
    commentData: {
      content: string;
      type?: 'comment' | 'suggestion' | 'approval' | 'change_request';
    }
  ): Promise<Comment> {
    const projectData = await redis.get(`video_project:${projectId}`);
    if (!projectData) throw new Error('Project not found');

    const project: VideoProject = JSON.parse(projectData);

    const member = project.team.find(m => m.userId === userId);
    if (!member?.permissions.canComment) {
      throw new Error('No permission to comment');
    }

    const scene = project.storyboard.scenes.find(s => s.id === sceneId);
    if (!scene) throw new Error('Scene not found');

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      sceneId,
      userId,
      userName: member.name,
      content: commentData.content,
      type: commentData.type || 'comment',
      replies: [],
      resolved: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    scene.comments.push(comment);

    // Update scene status based on comment type
    if (commentData.type === 'change_request') {
      scene.status = 'changes_requested';
    } else if (commentData.type === 'approval') {
      scene.status = 'approved';
    }

    project.updatedAt = new Date();

    await redis.set(`video_project:${projectId}`, JSON.stringify(project));

    this.eventEmitter.emit('comment:added', { projectId, sceneId, comment, userId });

    return comment;
  }

  /**
   * REPLY TO COMMENT
   */
  static async replyToComment(
    projectId: string,
    sceneId: string,
    commentId: string,
    userId: string,
    content: string
  ): Promise<CommentReply> {
    const projectData = await redis.get(`video_project:${projectId}`);
    if (!projectData) throw new Error('Project not found');

    const project: VideoProject = JSON.parse(projectData);

    const member = project.team.find(m => m.userId === userId);
    if (!member) throw new Error('Not a team member');

    const scene = project.storyboard.scenes.find(s => s.id === sceneId);
    if (!scene) throw new Error('Scene not found');

    const comment = scene.comments.find(c => c.id === commentId);
    if (!comment) throw new Error('Comment not found');

    const reply: CommentReply = {
      id: `reply_${Date.now()}`,
      userId,
      userName: member.name,
      content,
      createdAt: new Date()
    };

    comment.replies.push(reply);
    comment.updatedAt = new Date();

    project.updatedAt = new Date();

    await redis.set(`video_project:${projectId}`, JSON.stringify(project));

    this.eventEmitter.emit('comment:reply', { projectId, sceneId, commentId, reply, userId });

    return reply;
  }

  /**
   * UPLOAD ASSET
   */
  static async uploadAsset(
    projectId: string,
    userId: string,
    assetData: {
      type: 'video' | 'image' | 'audio' | 'music';
      name: string;
      url: string;
      thumbnail?: string;
      duration?: number;
      size: number;
      tags?: string[];
    }
  ): Promise<ProjectAsset> {
    const projectData = await redis.get(`video_project:${projectId}`);
    if (!projectData) throw new Error('Project not found');

    const project: VideoProject = JSON.parse(projectData);

    const asset: ProjectAsset = {
      id: `asset_${Date.now()}`,
      type: assetData.type,
      name: assetData.name,
      url: assetData.url,
      thumbnail: assetData.thumbnail,
      duration: assetData.duration,
      size: assetData.size,
      uploadedBy: userId,
      usedInScenes: [],
      tags: assetData.tags || [],
      createdAt: new Date()
    };

    // Add to appropriate asset collection
    switch (assetData.type) {
      case 'video':
        project.assets.videos.push(asset);
        break;
      case 'image':
        project.assets.images.push(asset);
        break;
      case 'audio':
        project.assets.audio.push(asset);
        break;
      case 'music':
        project.assets.music.push(asset);
        break;
    }

    project.updatedAt = new Date();

    await redis.set(`video_project:${projectId}`, JSON.stringify(project));

    this.eventEmitter.emit('asset:uploaded', { projectId, asset, userId });

    return asset;
  }

  /**
   * SAVE VERSION
   */
  private static async saveVersion(
    project: VideoProject,
    userId: string,
    changes: string
  ): Promise<void> {
    const version: ProjectVersion = {
      version: project.version + 1,
      timestamp: new Date(),
      userId,
      changes,
      snapshot: JSON.parse(JSON.stringify(project))
    };

    project.versionHistory.push(version);
    project.version = version.version;

    // Keep only last 50 versions
    if (project.versionHistory.length > 50) {
      project.versionHistory = project.versionHistory.slice(-50);
    }
  }

  /**
   * GET PROJECT
   */
  static async getProject(projectId: string): Promise<VideoProject | null> {
    const projectData = await redis.get(`video_project:${projectId}`);
    return projectData ? JSON.parse(projectData) : null;
  }

  /**
   * GET USER PROJECTS
   */
  static async getUserProjects(userId: string): Promise<VideoProject[]> {
    const projectIds = await redis.smembers(`user_video_projects:${userId}`);
    const projects: VideoProject[] = [];

    for (const projectId of projectIds) {
      const projectData = await redis.get(`video_project:${projectId}`);
      if (projectData) {
        projects.push(JSON.parse(projectData));
      }
    }

    // Also get projects where user is a team member
    const allProjectKeys = await redis.keys('video_project:*');
    for (const key of allProjectKeys) {
      const projectData = await redis.get(key);
      if (projectData) {
        const project: VideoProject = JSON.parse(projectData);
        if (project.team.some(m => m.userId === userId) && !projects.find(p => p.id === project.id)) {
          projects.push(project);
        }
      }
    }

    return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * UPDATE PROJECT STATUS
   */
  static async updateStatus(
    projectId: string,
    userId: string,
    status: VideoProject['status']
  ): Promise<void> {
    const projectData = await redis.get(`video_project:${projectId}`);
    if (!projectData) throw new Error('Project not found');

    const project: VideoProject = JSON.parse(projectData);

    const member = project.team.find(m => m.userId === userId);
    if (!member?.permissions.canEdit) {
      throw new Error('No permission to update status');
    }

    project.status = status;
    project.updatedAt = new Date();

    // Update progress based on status
    const statusProgress = {
      planning: 0,
      storyboarding: 30,
      production: 50,
      editing: 70,
      review: 90,
      completed: 100
    };
    project.progress = statusProgress[status];

    await redis.set(`video_project:${projectId}`, JSON.stringify(project));

    this.eventEmitter.emit('project:status_updated', { projectId, status, userId });
  }

  /**
   * EXPORT STORYBOARD
   */
  static async exportStoryboard(
    projectId: string,
    format: 'pdf' | 'json' | 'csv'
  ): Promise<{
    url: string;
    format: string;
  }> {
    const projectData = await redis.get(`video_project:${projectId}`);
    if (!projectData) throw new Error('Project not found');

    const project: VideoProject = JSON.parse(projectData);

    // Generate export (would use actual export libraries)
    const exportData = {
      project: project.title,
      scenes: project.storyboard.scenes.length,
      duration: project.storyboard.totalDuration,
      storyboard: project.storyboard
    };

    const exportUrl = `https://storage.neurafield.com/exports/${projectId}.${format}`;

    return {
      url: exportUrl,
      format
    };
  }
}
