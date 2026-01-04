/**
 * VIDEO PROCESSING SERVICE - FFmpeg-based Video Pipeline
 *
 * Core video processing operations
 * - Transcoding and format conversion
 * - Thumbnail generation
 * - Video concatenation
 * - Trimming and splitting
 * - Watermarking
 * - Audio processing
 */

import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { StorageService } from '../core/storage.service';
import { prisma } from '../../config/database';

const execAsync = promisify(exec);

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  bitrate: number;
  audioCodec?: string;
  audioBitrate?: number;
  size: number;
}

export class VideoProcessingService {
  /**
   * Get video metadata using FFprobe
   */
  static async getMetadata(videoPath: string): Promise<VideoMetadata> {
    const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`;

    try {
      const { stdout } = await execAsync(command);
      const data = JSON.parse(stdout);

      const videoStream = data.streams.find((s: any) => s.codec_type === 'video');
      const audioStream = data.streams.find((s: any) => s.codec_type === 'audio');

      return {
        duration: parseFloat(data.format.duration),
        width: videoStream?.width || 0,
        height: videoStream?.height || 0,
        fps: eval(videoStream?.r_frame_rate || '30/1'),
        codec: videoStream?.codec_name || 'unknown',
        bitrate: parseInt(data.format.bit_rate) || 0,
        audioCodec: audioStream?.codec_name,
        audioBitrate: parseInt(audioStream?.bit_rate) || undefined,
        size: parseInt(data.format.size) || 0,
      };
    } catch (error: any) {
      throw new Error(`Failed to get video metadata: ${error.message}`);
    }
  }

  /**
   * Generate thumbnail from video
   */
  static async generateThumbnail(
    videoPath: string,
    timestamp: number = 1,
    options?: {
      width?: number;
      height?: number;
      quality?: number;
    }
  ): Promise<string> {
    const outputPath = `/tmp/thumbnail_${Date.now()}.jpg`;
    const size = options?.width && options?.height
      ? `-s ${options.width}x${options.height}`
      : '';

    const command = `ffmpeg -i "${videoPath}" -ss ${timestamp} ${size} -vframes 1 -q:v ${options?.quality || 2} "${outputPath}"`;

    await execAsync(command);

    return outputPath;
  }

  /**
   * Generate multiple thumbnails (sprite sheet)
   */
  static async generateThumbnailSprite(
    videoPath: string,
    options: {
      count: number;
      width: number;
      height: number;
      columns: number;
    }
  ): Promise<string> {
    const metadata = await this.getMetadata(videoPath);
    const interval = metadata.duration / options.count;
    const outputPath = `/tmp/sprite_${Date.now()}.jpg`;

    const command = `ffmpeg -i "${videoPath}" -vf "fps=1/${interval},scale=${options.width}:${options.height},tile=${options.columns}x${Math.ceil(options.count / options.columns)}" "${outputPath}"`;

    await execAsync(command);

    return outputPath;
  }

  /**
   * Transcode video to different format/codec
   */
  static async transcode(
    inputPath: string,
    outputPath: string,
    options: {
      format?: string;
      codec?: string;
      resolution?: string;
      fps?: number;
      bitrate?: string;
      audioCodec?: string;
      audioBitrate?: string;
      preset?: 'ultrafast' | 'fast' | 'medium' | 'slow' | 'veryslow';
      crf?: number; // 0-51, lower = better quality
      twoPass?: boolean;
    }
  ): Promise<void> {
    const {
      codec = 'libx264',
      audioCodec = 'aac',
      preset = 'medium',
      crf = 23,
    } = options;

    let command = `ffmpeg -i "${inputPath}"`;

    // Video codec
    command += ` -c:v ${codec}`;

    // Resolution
    if (options.resolution) {
      command += ` -s ${options.resolution}`;
    }

    // FPS
    if (options.fps) {
      command += ` -r ${options.fps}`;
    }

    // Bitrate
    if (options.bitrate) {
      command += ` -b:v ${options.bitrate}`;
    } else {
      command += ` -crf ${crf}`;
    }

    // Preset
    command += ` -preset ${preset}`;

    // Audio codec
    command += ` -c:a ${audioCodec}`;

    if (options.audioBitrate) {
      command += ` -b:a ${options.audioBitrate}`;
    }

    command += ` "${outputPath}"`;

    await execAsync(command, { maxBuffer: 1024 * 1024 * 10 });
  }

  /**
   * Trim video
   */
  static async trim(
    inputPath: string,
    outputPath: string,
    start: number,
    duration: number
  ): Promise<void> {
    const command = `ffmpeg -i "${inputPath}" -ss ${start} -t ${duration} -c copy "${outputPath}"`;
    await execAsync(command);
  }

  /**
   * Concatenate multiple videos
   */
  static async concatenate(
    inputPaths: string[],
    outputPath: string,
    options?: {
      transition?: 'cut' | 'fade';
      transitionDuration?: number;
    }
  ): Promise<void> {
    // Create concat file
    const concatFile = `/tmp/concat_${Date.now()}.txt`;
    const concatContent = inputPaths.map((p) => `file '${p}'`).join('\n');

    require('fs').writeFileSync(concatFile, concatContent);

    if (options?.transition === 'fade' && options.transitionDuration) {
      // Complex filter for fade transitions
      const filters: string[] = [];
      const inputs = inputPaths.map((_, i) => `[${i}:v]`).join('');

      for (let i = 0; i < inputPaths.length - 1; i++) {
        filters.push(
          `[${i}:v][${i + 1}:v]xfade=transition=fade:duration=${options.transitionDuration}:offset=${i * 10}[v${i}]`
        );
      }

      const command = `ffmpeg ${inputPaths.map((p) => `-i "${p}"`).join(' ')} -filter_complex "${filters.join(';')}" "${outputPath}"`;
      await execAsync(command, { maxBuffer: 1024 * 1024 * 10 });
    } else {
      // Simple concatenation
      const command = `ffmpeg -f concat -safe 0 -i "${concatFile}" -c copy "${outputPath}"`;
      await execAsync(command);
    }

    // Cleanup
    require('fs').unlinkSync(concatFile);
  }

  /**
   * Add watermark to video
   */
  static async addWatermark(
    inputPath: string,
    outputPath: string,
    watermark: {
      type: 'text' | 'image';
      content: string; // text string or image path
      position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
      opacity?: number;
      fontSize?: number;
    }
  ): Promise<void> {
    const opacity = watermark.opacity || 0.7;

    let filter = '';

    if (watermark.type === 'text') {
      const positions = {
        'top-left': 'x=10:y=10',
        'top-right': 'x=w-text_w-10:y=10',
        'bottom-left': 'x=10:y=h-text_h-10',
        'bottom-right': 'x=w-text_w-10:y=h-text_h-10',
        'center': 'x=(w-text_w)/2:y=(h-text_h)/2',
      };

      filter = `drawtext=text='${watermark.content}':fontsize=${watermark.fontSize || 24}:fontcolor=white@${opacity}:${positions[watermark.position]}`;
    } else {
      const positions = {
        'top-left': '10:10',
        'top-right': 'W-w-10:10',
        'bottom-left': '10:H-h-10',
        'bottom-right': 'W-w-10:H-h-10',
        'center': '(W-w)/2:(H-h)/2',
      };

      filter = `movie=${watermark.content},format=rgba,colorchannelmixer=aa=${opacity}[wm];[in][wm]overlay=${positions[watermark.position]}[out]`;
    }

    const command = `ffmpeg -i "${inputPath}" -vf "${filter}" -codec:a copy "${outputPath}"`;
    await execAsync(command, { maxBuffer: 1024 * 1024 * 10 });
  }

  /**
   * Extract audio from video
   */
  static async extractAudio(
    inputPath: string,
    outputPath: string,
    format: 'mp3' | 'wav' | 'aac' = 'mp3'
  ): Promise<void> {
    const codecMap = {
      mp3: 'libmp3lame',
      wav: 'pcm_s16le',
      aac: 'aac',
    };

    const command = `ffmpeg -i "${inputPath}" -vn -c:a ${codecMap[format]} "${outputPath}"`;
    await execAsync(command);
  }

  /**
   * Replace audio in video
   */
  static async replaceAudio(
    videoPath: string,
    audioPath: string,
    outputPath: string
  ): Promise<void> {
    const command = `ffmpeg -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 "${outputPath}"`;
    await execAsync(command);
  }

  /**
   * Adjust video speed
   */
  static async adjustSpeed(
    inputPath: string,
    outputPath: string,
    speed: number // 0.5 = half speed, 2.0 = double speed
  ): Promise<void> {
    const videoSpeed = 1 / speed;
    const audioSpeed = speed;

    const command = `ffmpeg -i "${inputPath}" -filter_complex "[0:v]setpts=${videoSpeed}*PTS[v];[0:a]atempo=${audioSpeed}[a]" -map "[v]" -map "[a]" "${outputPath}"`;
    await execAsync(command, { maxBuffer: 1024 * 1024 * 10 });
  }

  /**
   * Apply video filters
   */
  static async applyFilters(
    inputPath: string,
    outputPath: string,
    filters: Array<{
      type: 'blur' | 'sharpen' | 'brightness' | 'contrast' | 'saturation' | 'hue';
      value: number;
    }>
  ): Promise<void> {
    const filterStrings: string[] = [];

    filters.forEach((filter) => {
      switch (filter.type) {
        case 'blur':
          filterStrings.push(`boxblur=${filter.value}`);
          break;
        case 'sharpen':
          filterStrings.push(`unsharp=5:5:${filter.value}:5:5:0`);
          break;
        case 'brightness':
          filterStrings.push(`eq=brightness=${filter.value}`);
          break;
        case 'contrast':
          filterStrings.push(`eq=contrast=${filter.value}`);
          break;
        case 'saturation':
          filterStrings.push(`eq=saturation=${filter.value}`);
          break;
        case 'hue':
          filterStrings.push(`hue=h=${filter.value}`);
          break;
      }
    });

    const filterChain = filterStrings.join(',');
    const command = `ffmpeg -i "${inputPath}" -vf "${filterChain}" "${outputPath}"`;
    await execAsync(command, { maxBuffer: 1024 * 1024 * 10 });
  }

  /**
   * Convert to GIF
   */
  static async convertToGIF(
    inputPath: string,
    outputPath: string,
    options?: {
      fps?: number;
      width?: number;
      start?: number;
      duration?: number;
    }
  ): Promise<void> {
    const fps = options?.fps || 10;
    const width = options?.width || 480;
    const start = options?.start ? `-ss ${options.start}` : '';
    const duration = options?.duration ? `-t ${options.duration}` : '';

    const command = `ffmpeg -i "${inputPath}" ${start} ${duration} -vf "fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${outputPath}"`;
    await execAsync(command, { maxBuffer: 1024 * 1024 * 10 });
  }

  /**
   * Upscale video using AI (requires external service)
   */
  static async upscale(
    inputPath: string,
    outputPath: string,
    scale: 2 | 4 | 8 = 2
  ): Promise<void> {
    // For production, integrate with Real-ESRGAN, Topaz, or similar
    // For now, use basic FFmpeg upscaling

    const command = `ffmpeg -i "${inputPath}" -vf "scale=iw*${scale}:ih*${scale}:flags=lanczos" -c:v libx264 -preset slow -crf 18 "${outputPath}"`;
    await execAsync(command, { maxBuffer: 1024 * 1024 * 10 });
  }
}
