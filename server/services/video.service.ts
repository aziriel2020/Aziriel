/**
 * Video Processing Service - FFmpeg Integration
 * Real video editing, transcoding, and manipulation
 */

import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { StorageService } from './storage.service';
import logger from './logger.service';
import { prisma } from '../config/database';

const execAsync = promisify(exec);

export class VideoService {
  /**
   * Get video metadata
   */
  static async getMetadata(videoPath: string): Promise<ffmpeg.FfprobeData> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata);
      });
    });
  }

  /**
   * Transcode video to different format/quality
   */
  static async transcodeVideo(
    inputPath: string,
    outputPath: string,
    options?: {
      format?: string;
      resolution?: '480p' | '720p' | '1080p' | '4k';
      fps?: number;
      bitrate?: string;
      codec?: string;
    }
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath);

      // Set resolution
      const resolutions = {
        '480p': '854x480',
        '720p': '1280x720',
        '1080p': '1920x1080',
        '4k': '3840x2160',
      };

      if (options?.resolution) {
        command = command.size(resolutions[options.resolution]);
      }

      // Set codec
      if (options?.codec) {
        command = command.videoCodec(options.codec);
      } else {
        command = command.videoCodec('libx264');
      }

      // Set fps
      if (options?.fps) {
        command = command.fps(options.fps);
      }

      // Set bitrate
      if (options?.bitrate) {
        command = command.videoBitrate(options.bitrate);
      }

      // Set format
      if (options?.format) {
        command = command.format(options.format);
      }

      command
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  /**
   * Extract audio from video
   */
  static async extractAudio(
    videoPath: string,
    outputPath: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate('192k')
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  /**
   * Add audio to video
   */
  static async addAudio(
    videoPath: string,
    audioPath: string,
    outputPath: string,
    options?: {
      audioVolume?: number; // 0-1
      videoVolume?: number; // 0-1
      fadeIn?: number; // seconds
      fadeOut?: number; // seconds
    }
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg()
        .input(videoPath)
        .input(audioPath);

      const filters: string[] = [];

      // Audio volume adjustments
      if (options?.audioVolume !== undefined) {
        filters.push(`[1:a]volume=${options.audioVolume}[a1]`);
      }
      if (options?.videoVolume !== undefined) {
        filters.push(`[0:a]volume=${options.videoVolume}[a0]`);
      }

      // Fade effects
      if (options?.fadeIn) {
        filters.push(`afade=t=in:st=0:d=${options.fadeIn}`);
      }
      if (options?.fadeOut) {
        filters.push(`afade=t=out:st=${options.fadeOut}:d=1`);
      }

      if (filters.length > 0) {
        command = command.complexFilter(filters);
      }

      command
        .outputOptions('-map 0:v')
        .outputOptions('-map 1:a')
        .outputOptions('-shortest')
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  /**
   * Trim video
   */
  static async trimVideo(
    videoPath: string,
    outputPath: string,
    startTime: number, // seconds
    duration: number // seconds
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .setStartTime(startTime)
        .setDuration(duration)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  /**
   * Concatenate multiple videos
   */
  static async concatenateVideos(
    videoPaths: string[],
    outputPath: string
  ): Promise<string> {
    // Create concat file
    const concatFile = path.join('/tmp', `concat-${Date.now()}.txt`);
    const fileContent = videoPaths.map((p) => `file '${p}'`).join('\n');
    await fs.writeFile(concatFile, fileContent);

    try {
      await execAsync(
        `ffmpeg -f concat -safe 0 -i "${concatFile}" -c copy "${outputPath}"`
      );
      await fs.unlink(concatFile);
      return outputPath;
    } catch (error) {
      await fs.unlink(concatFile);
      throw error;
    }
  }

  /**
   * Add text overlay to video
   */
  static async addTextOverlay(
    videoPath: string,
    outputPath: string,
    text: string,
    options?: {
      x?: number;
      y?: number;
      fontSize?: number;
      fontColor?: string;
      boxColor?: string;
      startTime?: number;
      duration?: number;
    }
  ): Promise<string> {
    const {
      x = 10,
      y = 10,
      fontSize = 24,
      fontColor = 'white',
      boxColor = 'black@0.5',
      startTime = 0,
      duration,
    } = options || {};

    const escapedText = text.replace(/'/g, "'\\''");
    let drawtext = `drawtext=text='${escapedText}':x=${x}:y=${y}:fontsize=${fontSize}:fontcolor=${fontColor}:box=1:boxcolor=${boxColor}:boxborderw=5`;

    if (duration) {
      drawtext += `:enable='between(t,${startTime},${startTime + duration})'`;
    }

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .videoFilters(drawtext)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  /**
   * Add watermark to video
   */
  static async addWatermark(
    videoPath: string,
    watermarkPath: string,
    outputPath: string,
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'bottom-right',
    opacity: number = 0.5
  ): Promise<string> {
    const positions = {
      'top-left': '10:10',
      'top-right': 'W-w-10:10',
      'bottom-left': '10:H-h-10',
      'bottom-right': 'W-w-10:H-h-10',
    };

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .input(watermarkPath)
        .complexFilter([
          `[1:v]format=rgba,colorchannelmixer=aa=${opacity}[logo]`,
          `[0:v][logo]overlay=${positions[position]}`,
        ])
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  /**
   * Generate video thumbnail
   */
  static async generateThumbnail(
    videoPath: string,
    outputPath: string,
    timeInSeconds: number = 1
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          count: 1,
          timestamps: [timeInSeconds],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '1920x1080',
        })
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err));
    });
  }

  /**
   * Generate multiple thumbnails at intervals
   */
  static async generateThumbnails(
    videoPath: string,
    outputDir: string,
    count: number = 5
  ): Promise<string[]> {
    const metadata = await this.getMetadata(videoPath);
    const duration = metadata.format.duration || 0;
    const interval = duration / (count + 1);

    const timestamps = Array.from({ length: count }, (_, i) => (i + 1) * interval);

    return new Promise((resolve, reject) => {
      const filenames: string[] = [];

      ffmpeg(videoPath)
        .screenshots({
          count,
          timestamps,
          filename: 'thumb-%i.jpg',
          folder: outputDir,
          size: '1920x1080',
        })
        .on('end', () => {
          const paths = Array.from(
            { length: count },
            (_, i) => path.join(outputDir, `thumb-${i + 1}.jpg`)
          );
          resolve(paths);
        })
        .on('error', (err) => reject(err));
    });
  }

  /**
   * Apply video filters
   */
  static async applyFilters(
    videoPath: string,
    outputPath: string,
    filters: {
      brightness?: number; // -1 to 1
      contrast?: number; // -1 to 1
      saturation?: number; // -3 to 3
      blur?: number; // 0-10
      sharpen?: boolean;
      grayscale?: boolean;
      vignette?: boolean;
    }
  ): Promise<string> {
    const filterArray: string[] = [];

    if (filters.brightness !== undefined) {
      filterArray.push(`eq=brightness=${filters.brightness}`);
    }
    if (filters.contrast !== undefined) {
      filterArray.push(`eq=contrast=${filters.contrast + 1}`);
    }
    if (filters.saturation !== undefined) {
      filterArray.push(`eq=saturation=${filters.saturation + 1}`);
    }
    if (filters.blur) {
      filterArray.push(`boxblur=${filters.blur}:1`);
    }
    if (filters.sharpen) {
      filterArray.push('unsharp=5:5:1.0:5:5:0.0');
    }
    if (filters.grayscale) {
      filterArray.push('hue=s=0');
    }
    if (filters.vignette) {
      filterArray.push('vignette');
    }

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .videoFilters(filterArray.join(','))
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  /**
   * Create video from images
   */
  static async createVideoFromImages(
    imagePaths: string[],
    outputPath: string,
    options?: {
      fps?: number;
      duration?: number; // per image in seconds
      transition?: 'fade' | 'dissolve' | 'none';
    }
  ): Promise<string> {
    const fps = options?.fps || 30;
    const duration = options?.duration || 3;

    // Create concat file with duration
    const concatFile = path.join('/tmp', `images-${Date.now()}.txt`);
    const fileContent = imagePaths
      .map((p) => `file '${p}'\nduration ${duration}`)
      .join('\n');
    await fs.writeFile(concatFile, fileContent);

    try {
      let command = `ffmpeg -f concat -safe 0 -i "${concatFile}" -vsync vfr -pix_fmt yuv420p -r ${fps}`;

      if (options?.transition === 'fade') {
        command += ` -vf "fade=t=in:st=0:d=0.5,fade=t=out:st=${duration - 0.5}:d=0.5"`;
      }

      command += ` "${outputPath}"`;

      await execAsync(command);
      await fs.unlink(concatFile);
      return outputPath;
    } catch (error) {
      await fs.unlink(concatFile);
      throw error;
    }
  }

  /**
   * Speed up or slow down video
   */
  static async changeSpeed(
    videoPath: string,
    outputPath: string,
    speed: number // 0.5 = half speed, 2 = double speed
  ): Promise<string> {
    const videoSpeed = 1 / speed;
    const audioSpeed = speed;

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .videoFilters(`setpts=${videoSpeed}*PTS`)
        .audioFilters(`atempo=${audioSpeed}`)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  /**
   * Reverse video
   */
  static async reverseVideo(
    videoPath: string,
    outputPath: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .videoFilters('reverse')
        .audioFilters('areverse')
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  /**
   * Create video loop
   */
  static async loopVideo(
    videoPath: string,
    outputPath: string,
    loopCount: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .inputOptions([`-stream_loop ${loopCount - 1}`])
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  /**
   * Convert to GIF
   */
  static async convertToGif(
    videoPath: string,
    outputPath: string,
    options?: {
      fps?: number;
      width?: number;
      startTime?: number;
      duration?: number;
    }
  ): Promise<string> {
    const { fps = 15, width = 480, startTime, duration } = options || {};

    return new Promise((resolve, reject) => {
      let command = ffmpeg(videoPath);

      if (startTime !== undefined) {
        command = command.setStartTime(startTime);
      }

      if (duration !== undefined) {
        command = command.setDuration(duration);
      }

      command
        .fps(fps)
        .size(`${width}x?`)
        .format('gif')
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }
}
