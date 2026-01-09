/**
 * Video Editing Service - REVOLUTIONARY FEATURES
 * Advanced video manipulation: trim, merge, effects, transitions, watermarks
 */

import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../config/logger';
import S3Service from './s3.service';
import axios from 'axios';

const TEMP_DIR = process.env.TEMP_DIR || '/tmp/neurafield';

export interface TrimOptions {
  videoUrl: string;
  startTime: number; // seconds
  endTime: number; // seconds
}

export interface MergeOptions {
  videoUrls: string[];
  transition?: 'fade' | 'dissolve' | 'wipe' | 'none';
  transitionDuration?: number; // seconds
}

export interface EffectsOptions {
  videoUrl: string;
  effects: Array<{
    type: 'blur' | 'brightness' | 'contrast' | 'saturation' | 'grayscale' | 'sepia' | 'vignette' | 'sharpen';
    intensity?: number; // 0-1
  }>;
}

export interface WatermarkOptions {
  videoUrl: string;
  watermarkUrl?: string;
  text?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity?: number; // 0-1
  scale?: number; // 0-1
}

export interface ResizeOptions {
  videoUrl: string;
  width?: number;
  height?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '21:9';
  format?: 'mp4' | 'webm' | 'mov';
  quality?: 'low' | 'medium' | 'high' | 'ultra';
}

export interface SpeedOptions {
  videoUrl: string;
  speed: number; // 0.25, 0.5, 1, 1.5, 2, etc.
}

export interface AudioOptions {
  videoUrl: string;
  audioUrl?: string;
  volume?: number; // 0-1
  removeOriginalAudio?: boolean;
}

export class VideoEditingService {
  /**
   * Initialize temp directory
   */
  static async init() {
    try {
      await fs.mkdir(TEMP_DIR, { recursive: true });
      logger.info('Video editing service initialized');
    } catch (error) {
      logger.error('Failed to initialize video editing service:', error);
    }
  }

  /**
   * Trim video to specific time range
   */
  static async trimVideo(options: TrimOptions): Promise<string> {
    const jobId = uuidv4();
    const inputPath = path.join(TEMP_DIR, `${jobId}-input.mp4`);
    const outputPath = path.join(TEMP_DIR, `${jobId}-trimmed.mp4`);

    try {
      // Download video
      await this.downloadFile(options.videoUrl, inputPath);

      // Trim video
      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .setStartTime(options.startTime)
          .setDuration(options.endTime - options.startTime)
          .output(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });

      // Upload to S3
      const result = await S3Service.uploadFile(`trimmed-${jobId}.mp4`, {
        localFilePath: outputPath,
        contentType: 'video/mp4',
      });

      // Cleanup
      await this.cleanup([inputPath, outputPath]);

      return result.url;
    } catch (error: any) {
      logger.error('Video trim failed:', error);
      await this.cleanup([inputPath, outputPath]);
      throw new Error(`Failed to trim video: ${error.message}`);
    }
  }

  /**
   * Merge multiple videos with transitions
   */
  static async mergeVideos(options: MergeOptions): Promise<string> {
    const jobId = uuidv4();
    const inputPaths: string[] = [];
    const outputPath = path.join(TEMP_DIR, `${jobId}-merged.mp4`);

    try {
      // Download all videos
      for (let i = 0; i < options.videoUrls.length; i++) {
        const inputPath = path.join(TEMP_DIR, `${jobId}-input-${i}.mp4`);
        await this.downloadFile(options.videoUrls[i], inputPath);
        inputPaths.push(inputPath);
      }

      // Create concat file for ffmpeg
      const concatFilePath = path.join(TEMP_DIR, `${jobId}-concat.txt`);
      const concatContent = inputPaths.map(p => `file '${p}'`).join('\n');
      await fs.writeFile(concatFilePath, concatContent);

      // Merge videos
      await new Promise<void>((resolve, reject) => {
        const command = ffmpeg()
          .input(concatFilePath)
          .inputOptions(['-f concat', '-safe 0'])
          .outputOptions(['-c copy'])
          .output(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err));

        command.run();
      });

      // Upload to S3
      const result = await S3Service.uploadFile(`merged-${jobId}.mp4`, {
        localFilePath: outputPath,
        contentType: 'video/mp4',
      });

      // Cleanup
      await this.cleanup([...inputPaths, concatFilePath, outputPath]);

      return result.url;
    } catch (error: any) {
      logger.error('Video merge failed:', error);
      await this.cleanup([...inputPaths, outputPath]);
      throw new Error(`Failed to merge videos: ${error.message}`);
    }
  }

  /**
   * Apply visual effects to video
   */
  static async applyEffects(options: EffectsOptions): Promise<string> {
    const jobId = uuidv4();
    const inputPath = path.join(TEMP_DIR, `${jobId}-input.mp4`);
    const outputPath = path.join(TEMP_DIR, `${jobId}-effects.mp4`);

    try {
      await this.downloadFile(options.videoUrl, inputPath);

      // Build filter string
      const filters: string[] = [];
      for (const effect of options.effects) {
        const intensity = effect.intensity || 0.5;

        switch (effect.type) {
          case 'blur':
            filters.push(`boxblur=${intensity * 10}:${intensity * 10}`);
            break;
          case 'brightness':
            filters.push(`eq=brightness=${intensity}`);
            break;
          case 'contrast':
            filters.push(`eq=contrast=${intensity * 2}`);
            break;
          case 'saturation':
            filters.push(`eq=saturation=${intensity * 2}`);
            break;
          case 'grayscale':
            filters.push('hue=s=0');
            break;
          case 'sepia':
            filters.push('colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131');
            break;
          case 'vignette':
            filters.push(`vignette=PI/4`);
            break;
          case 'sharpen':
            filters.push('unsharp=5:5:1.0:5:5:0.0');
            break;
        }
      }

      const filterString = filters.join(',');

      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .videoFilters(filterString)
          .output(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });

      const result = await S3Service.uploadFile(`effects-${jobId}.mp4`, {
        localFilePath: outputPath,
        contentType: 'video/mp4',
      });

      await this.cleanup([inputPath, outputPath]);
      return result.url;
    } catch (error: any) {
      logger.error('Apply effects failed:', error);
      await this.cleanup([inputPath, outputPath]);
      throw new Error(`Failed to apply effects: ${error.message}`);
    }
  }

  /**
   * Add watermark to video
   */
  static async addWatermark(options: WatermarkOptions): Promise<string> {
    const jobId = uuidv4();
    const inputPath = path.join(TEMP_DIR, `${jobId}-input.mp4`);
    const outputPath = path.join(TEMP_DIR, `${jobId}-watermarked.mp4`);

    try {
      await this.downloadFile(options.videoUrl, inputPath);

      let overlayFilter = '';

      if (options.watermarkUrl) {
        // Image watermark
        const watermarkPath = path.join(TEMP_DIR, `${jobId}-watermark.png`);
        await this.downloadFile(options.watermarkUrl, watermarkPath);

        const position = this.getWatermarkPosition(options.position);
        overlayFilter = `overlay=${position}`;

        await new Promise<void>((resolve, reject) => {
          ffmpeg(inputPath)
            .input(watermarkPath)
            .complexFilter([overlayFilter])
            .output(outputPath)
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .run();
        });

        await fs.unlink(watermarkPath);
      } else if (options.text) {
        // Text watermark
        const position = this.getTextPosition(options.position);
        const fontSize = 24;
        const opacity = options.opacity || 0.7;

        await new Promise<void>((resolve, reject) => {
          ffmpeg(inputPath)
            .videoFilters(`drawtext=text='${options.text}':${position}:fontsize=${fontSize}:fontcolor=white@${opacity}`)
            .output(outputPath)
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .run();
        });
      }

      const result = await S3Service.uploadFile(`watermarked-${jobId}.mp4`, {
        localFilePath: outputPath,
        contentType: 'video/mp4',
      });

      await this.cleanup([inputPath, outputPath]);
      return result.url;
    } catch (error: any) {
      logger.error('Add watermark failed:', error);
      await this.cleanup([inputPath, outputPath]);
      throw new Error(`Failed to add watermark: ${error.message}`);
    }
  }

  /**
   * Resize/Reformat video for different platforms
   */
  static async resizeVideo(options: ResizeOptions): Promise<string> {
    const jobId = uuidv4();
    const inputPath = path.join(TEMP_DIR, `${jobId}-input.mp4`);
    const format = options.format || 'mp4';
    const outputPath = path.join(TEMP_DIR, `${jobId}-resized.${format}`);

    try {
      await this.downloadFile(options.videoUrl, inputPath);

      let width: number | undefined = options.width;
      let height: number | undefined = options.height;

      // Calculate dimensions from aspect ratio
      if (options.aspectRatio && !width && !height) {
        const ratios: Record<string, [number, number]> = {
          '16:9': [1920, 1080],
          '9:16': [1080, 1920],
          '1:1': [1080, 1080],
          '4:3': [1440, 1080],
          '21:9': [2560, 1080],
        };
        [width, height] = ratios[options.aspectRatio];
      }

      const quality = this.getQualitySettings(options.quality || 'high');

      await new Promise<void>((resolve, reject) => {
        const command = ffmpeg(inputPath);

        if (width && height) {
          command.size(`${width}x${height}`);
        }

        command
          .videoBitrate(quality.videoBitrate)
          .audioBitrate(quality.audioBitrate)
          .output(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });

      const result = await S3Service.uploadFile(`resized-${jobId}.${format}`, {
        localFilePath: outputPath,
        contentType: `video/${format}`,
      });

      await this.cleanup([inputPath, outputPath]);
      return result.url;
    } catch (error: any) {
      logger.error('Resize video failed:', error);
      await this.cleanup([inputPath, outputPath]);
      throw new Error(`Failed to resize video: ${error.message}`);
    }
  }

  /**
   * Change video playback speed
   */
  static async changeSpeed(options: SpeedOptions): Promise<string> {
    const jobId = uuidv4();
    const inputPath = path.join(TEMP_DIR, `${jobId}-input.mp4`);
    const outputPath = path.join(TEMP_DIR, `${jobId}-speed.mp4`);

    try {
      await this.downloadFile(options.videoUrl, inputPath);

      const videoSpeed = 1 / options.speed;
      const audioSpeed = options.speed;

      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .videoFilters(`setpts=${videoSpeed}*PTS`)
          .audioFilters(`atempo=${audioSpeed}`)
          .output(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });

      const result = await S3Service.uploadFile(`speed-${jobId}.mp4`, {
        localFilePath: outputPath,
        contentType: 'video/mp4',
      });

      await this.cleanup([inputPath, outputPath]);
      return result.url;
    } catch (error: any) {
      logger.error('Change speed failed:', error);
      await this.cleanup([inputPath, outputPath]);
      throw new Error(`Failed to change speed: ${error.message}`);
    }
  }

  /**
   * Replace or add audio to video
   */
  static async replaceAudio(options: AudioOptions): Promise<string> {
    const jobId = uuidv4();
    const inputPath = path.join(TEMP_DIR, `${jobId}-input.mp4`);
    const outputPath = path.join(TEMP_DIR, `${jobId}-audio.mp4`);

    try {
      await this.downloadFile(options.videoUrl, inputPath);

      const command = ffmpeg(inputPath);

      if (options.audioUrl) {
        const audioPath = path.join(TEMP_DIR, `${jobId}-audio.mp3`);
        await this.downloadFile(options.audioUrl, audioPath);
        command.input(audioPath);
      }

      if (options.removeOriginalAudio) {
        command.noAudio();
      }

      if (options.volume) {
        command.audioFilters(`volume=${options.volume}`);
      }

      await new Promise<void>((resolve, reject) => {
        command
          .output(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });

      const result = await S3Service.uploadFile(`audio-${jobId}.mp4`, {
        localFilePath: outputPath,
        contentType: 'video/mp4',
      });

      await this.cleanup([inputPath, outputPath]);
      return result.url;
    } catch (error: any) {
      logger.error('Replace audio failed:', error);
      await this.cleanup([inputPath, outputPath]);
      throw new Error(`Failed to replace audio: ${error.message}`);
    }
  }

  /**
   * Download file from URL
   */
  private static async downloadFile(url: string, outputPath: string): Promise<void> {
    const response = await axios.get(url, { responseType: 'stream' });
    const writer = require('fs').createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  /**
   * Get watermark position coordinates
   */
  private static getWatermarkPosition(position: string): string {
    const positions: Record<string, string> = {
      'top-left': '10:10',
      'top-right': 'W-w-10:10',
      'bottom-left': '10:H-h-10',
      'bottom-right': 'W-w-10:H-h-10',
      'center': '(W-w)/2:(H-h)/2',
    };
    return positions[position] || positions['bottom-right'];
  }

  /**
   * Get text position for drawtext filter
   */
  private static getTextPosition(position: string): string {
    const positions: Record<string, string> = {
      'top-left': 'x=10:y=10',
      'top-right': 'x=W-tw-10:y=10',
      'bottom-left': 'x=10:y=H-th-10',
      'bottom-right': 'x=W-tw-10:y=H-th-10',
      'center': 'x=(W-tw)/2:y=(H-th)/2',
    };
    return positions[position] || positions['bottom-right'];
  }

  /**
   * Get quality settings for encoding
   */
  private static getQualitySettings(quality: string) {
    const settings: Record<string, { videoBitrate: string; audioBitrate: string }> = {
      low: { videoBitrate: '500k', audioBitrate: '64k' },
      medium: { videoBitrate: '1500k', audioBitrate: '128k' },
      high: { videoBitrate: '3000k', audioBitrate: '192k' },
      ultra: { videoBitrate: '8000k', audioBitrate: '320k' },
    };
    return settings[quality] || settings.high;
  }

  /**
   * Cleanup temporary files
   */
  private static async cleanup(paths: string[]): Promise<void> {
    for (const filePath of paths) {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        // Ignore errors
      }
    }
  }
}

// Initialize on import
VideoEditingService.init();

export default VideoEditingService;
