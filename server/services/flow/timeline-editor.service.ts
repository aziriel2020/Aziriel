/**
 * TIMELINE EDITOR SERVICE - Non-Linear Video Editing
 *
 * Professional timeline-based editing system
 * - Multi-track timeline
 * - Keyframe animation
 * - Transitions and effects
 * - Audio mixing
 * - Real-time preview
 */

import { prisma } from '../../config/database';

export interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'subtitle' | 'effect';
  muted?: boolean;
  locked?: boolean;
  clips: TimelineClip[];
  height: number; // pixels in UI
  color?: string;
}

export interface TimelineClip {
  id: string;
  assetId?: string;
  assetUrl?: string;
  type: 'video' | 'audio' | 'image' | 'text' | 'effect';
  name: string;
  startTime: number; // ms on timeline
  duration: number; // ms
  trimStart?: number; // trim from source
  trimEnd?: number;
  speed?: number; // playback speed multiplier
  volume?: number; // 0-1
  transform?: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
    opacity: number;
  };
  filters?: Array<{
    type: string;
    settings: Record<string, any>;
  }>;
  keyframes?: Array<{
    time: number;
    property: string;
    value: any;
    easing?: string;
  }>;
  transition?: {
    type: 'fade' | 'dissolve' | 'wipe' | 'slide' | 'zoom';
    duration: number;
  };
}

export interface Timeline {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  tracks: TimelineTrack[];
  duration: number;
  zoom: number;
  playheadPosition: number;
  settings: {
    resolution: string;
    frameRate: number;
    aspectRatio: string;
    audioSampleRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class TimelineEditorService {
  /**
   * Create new timeline
   */
  static async createTimeline(data: {
    projectId: string;
    userId: string;
    name: string;
    settings?: any;
  }): Promise<Timeline> {
    const timeline = await prisma.timeline.create({
      data: {
        projectId: data.projectId,
        userId: data.userId,
        name: data.name,
        tracks: this.createDefaultTracks(),
        duration: 0,
        zoom: 1,
        playheadPosition: 0,
        settings: data.settings || {
          resolution: '1080p',
          frameRate: 24,
          aspectRatio: '16:9',
          audioSampleRate: 48000,
        },
      },
    });

    return timeline as any;
  }

  /**
   * Create default track structure
   */
  private static createDefaultTracks(): TimelineTrack[] {
    return [
      {
        id: 'track_video_1',
        name: 'Video 1',
        type: 'video',
        clips: [],
        height: 120,
        color: '#667eea',
      },
      {
        id: 'track_video_2',
        name: 'Video 2',
        type: 'video',
        clips: [],
        height: 120,
        color: '#764ba2',
      },
      {
        id: 'track_audio_1',
        name: 'Audio 1',
        type: 'audio',
        clips: [],
        height: 80,
        color: '#f093fb',
      },
      {
        id: 'track_subtitle_1',
        name: 'Subtitles',
        type: 'subtitle',
        clips: [],
        height: 60,
        color: '#4facfe',
      },
    ];
  }

  /**
   * Add clip to track
   */
  static async addClip(
    timelineId: string,
    trackId: string,
    clip: Omit<TimelineClip, 'id'>
  ): Promise<TimelineClip> {
    const timeline = await prisma.timeline.findUnique({
      where: { id: timelineId },
    });

    if (!timeline) {
      throw new Error('Timeline not found');
    }

    const tracks = (timeline.tracks as TimelineTrack[]) || [];
    const track = tracks.find((t) => t.id === trackId);

    if (!track) {
      throw new Error('Track not found');
    }

    const newClip: TimelineClip = {
      id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...clip,
    };

    track.clips.push(newClip);

    // Update timeline duration
    const maxDuration = Math.max(
      ...tracks.flatMap((t) =>
        t.clips.map((c) => c.startTime + c.duration)
      ),
      timeline.duration as number
    );

    await prisma.timeline.update({
      where: { id: timelineId },
      data: {
        tracks,
        duration: maxDuration,
        updatedAt: new Date(),
      },
    });

    return newClip;
  }

  /**
   * Update clip properties
   */
  static async updateClip(
    timelineId: string,
    trackId: string,
    clipId: string,
    updates: Partial<TimelineClip>
  ): Promise<void> {
    const timeline = await prisma.timeline.findUnique({
      where: { id: timelineId },
    });

    if (!timeline) {
      throw new Error('Timeline not found');
    }

    const tracks = (timeline.tracks as TimelineTrack[]) || [];
    const track = tracks.find((t) => t.id === trackId);

    if (!track) {
      throw new Error('Track not found');
    }

    const clipIndex = track.clips.findIndex((c) => c.id === clipId);

    if (clipIndex === -1) {
      throw new Error('Clip not found');
    }

    track.clips[clipIndex] = {
      ...track.clips[clipIndex],
      ...updates,
    };

    await prisma.timeline.update({
      where: { id: timelineId },
      data: {
        tracks,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Add keyframe to clip
   */
  static async addKeyframe(
    timelineId: string,
    trackId: string,
    clipId: string,
    keyframe: {
      time: number;
      property: string;
      value: any;
      easing?: string;
    }
  ): Promise<void> {
    const timeline = await prisma.timeline.findUnique({
      where: { id: timelineId },
    });

    if (!timeline) {
      throw new Error('Timeline not found');
    }

    const tracks = (timeline.tracks as TimelineTrack[]) || [];
    const track = tracks.find((t) => t.id === trackId);
    const clip = track?.clips.find((c) => c.id === clipId);

    if (!clip) {
      throw new Error('Clip not found');
    }

    if (!clip.keyframes) {
      clip.keyframes = [];
    }

    clip.keyframes.push(keyframe);
    clip.keyframes.sort((a, b) => a.time - b.time);

    await prisma.timeline.update({
      where: { id: timelineId },
      data: {
        tracks,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Split clip at playhead position
   */
  static async splitClip(
    timelineId: string,
    trackId: string,
    clipId: string,
    splitTime: number
  ): Promise<{ clip1: TimelineClip; clip2: TimelineClip }> {
    const timeline = await prisma.timeline.findUnique({
      where: { id: timelineId },
    });

    if (!timeline) {
      throw new Error('Timeline not found');
    }

    const tracks = (timeline.tracks as TimelineTrack[]) || [];
    const track = tracks.find((t) => t.id === trackId);
    const clipIndex = track?.clips.findIndex((c) => c.id === clipId);

    if (clipIndex === undefined || clipIndex === -1 || !track) {
      throw new Error('Clip not found');
    }

    const originalClip = track.clips[clipIndex];
    const relativeTime = splitTime - originalClip.startTime;

    if (relativeTime <= 0 || relativeTime >= originalClip.duration) {
      throw new Error('Invalid split time');
    }

    const clip1: TimelineClip = {
      ...originalClip,
      id: `clip_${Date.now()}_1`,
      duration: relativeTime,
      trimEnd: (originalClip.trimEnd || 0) + (originalClip.duration - relativeTime),
    };

    const clip2: TimelineClip = {
      ...originalClip,
      id: `clip_${Date.now()}_2`,
      startTime: splitTime,
      duration: originalClip.duration - relativeTime,
      trimStart: (originalClip.trimStart || 0) + relativeTime,
    };

    track.clips.splice(clipIndex, 1, clip1, clip2);

    await prisma.timeline.update({
      where: { id: timelineId },
      data: {
        tracks,
        updatedAt: new Date(),
      },
    });

    return { clip1, clip2 };
  }

  /**
   * Delete clip
   */
  static async deleteClip(
    timelineId: string,
    trackId: string,
    clipId: string
  ): Promise<void> {
    const timeline = await prisma.timeline.findUnique({
      where: { id: timelineId },
    });

    if (!timeline) {
      throw new Error('Timeline not found');
    }

    const tracks = (timeline.tracks as TimelineTrack[]) || [];
    const track = tracks.find((t) => t.id === trackId);

    if (!track) {
      throw new Error('Track not found');
    }

    track.clips = track.clips.filter((c) => c.id !== clipId);

    await prisma.timeline.update({
      where: { id: timelineId },
      data: {
        tracks,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Add track
   */
  static async addTrack(
    timelineId: string,
    track: Omit<TimelineTrack, 'id' | 'clips'>
  ): Promise<TimelineTrack> {
    const timeline = await prisma.timeline.findUnique({
      where: { id: timelineId },
    });

    if (!timeline) {
      throw new Error('Timeline not found');
    }

    const newTrack: TimelineTrack = {
      id: `track_${track.type}_${Date.now()}`,
      clips: [],
      ...track,
    };

    const tracks = [...((timeline.tracks as TimelineTrack[]) || []), newTrack];

    await prisma.timeline.update({
      where: { id: timelineId },
      data: {
        tracks,
        updatedAt: new Date(),
      },
    });

    return newTrack;
  }

  /**
   * Render timeline to video
   */
  static async renderTimeline(
    timelineId: string,
    options: {
      quality?: 'draft' | 'preview' | 'final';
      format?: 'mp4' | 'mov' | 'webm';
      codec?: string;
      bitrate?: string;
    }
  ): Promise<{ jobId: string }> {
    const timeline = await prisma.timeline.findUnique({
      where: { id: timelineId },
    });

    if (!timeline) {
      throw new Error('Timeline not found');
    }

    const job = await prisma.job.create({
      data: {
        userId: timeline.userId,
        type: 'VIDEO_PROCESSING',
        status: 'QUEUED',
        priority: options.quality === 'final' ? 10 : 5,
        input: {
          type: 'timeline-render',
          timelineId,
          timeline: timeline.tracks,
          settings: timeline.settings,
          options,
        },
        progress: 0,
      },
    });

    return { jobId: job.id };
  }
}
