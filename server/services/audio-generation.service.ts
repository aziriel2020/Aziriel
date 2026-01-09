/**
 * Audio Generation Service - AI MUSIC & VOICE
 * Generate background music, voice-overs, sound effects
 */

import axios from 'axios';
import { logger } from '../config/logger';
import S3Service from './s3.service';

export interface MusicGenerationRequest {
  prompt: string;
  duration?: number; // seconds
  genre?: 'cinematic' | 'upbeat' | 'ambient' | 'dramatic' | 'calm' | 'energetic';
  mood?: 'happy' | 'sad' | 'epic' | 'mysterious' | 'romantic';
  tempo?: 'slow' | 'medium' | 'fast';
}

export interface VoiceOverRequest {
  text: string;
  voice?: 'male' | 'female' | 'neutral';
  language?: string;
  speed?: number; // 0.5-2.0
  pitch?: number; // 0.5-2.0
}

export interface AudioResponse {
  audioUrl: string;
  duration: number;
  format: string;
}

export class AudioGenerationService {
  /**
   * Generate AI background music using Suno AI
   */
  static async generateMusic(request: MusicGenerationRequest): Promise<AudioResponse> {
    try {
      logger.info(\`Generating music: \${request.prompt}\`);

      const SUNO_API_KEY = process.env.SUNO_API_KEY;
      if (!SUNO_API_KEY) {
        throw new Error('Suno API key not configured');
      }

      // Call Suno AI API
      const response = await axios.post(
        'https://api.suno.ai/v1/generate',
        {
          prompt: request.prompt,
          duration: request.duration || 30,
          genre: request.genre,
          mood: request.mood,
          tempo: request.tempo,
        },
        {
          headers: {
            'Authorization': \`Bearer \${SUNO_API_KEY}\`,
            'Content-Type': 'application/json',
          },
          timeout: 120000, // 2 minutes
        }
      );

      const audioUrl = response.data.audio_url;

      // Upload to S3
      const uploaded = await S3Service.uploadFile(\`music-\${Date.now()}.mp3\`, {
        fileUrl: audioUrl,
        contentType: 'audio/mpeg',
      });

      return {
        audioUrl: uploaded.url,
        duration: request.duration || 30,
        format: 'mp3',
      };
    } catch (error: any) {
      logger.error('Music generation failed:', error);
      throw new Error(\`Failed to generate music: \${error.message}\`);
    }
  }

  /**
   * Generate AI voice-over using ElevenLabs
   */
  static async generateVoiceOver(request: VoiceOverRequest): Promise<AudioResponse> {
    try {
      logger.info(\`Generating voice-over: \${request.text.substring(0, 50)}...\`);

      const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
      if (!ELEVENLABS_API_KEY) {
        throw new Error('ElevenLabs API key not configured');
      }

      // Voice IDs from ElevenLabs
      const VOICES: Record<string, string> = {
        male: '21m00Tcm4TlvDq8ikWAM',
        female: 'EXAVITQu4vr4xnSDxMaL',
        neutral: 'pNInz6obpgDQGcFmaJgB',
      };

      const voiceId = VOICES[request.voice || 'neutral'];

      // Generate voice
      const response = await axios.post(
        \`https://api.elevenlabs.io/v1/text-to-speech/\${voiceId}\`,
        {
          text: request.text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.5,
            use_speaker_boost: true,
          },
        },
        {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
          timeout: 60000,
        }
      );

      // Upload to S3
      const audioBuffer = Buffer.from(response.data);
      const uploaded = await S3Service.uploadFile(\`voiceover-\${Date.now()}.mp3\`, {
        fileBuffer: audioBuffer,
        contentType: 'audio/mpeg',
      });

      return {
        audioUrl: uploaded.url,
        duration: Math.ceil(request.text.length / 15), // Rough estimate
        format: 'mp3',
      };
    } catch (error: any) {
      logger.error('Voice-over generation failed:', error);
      throw new Error(\`Failed to generate voice-over: \${error.message}\`);
    }
  }

  /**
   * Generate sound effects using AudioGen
   */
  static async generateSoundEffect(prompt: string): Promise<AudioResponse> {
    try {
      logger.info(\`Generating sound effect: \${prompt}\`);

      const AUDIOGEN_API_KEY = process.env.AUDIOGEN_API_KEY;
      if (!AUDIOGEN_API_KEY) {
        throw new Error('AudioGen API key not configured');
      }

      const response = await axios.post(
        'https://api.audiogen.co/v1/generate',
        {
          prompt,
          duration: 5,
        },
        {
          headers: {
            'Authorization': \`Bearer \${AUDIOGEN_API_KEY}\`,
            'Content-Type': 'application/json',
          },
        }
      );

      const audioUrl = response.data.audio_url;

      const uploaded = await S3Service.uploadFile(\`sfx-\${Date.now()}.mp3\`, {
        fileUrl: audioUrl,
        contentType: 'audio/mpeg',
      });

      return {
        audioUrl: uploaded.url,
        duration: 5,
        format: 'mp3',
      };
    } catch (error: any) {
      logger.error('Sound effect generation failed:', error);
      throw new Error(\`Failed to generate sound effect: \${error.message}\`);
    }
  }

  /**
   * Extract audio from video
   */
  static async extractAudioFromVideo(videoUrl: string): Promise<AudioResponse> {
    // This would use FFmpeg to extract audio
    // Implementation left for video-editing.service integration
    throw new Error('Not implemented - use VideoEditingService');
  }

  /**
   * Mix multiple audio tracks
   */
  static async mixAudioTracks(tracks: string[], volumes: number[]): Promise<AudioResponse> {
    // This would use FFmpeg to mix audio tracks
    throw new Error('Not implemented - use VideoEditingService');
  }

  /**
   * Get music presets
   */
  static getMusicPresets() {
    return [
      { id: 'epic-cinematic', name: 'Epic Cinematic', genre: 'cinematic', mood: 'epic' },
      { id: 'upbeat-energetic', name: 'Upbeat & Energetic', genre: 'upbeat', mood: 'happy' },
      { id: 'calm-ambient', name: 'Calm Ambient', genre: 'ambient', mood: 'calm' },
      { id: 'dramatic-mysterious', name: 'Dramatic Mystery', genre: 'dramatic', mood: 'mysterious' },
      { id: 'romantic-soft', name: 'Romantic & Soft', genre: 'calm', mood: 'romantic' },
    ];
  }

  /**
   * Get available voices
   */
  static getAvailableVoices() {
    return [
      { id: 'male', name: 'Professional Male', language: 'en', description: 'Deep, authoritative voice' },
      { id: 'female', name: 'Professional Female', language: 'en', description: 'Clear, engaging voice' },
      { id: 'neutral', name: 'Neutral Voice', language: 'en', description: 'Balanced, versatile voice' },
    ];
  }
}

export default AudioGenerationService;
