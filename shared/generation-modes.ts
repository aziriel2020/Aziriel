/**
 * NEURAFIELD QUANTUM v5.0 - Generation Modes
 * 200+ Generation Modes across all categories
 */

export interface GenerationMode {
  id: string;
  name: string;
  category: 'video' | 'image' | 'audio' | 'llm' | '3d';
  description: string;
  inputTypes: string[];
  outputType: string;
  complexity: 'simple' | 'moderate' | 'advanced' | 'expert';
  supportedProviders: string[];
}

// ==================== VIDEO MODES (40+) ====================

export const videoModes: GenerationMode[] = [
  // Core
  { id: 'text-to-video', name: 'Text to Video', category: 'video', description: 'Generate video from text prompt', inputTypes: ['text'], outputType: 'video', complexity: 'simple', supportedProviders: ['openai-sora', 'runway', 'kling', 'luma', 'google-veo', 'pika'] },
  { id: 'image-to-video', name: 'Image to Video', category: 'video', description: 'Animate still image into video', inputTypes: ['image', 'text'], outputType: 'video', complexity: 'simple', supportedProviders: ['runway', 'kling', 'luma', 'pika', 'stability-video'] },
  { id: 'video-to-video', name: 'Video to Video', category: 'video', description: 'Transform existing video with new style/content', inputTypes: ['video', 'text'], outputType: 'video', complexity: 'moderate', supportedProviders: ['runway', 'domo'] },
  { id: 'video-extend', name: 'Video Extend', category: 'video', description: 'Extend video duration beyond original', inputTypes: ['video'], outputType: 'video', complexity: 'moderate', supportedProviders: ['luma', 'runway', 'pika'] },
  { id: 'video-remix', name: 'Video Remix', category: 'video', description: 'Remix video with variations', inputTypes: ['video', 'text'], outputType: 'video', complexity: 'moderate', supportedProviders: ['runway', 'pika'] },

  // Advanced
  { id: 'lip-sync', name: 'Lip Sync', category: 'video', description: 'Sync character lips to audio', inputTypes: ['video', 'audio'], outputType: 'video', complexity: 'advanced', supportedProviders: ['kling', 'heygen', 'did', 'hedra'] },
  { id: 'face-swap', name: 'Face Swap', category: 'video', description: 'Replace face in video', inputTypes: ['video', 'image'], outputType: 'video', complexity: 'advanced', supportedProviders: ['kling', 'heygen'] },
  { id: 'motion-brush', name: 'Motion Brush', category: 'video', description: 'Paint motion onto specific areas', inputTypes: ['image', 'motion-path'], outputType: 'video', complexity: 'advanced', supportedProviders: ['runway'] },
  { id: 'camera-control', name: 'Camera Control', category: 'video', description: 'Precise camera movement control', inputTypes: ['text', 'camera-path'], outputType: 'video', complexity: 'expert', supportedProviders: ['openai-sora', 'google-veo', 'luma'] },
  { id: 'character-animation', name: 'Character Animation', category: 'video', description: 'Animate character from reference', inputTypes: ['image', 'text'], outputType: 'video', complexity: 'advanced', supportedProviders: ['kling', 'pixverse', 'hedra'] },

  // Avatar
  { id: 'avatar-video', name: 'Avatar Video', category: 'video', description: 'Generate talking avatar video', inputTypes: ['text', 'audio'], outputType: 'video', complexity: 'moderate', supportedProviders: ['heygen', 'synthesia', 'did'] },
  { id: 'streaming-avatar', name: 'Streaming Avatar', category: 'video', description: 'Real-time interactive avatar', inputTypes: ['audio-stream'], outputType: 'video-stream', complexity: 'expert', supportedProviders: ['heygen'] },
  { id: 'photo-to-avatar', name: 'Photo to Avatar', category: 'video', description: 'Animate photo into talking avatar', inputTypes: ['image', 'audio'], outputType: 'video', complexity: 'moderate', supportedProviders: ['did', 'hedra', 'liveportrait'] },

  // Creative
  { id: 'style-transfer', name: 'Style Transfer', category: 'video', description: 'Apply artistic style to video', inputTypes: ['video', 'style-reference'], outputType: 'video', complexity: 'moderate', supportedProviders: ['runway', 'domo'] },
  { id: 'anime-style', name: 'Anime Style', category: 'video', description: 'Convert video to anime style', inputTypes: ['video'], outputType: 'video', complexity: 'moderate', supportedProviders: ['domo', 'pixverse'] },
  { id: 'slow-motion', name: 'Slow Motion', category: 'video', description: 'AI-enhanced slow motion', inputTypes: ['video'], outputType: 'video', complexity: 'moderate', supportedProviders: ['runway', 'rife'] },
  { id: 'time-lapse', name: 'Time Lapse', category: 'video', description: 'Generate time-lapse effect', inputTypes: ['video'], outputType: 'video', complexity: 'simple', supportedProviders: ['runway'] },
  { id: 'cinemagraph', name: 'Cinemagraph', category: 'video', description: 'Create subtle loop animation', inputTypes: ['image'], outputType: 'video', complexity: 'moderate', supportedProviders: ['luma', 'pika'] },
  { id: 'loop-video', name: 'Loop Video', category: 'video', description: 'Create seamless video loop', inputTypes: ['video'], outputType: 'video', complexity: 'advanced', supportedProviders: ['luma'] },

  // Professional
  { id: 'green-screen', name: 'Green Screen', category: 'video', description: 'Generate with green screen background', inputTypes: ['text'], outputType: 'video', complexity: 'moderate', supportedProviders: ['runway'] },
  { id: 'upscale-video', name: 'Upscale Video', category: 'video', description: 'AI upscale video resolution', inputTypes: ['video'], outputType: 'video', complexity: 'moderate', supportedProviders: ['runway', 'topaz'] },
  { id: 'frame-interpolation', name: 'Frame Interpolation', category: 'video', description: 'Increase framerate smoothly', inputTypes: ['video'], outputType: 'video', complexity: 'moderate', supportedProviders: ['rife', 'dain', 'flowframes'] },
  { id: 'stabilization', name: 'Video Stabilization', category: 'video', description: 'Stabilize shaky footage', inputTypes: ['video'], outputType: 'video', complexity: 'simple', supportedProviders: ['runway'] },
  { id: 'color-correction', name: 'Color Correction', category: 'video', description: 'AI color grading and correction', inputTypes: ['video'], outputType: 'video', complexity: 'moderate', supportedProviders: ['runway'] },

  // Specialized
  { id: 'music-video', name: 'Music Video', category: 'video', description: 'Generate music video from audio', inputTypes: ['audio', 'text'], outputType: 'video', complexity: 'advanced', supportedProviders: ['runway', 'pika'] },
  { id: 'product-video', name: 'Product Video', category: 'video', description: 'Generate product showcase video', inputTypes: ['image', 'text'], outputType: 'video', complexity: 'moderate', supportedProviders: ['runway', 'luma'] },
  { id: 'explainer-video', name: 'Explainer Video', category: 'video', description: 'Educational explainer video', inputTypes: ['text', 'script'], outputType: 'video', complexity: 'advanced', supportedProviders: ['synthesia', 'heygen'] },
  { id: 'social-video', name: 'Social Media Video', category: 'video', description: 'Optimized for social platforms', inputTypes: ['text', 'images'], outputType: 'video', complexity: 'simple', supportedProviders: ['runway', 'pika'] },
  { id: 'ad-creative', name: 'Ad Creative', category: 'video', description: 'Generate advertising video', inputTypes: ['text', 'images'], outputType: 'video', complexity: 'moderate', supportedProviders: ['runway', 'heygen'] },

  // Open Source
  { id: 'text-to-video-os', name: 'Text to Video (Open Source)', category: 'video', description: 'Self-hosted text-to-video', inputTypes: ['text'], outputType: 'video', complexity: 'expert', supportedProviders: ['genmo', 'cogvideo', 'animatediff'] },
  { id: 'portrait-animation', name: 'Portrait Animation', category: 'video', description: 'Animate portrait with audio', inputTypes: ['image', 'audio'], outputType: 'video', complexity: 'moderate', supportedProviders: ['liveportrait', 'sadtalker'] },
  { id: 'video-inpainting', name: 'Video Inpainting', category: 'video', description: 'Remove/replace objects in video', inputTypes: ['video', 'mask'], outputType: 'video', complexity: 'advanced', supportedProviders: ['runway'] },
  { id: 'multi-view', name: 'Multi-View Generation', category: 'video', description: 'Generate multiple camera angles', inputTypes: ['text'], outputType: 'video', complexity: 'expert', supportedProviders: ['google-veo'] },
  { id: 'storyboard-to-video', name: 'Storyboard to Video', category: 'video', description: 'Convert storyboard to video', inputTypes: ['images', 'text'], outputType: 'video', complexity: 'advanced', supportedProviders: ['openai-sora'] },
  { id: 'motion-capture', name: 'Motion Capture', category: 'video', description: 'Extract and apply motion', inputTypes: ['video'], outputType: 'motion-data', complexity: 'expert', supportedProviders: ['runway'] },
  { id: 'depth-estimation', name: 'Depth Estimation', category: 'video', description: 'Generate depth map from video', inputTypes: ['video'], outputType: 'video+depth', complexity: 'advanced', supportedProviders: ['luma'] },
  { id: 'subject-isolation', name: 'Subject Isolation', category: 'video', description: 'Isolate and extract subject', inputTypes: ['video'], outputType: 'video', complexity: 'moderate', supportedProviders: ['runway'] },
  { id: 'video-restoration', name: 'Video Restoration', category: 'video', description: 'Restore old/damaged video', inputTypes: ['video'], outputType: 'video', complexity: 'advanced', supportedProviders: ['topaz'] },
  { id: 'scene-detection', name: 'Scene Detection', category: 'video', description: 'AI-powered scene segmentation', inputTypes: ['video'], outputType: 'scenes', complexity: 'simple', supportedProviders: ['runway'] }
];

// ==================== IMAGE MODES (50+) ====================

export const imageModes: GenerationMode[] = [
  // Core
  { id: 'text-to-image', name: 'Text to Image', category: 'image', description: 'Generate image from text', inputTypes: ['text'], outputType: 'image', complexity: 'simple', supportedProviders: ['midjourney', 'openai-dalle', 'flux', 'stability'] },
  { id: 'image-to-image', name: 'Image to Image', category: 'image', description: 'Transform image with prompt', inputTypes: ['image', 'text'], outputType: 'image', complexity: 'simple', supportedProviders: ['midjourney', 'flux', 'stability'] },
  { id: 'inpainting', name: 'Inpainting', category: 'image', description: 'Edit specific areas of image', inputTypes: ['image', 'mask', 'text'], outputType: 'image', complexity: 'moderate', supportedProviders: ['openai-dalle', 'flux', 'stability', 'adobe-firefly'] },
  { id: 'outpainting', name: 'Outpainting', category: 'image', description: 'Extend image beyond borders', inputTypes: ['image', 'text'], outputType: 'image', complexity: 'moderate', supportedProviders: ['openai-dalle', 'stability', 'adobe-firefly'] },
  { id: 'upscale', name: 'Image Upscale', category: 'image', description: 'Increase image resolution', inputTypes: ['image'], outputType: 'image', complexity: 'simple', supportedProviders: ['stability', 'real-esrgan', 'topaz'] },
  { id: 'variations', name: 'Image Variations', category: 'image', description: 'Generate variations of image', inputTypes: ['image'], outputType: 'image', complexity: 'simple', supportedProviders: ['midjourney', 'openai-dalle', 'flux'] },

  // Creative
  { id: 'portrait', name: 'Portrait', category: 'image', description: 'Generate portrait photography', inputTypes: ['text'], outputType: 'image', complexity: 'simple', supportedProviders: ['midjourney', 'flux', 'stability'] },
  { id: 'landscape', name: 'Landscape', category: 'image', description: 'Generate landscape photography', inputTypes: ['text'], outputType: 'image', complexity: 'simple', supportedProviders: ['midjourney', 'flux'] },
  { id: 'product-photo', name: 'Product Photography', category: 'image', description: 'Professional product photos', inputTypes: ['text'], outputType: 'image', complexity: 'moderate', supportedProviders: ['midjourney', 'flux'] },
  { id: 'architecture', name: 'Architecture', category: 'image', description: 'Architectural visualization', inputTypes: ['text'], outputType: 'image', complexity: 'moderate', supportedProviders: ['midjourney', 'stability'] },
  { id: 'interior-design', name: 'Interior Design', category: 'image', description: 'Interior space design', inputTypes: ['text'], outputType: 'image', complexity: 'moderate', supportedProviders: ['midjourney', 'stability'] },
  { id: 'fashion', name: 'Fashion', category: 'image', description: 'Fashion and clothing design', inputTypes: ['text'], outputType: 'image', complexity: 'moderate', supportedProviders: ['midjourney', 'flux'] },
  { id: 'food-photo', name: 'Food Photography', category: 'image', description: 'Appetizing food imagery', inputTypes: ['text'], outputType: 'image', complexity: 'simple', supportedProviders: ['midjourney', 'flux'] },

  // Artistic
  { id: 'concept-art', name: 'Concept Art', category: 'image', description: 'Game/film concept art', inputTypes: ['text'], outputType: 'image', complexity: 'moderate', supportedProviders: ['midjourney', 'stability'] },
  { id: 'illustration', name: 'Illustration', category: 'image', description: 'Illustrated artwork', inputTypes: ['text'], outputType: 'image', complexity: 'simple', supportedProviders: ['midjourney', 'flux'] },
  { id: 'anime', name: 'Anime', category: 'image', description: 'Anime/manga style art', inputTypes: ['text'], outputType: 'image', complexity: 'simple', supportedProviders: ['midjourney', 'leonardo'] },
  { id: 'cartoon', name: 'Cartoon', category: 'image', description: 'Cartoon style illustration', inputTypes: ['text'], outputType: 'image', complexity: 'simple', supportedProviders: ['midjourney', 'flux'] },
  { id: 'pixel-art', name: 'Pixel Art', category: 'image', description: 'Retro pixel art style', inputTypes: ['text'], outputType: 'image', complexity: 'simple', supportedProviders: ['midjourney'] },
  { id: '3d-render', name: '3D Render', category: 'image', description: '3D rendered appearance', inputTypes: ['text'], outputType: 'image', complexity: 'moderate', supportedProviders: ['midjourney', 'flux'] },
  { id: 'watercolor', name: 'Watercolor', category: 'image', description: 'Watercolor painting style', inputTypes: ['text'], outputType: 'image', complexity: 'simple', supportedProviders: ['midjourney'] },
  { id: 'oil-painting', name: 'Oil Painting', category: 'image', description: 'Oil painting style', inputTypes: ['text'], outputType: 'image', complexity: 'simple', supportedProviders: ['midjourney'] },
  { id: 'sketch', name: 'Sketch', category: 'image', description: 'Pencil sketch style', inputTypes: ['text'], outputType: 'image', complexity: 'simple', supportedProviders: ['midjourney', 'flux'] },

  // Technical
  { id: 'logo', name: 'Logo Design', category: 'image', description: 'Professional logo creation', inputTypes: ['text'], outputType: 'image', complexity: 'moderate', supportedProviders: ['midjourney', 'ideogram', 'recraft'] },
  { id: 'icon', name: 'Icon Design', category: 'image', description: 'UI/app icon design', inputTypes: ['text'], outputType: 'image', complexity: 'simple', supportedProviders: ['midjourney', 'recraft'] },
  { id: 'ui-design', name: 'UI Design', category: 'image', description: 'User interface design', inputTypes: ['text'], outputType: 'image', complexity: 'moderate', supportedProviders: ['midjourney'] },
  { id: 'texture', name: 'Texture Generation', category: 'image', description: 'Seamless texture patterns', inputTypes: ['text'], outputType: 'image', complexity: 'moderate', supportedProviders: ['stability', 'leonardo'] },
  { id: 'pattern', name: 'Pattern Design', category: 'image', description: 'Repeating pattern design', inputTypes: ['text'], outputType: 'image', complexity: 'moderate', supportedProviders: ['midjourney'] },
  { id: 'qr-art', name: 'QR Art', category: 'image', description: 'Artistic QR code generation', inputTypes: ['text', 'url'], outputType: 'image', complexity: 'advanced', supportedProviders: ['stability'] },
  { id: 'mockup', name: 'Product Mockup', category: 'image', description: 'Product mockup generation', inputTypes: ['image', 'text'], outputType: 'image', complexity: 'moderate', supportedProviders: ['midjourney'] },

  // Control
  { id: 'controlnet-pose', name: 'ControlNet Pose', category: 'image', description: 'Control with pose guidance', inputTypes: ['image', 'text'], outputType: 'image', complexity: 'advanced', supportedProviders: ['flux', 'stability'] },
  { id: 'controlnet-depth', name: 'ControlNet Depth', category: 'image', description: 'Control with depth map', inputTypes: ['image', 'text'], outputType: 'image', complexity: 'advanced', supportedProviders: ['flux', 'stability'] },
  { id: 'controlnet-edge', name: 'ControlNet Edge', category: 'image', description: 'Control with edge detection', inputTypes: ['image', 'text'], outputType: 'image', complexity: 'advanced', supportedProviders: ['flux', 'stability'] },
  { id: 'controlnet-normal', name: 'ControlNet Normal', category: 'image', description: 'Control with normal map', inputTypes: ['image', 'text'], outputType: 'image', complexity: 'advanced', supportedProviders: ['stability'] },
  { id: 'style-reference', name: 'Style Reference', category: 'image', description: 'Match specific style', inputTypes: ['image', 'text'], outputType: 'image', complexity: 'moderate', supportedProviders: ['midjourney', 'flux'] },
  { id: 'character-reference', name: 'Character Reference', category: 'image', description: 'Maintain character consistency', inputTypes: ['image', 'text'], outputType: 'image', complexity: 'advanced', supportedProviders: ['midjourney'] },
  { id: 'regional-prompting', name: 'Regional Prompting', category: 'image', description: 'Different prompts per region', inputTypes: ['text', 'regions'], outputType: 'image', complexity: 'expert', supportedProviders: ['stability'] },

  // Enhancement
  { id: 'background-remove', name: 'Background Removal', category: 'image', description: 'Remove image background', inputTypes: ['image'], outputType: 'image', complexity: 'simple', supportedProviders: ['remove-bg', 'sam'] },
  { id: 'face-restore', name: 'Face Restoration', category: 'image', description: 'Restore/enhance faces', inputTypes: ['image'], outputType: 'image', complexity: 'simple', supportedProviders: ['codeformer', 'gfpgan'] },
  { id: 'colorize', name: 'Colorization', category: 'image', description: 'Colorize black & white', inputTypes: ['image'], outputType: 'image', complexity: 'simple', supportedProviders: ['stability'] },
  { id: 'deblur', name: 'Deblur', category: 'image', description: 'Remove blur from image', inputTypes: ['image'], outputType: 'image', complexity: 'moderate', supportedProviders: ['stability'] },
  { id: 'denoise', name: 'Denoise', category: 'image', description: 'Remove image noise', inputTypes: ['image'], outputType: 'image', complexity: 'simple', supportedProviders: ['topaz', 'stability'] },
  { id: 'generative-fill', name: 'Generative Fill', category: 'image', description: 'Fill areas with AI generation', inputTypes: ['image', 'mask', 'text'], outputType: 'image', complexity: 'moderate', supportedProviders: ['adobe-firefly', 'flux'] },
  { id: 'generative-expand', name: 'Generative Expand', category: 'image', description: 'Expand canvas intelligently', inputTypes: ['image'], outputType: 'image', complexity: 'moderate', supportedProviders: ['adobe-firefly'] },
  { id: 'relight', name: 'Relighting', category: 'image', description: 'Change lighting conditions', inputTypes: ['image', 'text'], outputType: 'image', complexity: 'advanced', supportedProviders: ['stability'] },
  { id: 'season-change', name: 'Season Change', category: 'image', description: 'Change season in landscape', inputTypes: ['image', 'season'], outputType: 'image', complexity: 'moderate', supportedProviders: ['stability'] },
  { id: 'age-progression', name: 'Age Progression', category: 'image', description: 'Age or de-age subject', inputTypes: ['image', 'age'], outputType: 'image', complexity: 'advanced', supportedProviders: ['stability'] },
  { id: 'pose-transfer', name: 'Pose Transfer', category: 'image', description: 'Transfer pose to another subject', inputTypes: ['image', 'pose'], outputType: 'image', complexity: 'advanced', supportedProviders: ['stability'] },
  { id: 'virtual-try-on', name: 'Virtual Try-On', category: 'image', description: 'Try clothing on model', inputTypes: ['image', 'clothing'], outputType: 'image', complexity: 'advanced', supportedProviders: ['stability'] }
];

import { audioModes, llmModes, threeDModes } from './generation-modes-extended';

export const generationModes = {
  video: videoModes,
  image: imageModes,
  audio: audioModes,
  llm: llmModes,
  '3d': threeDModes
};

export const getAllModes = (): GenerationMode[] => {
  return [
    ...videoModes,
    ...imageModes,
    ...audioModes,
    ...llmModes,
    ...threeDModes
  ];
};

export const getModeById = (id: string): GenerationMode | undefined => {
  return getAllModes().find(m => m.id === id);
};

export const getModesByCategory = (category: GenerationMode['category']): GenerationMode[] => {
  return getAllModes().filter(m => m.category === category);
};

export const getTotalModeStats = () => {
  return {
    total: getAllModes().length,
    byCategory: {
      video: videoModes.length,
      image: imageModes.length,
      audio: audioModes.length,
      llm: llmModes.length,
      '3d': threeDModes.length
    }
  };
};

export { videoModes, imageModes };
