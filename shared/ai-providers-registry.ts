/**
 * NEURAFIELD QUANTUM v5.0 - AI Providers Registry
 * Complete registry of 200+ AI providers and 500+ models
 */

export interface AIModel {
  id: string;
  name: string;
  version?: string;
  maxResolution?: string;
  maxDuration?: number;
  contextWindow?: number;
  features?: string[];
  pricing?: string;
}

export interface AIProvider {
  id: string;
  name: string;
  category: 'video' | 'image' | 'audio' | 'llm' | '3d' | 'tools';
  tier?: 'premium' | 'standard' | 'opensource' | 'specialist';
  description: string;
  models: AIModel[];
  features: string[];
  pricing: {
    free?: boolean;
    subscription?: string;
    payAsYouGo?: string;
  };
  website?: string;
  apiEndpoint?: string;
  requiresApiKey: boolean;
}

// ==================== VIDEO PROVIDERS ====================

const videoProviders: AIProvider[] = [
  // TIER 1 - PREMIUM
  {
    id: 'openai-sora',
    name: 'OpenAI Sora',
    category: 'video',
    tier: 'premium',
    description: 'Revolutionary text-to-video with unprecedented quality and understanding',
    models: [
      { id: 'sora-2.0', name: 'Sora 2.0', maxResolution: '4K', maxDuration: 60, features: ['Text-to-video', 'Storyboard mode', 'Camera control', 'Physics simulation'] },
      { id: 'sora-turbo', name: 'Sora Turbo', maxResolution: '1080p', maxDuration: 30, features: ['Fast generation', 'Text-to-video'] }
    ],
    features: ['Storyboard mode', 'Camera control', 'Physics-aware', 'Long-form narrative'],
    pricing: { subscription: '$20-200/mo', payAsYouGo: '$0.08-0.50/sec' },
    website: 'https://openai.com/sora',
    requiresApiKey: true
  },
  {
    id: 'runway',
    name: 'Runway',
    category: 'video',
    tier: 'premium',
    description: 'Professional video generation and editing suite',
    models: [
      { id: 'gen-4', name: 'Gen-4', maxResolution: '4K', maxDuration: 40, features: ['Text-to-video', 'Image-to-video', 'Motion brush', 'Green screen'] },
      { id: 'gen-4-turbo', name: 'Gen-4 Turbo', maxResolution: '1080p', maxDuration: 20, features: ['Fast generation'] },
      { id: 'gen-3-alpha', name: 'Gen-3 Alpha', maxResolution: '1080p', maxDuration: 30, features: ['Experimental features'] }
    ],
    features: ['Motion brush', 'Green screen', 'Inpainting', 'Frame interpolation', 'Upscaling'],
    pricing: { subscription: '$12-76/mo', payAsYouGo: '$0.05/sec' },
    website: 'https://runwayml.com',
    requiresApiKey: true
  },
  {
    id: 'kling',
    name: 'Kling AI',
    category: 'video',
    tier: 'premium',
    description: 'Chinese powerhouse with exceptional motion and character animation',
    models: [
      { id: 'kling-1.6-pro', name: 'Kling 1.6 Pro', maxResolution: '4K', maxDuration: 120, features: ['Text-to-video', 'Lip-sync', 'Face swap', 'Character animation'] },
      { id: 'kling-1.6', name: 'Kling 1.6', maxResolution: '1080p', maxDuration: 60, features: ['Standard generation'] }
    ],
    features: ['Lip-sync', 'Face swap', 'Character animation', 'Long duration', 'High motion quality'],
    pricing: { free: true, subscription: '$9-60/mo' },
    website: 'https://klingai.com',
    requiresApiKey: true
  },
  {
    id: 'luma',
    name: 'Luma AI',
    category: 'video',
    tier: 'premium',
    description: '3D-aware video generation with extend and loop capabilities',
    models: [
      { id: 'ray-2', name: 'Ray 2', maxResolution: '4K', maxDuration: 120, features: ['Text-to-video', '3D capture', 'Extend', 'Loop'] },
      { id: 'ray-2-flash', name: 'Ray 2 Flash', maxResolution: '1080p', maxDuration: 60, features: ['Fast generation'] },
      { id: 'dream-machine-1.5', name: 'Dream Machine 1.5', maxResolution: '1080p', maxDuration: 60, features: ['Image-to-video'] }
    ],
    features: ['3D-aware', 'Video extend', 'Loop video', 'Camera control', 'NeRF support'],
    pricing: { free: true, subscription: '$10-120/mo' },
    website: 'https://lumalabs.ai',
    requiresApiKey: true
  },
  {
    id: 'google-veo',
    name: 'Google Veo',
    category: 'video',
    tier: 'premium',
    description: 'Google\'s flagship video model with 8K support and physics simulation',
    models: [
      { id: 'veo-2-pro', name: 'Veo 2 Pro', maxResolution: '8K', maxDuration: 180, features: ['Text-to-video', 'Physics simulation', 'Long-form', 'Camera control'] },
      { id: 'veo-2', name: 'Veo 2', maxResolution: '4K', maxDuration: 120, features: ['Standard generation'] }
    ],
    features: ['8K resolution', 'Physics simulation', 'Long-form video', 'Camera control', 'Cinematic quality'],
    pricing: { subscription: 'Enterprise' },
    website: 'https://deepmind.google/technologies/veo',
    requiresApiKey: true
  },

  // TIER 2 - STANDARD
  {
    id: 'pika',
    name: 'Pika Labs',
    category: 'video',
    tier: 'standard',
    description: 'User-friendly video generation with sound effects',
    models: [
      { id: 'pika-2.0', name: 'Pika 2.0', maxResolution: '1080p', maxDuration: 20, features: ['Text-to-video', 'Image-to-video', 'Sound effects', 'Region modify'] }
    ],
    features: ['Sound effects', 'Region modify', 'Extend', 'Lip-sync'],
    pricing: { free: true, subscription: '$8-58/mo' },
    website: 'https://pika.art',
    requiresApiKey: true
  },
  {
    id: 'minimax',
    name: 'MiniMax Hailuo',
    category: 'video',
    tier: 'standard',
    description: 'Chinese video model with subject reference',
    models: [
      { id: 'hailuo-1.0', name: 'Hailuo 1.0', maxResolution: '1080p', maxDuration: 30, features: ['Text-to-video', 'Subject reference'] }
    ],
    features: ['Subject reference', 'High quality', 'Fast generation'],
    pricing: { free: true },
    website: 'https://hailuoai.com',
    requiresApiKey: false
  },
  {
    id: 'stability-video',
    name: 'Stability Video',
    category: 'video',
    tier: 'standard',
    description: 'Stable Diffusion for video with motion control',
    models: [
      { id: 'svd-2.0', name: 'SVD 2.0', maxResolution: '1080p', maxDuration: 15, features: ['Image-to-video', 'Motion bucket', 'Camera control'] }
    ],
    features: ['Motion bucket control', 'Camera motion', 'High quality'],
    pricing: { payAsYouGo: '$0.02/frame' },
    website: 'https://stability.ai',
    requiresApiKey: true
  },
  {
    id: 'haiper',
    name: 'Haiper',
    category: 'video',
    tier: 'standard',
    description: 'Fast and accessible video generation',
    models: [
      { id: 'haiper-2.0', name: 'Haiper 2.0', maxResolution: '1080p', maxDuration: 20, features: ['Text-to-video', 'Image-to-video'] }
    ],
    features: ['Fast generation', 'Style control', 'Repainting'],
    pricing: { free: true, subscription: '$10/mo' },
    website: 'https://haiper.ai',
    requiresApiKey: false
  },
  {
    id: 'pixverse',
    name: 'PixVerse',
    category: 'video',
    tier: 'standard',
    description: 'Creative video generation platform',
    models: [
      { id: 'pixverse-v3', name: 'PixVerse V3', maxResolution: '1080p', maxDuration: 20, features: ['Text-to-video', 'Image-to-video', 'Character animation'] }
    ],
    features: ['Character animation', 'Anime style', 'Multiple aspect ratios'],
    pricing: { free: true, subscription: '$8/mo' },
    website: 'https://pixverse.ai',
    requiresApiKey: false
  },
  {
    id: 'morph',
    name: 'Morph Studio',
    category: 'video',
    tier: 'standard',
    description: 'Text-to-video with creative control',
    models: [
      { id: 'morph-1.0', name: 'Morph 1.0', maxResolution: '1080p', maxDuration: 15, features: ['Text-to-video', 'Style presets'] }
    ],
    features: ['Style presets', 'Camera control', 'Batch generation'],
    pricing: { free: true, subscription: '$15/mo' },
    website: 'https://morphstudio.com',
    requiresApiKey: false
  },
  {
    id: 'vidu',
    name: 'Vidu',
    category: 'video',
    tier: 'standard',
    description: 'AI video generation with Chinese roots',
    models: [
      { id: 'vidu-1.5', name: 'Vidu 1.5', maxResolution: '1080p', maxDuration: 30, features: ['Text-to-video', 'Image-to-video'] }
    ],
    features: ['High quality', 'Fast generation', 'Multiple styles'],
    pricing: { free: true },
    website: 'https://vidu.studio',
    requiresApiKey: false
  },
  {
    id: 'krea',
    name: 'Krea AI',
    category: 'video',
    tier: 'standard',
    description: 'Real-time video generation and editing',
    models: [
      { id: 'krea-video-1.0', name: 'Krea Video 1.0', maxResolution: '1080p', maxDuration: 10, features: ['Text-to-video', 'Real-time preview'] }
    ],
    features: ['Real-time generation', 'Style mixing', 'Pattern control'],
    pricing: { free: true, subscription: '$24/mo' },
    website: 'https://krea.ai',
    requiresApiKey: false
  },
  {
    id: 'domo',
    name: 'Domo AI',
    category: 'video',
    tier: 'standard',
    description: 'Video style transfer and animation',
    models: [
      { id: 'domo-1.0', name: 'Domo 1.0', maxResolution: '1080p', maxDuration: 20, features: ['Video-to-video', 'Style transfer', 'Animation'] }
    ],
    features: ['Style transfer', 'Anime conversion', 'Video enhancement'],
    pricing: { free: true },
    website: 'https://domoai.app',
    requiresApiKey: false
  },

  // TIER 3 - AVATAR SPECIALISTS
  {
    id: 'heygen',
    name: 'HeyGen',
    category: 'video',
    tier: 'specialist',
    description: 'Professional avatar and talking head generation',
    models: [
      { id: 'heygen-5.0', name: 'HeyGen 5.0', maxResolution: '4K', maxDuration: 300, features: ['Avatar video', 'Voice clone', 'Translation', 'Lip-sync'] },
      { id: 'heygen-streaming', name: 'HeyGen Streaming', maxResolution: '1080p', features: ['Real-time avatar', 'Interactive'] }
    ],
    features: ['Voice cloning', 'Translation', 'Custom avatars', 'Streaming avatars', 'Lip-sync'],
    pricing: { subscription: '$24-180/mo', payAsYouGo: '$0.10/min' },
    website: 'https://heygen.com',
    requiresApiKey: true
  },
  {
    id: 'synthesia',
    name: 'Synthesia',
    category: 'video',
    tier: 'specialist',
    description: 'Enterprise avatar video platform',
    models: [
      { id: 'synthesia-2.0', name: 'Synthesia 2.0', maxResolution: '4K', maxDuration: 600, features: ['Avatar video', '200+ avatars', 'Multi-language', 'Custom avatars'] }
    ],
    features: ['200+ pre-built avatars', 'Multi-language', 'Custom avatars', 'Templates', 'Enterprise features'],
    pricing: { subscription: '$22-67/mo' },
    website: 'https://synthesia.io',
    requiresApiKey: true
  },
  {
    id: 'did',
    name: 'D-ID',
    category: 'video',
    tier: 'specialist',
    description: 'Photo-to-talking-avatar technology',
    models: [
      { id: 'did-talks', name: 'D-ID Talks', maxResolution: '1080p', maxDuration: 300, features: ['Photo-to-avatar', 'Lip-sync', 'Voice clone'] }
    ],
    features: ['Photo-to-avatar', 'Lip-sync', 'Voice cloning', 'Multiple languages'],
    pricing: { free: true, subscription: '$6-196/mo' },
    website: 'https://d-id.com',
    requiresApiKey: true
  },
  {
    id: 'hedra',
    name: 'Hedra',
    category: 'video',
    tier: 'specialist',
    description: 'Character animation and lip-sync',
    models: [
      { id: 'character-1', name: 'Character-1', maxResolution: '1080p', maxDuration: 60, features: ['Character animation', 'Audio-to-video', 'Lip-sync'] }
    ],
    features: ['Audio-driven animation', 'Character creation', 'Expressive lip-sync'],
    pricing: { free: true, subscription: '$10/mo' },
    website: 'https://hedra.com',
    requiresApiKey: false
  },
  {
    id: 'liveportrait',
    name: 'LivePortrait',
    category: 'video',
    tier: 'opensource',
    description: 'Open source portrait animation',
    models: [
      { id: 'liveportrait-1.0', name: 'LivePortrait 1.0', maxResolution: '1080p', maxDuration: 300, features: ['Portrait reenactment', 'Expression transfer'] }
    ],
    features: ['Portrait reenactment', 'Expression transfer', 'Self-hostable'],
    pricing: { free: true },
    website: 'https://github.com/KwaiVGI/LivePortrait',
    requiresApiKey: false
  },
  {
    id: 'sadtalker',
    name: 'SadTalker',
    category: 'video',
    tier: 'opensource',
    description: 'Open source audio-driven talking head',
    models: [
      { id: 'sadtalker-1.0', name: 'SadTalker 1.0', maxResolution: '1080p', maxDuration: 300, features: ['Audio-to-video', 'Talking head'] }
    ],
    features: ['Audio-driven', 'Natural motion', 'Self-hostable'],
    pricing: { free: true },
    website: 'https://github.com/OpenTalker/SadTalker',
    requiresApiKey: false
  },

  // TIER 4 - OPEN SOURCE
  {
    id: 'genmo',
    name: 'Genmo',
    category: 'video',
    tier: 'opensource',
    description: 'Open source video generation',
    models: [
      { id: 'mochi-1', name: 'Mochi 1', maxResolution: '720p', maxDuration: 10, features: ['Text-to-video', 'Open weights'] }
    ],
    features: ['Open weights', 'Self-hostable', 'High quality'],
    pricing: { free: true },
    website: 'https://genmo.ai',
    requiresApiKey: false
  },
  {
    id: 'ltx-video',
    name: 'LTX Video',
    category: 'video',
    tier: 'opensource',
    description: 'Lightricks open source video model',
    models: [
      { id: 'ltx-video-1.0', name: 'LTX Video 1.0', maxResolution: '768p', maxDuration: 5, features: ['Text-to-video', 'Image-to-video'] }
    ],
    features: ['Fast generation', 'Open weights', 'Commercial friendly'],
    pricing: { free: true },
    website: 'https://github.com/Lightricks/LTX-Video',
    requiresApiKey: false
  },
  {
    id: 'cogvideo',
    name: 'CogVideo',
    category: 'video',
    tier: 'opensource',
    description: 'Tsinghua University open source video model',
    models: [
      { id: 'cogvideox-5b', name: 'CogVideoX-5B', maxResolution: '720p', maxDuration: 10, features: ['Text-to-video', 'Open weights'] },
      { id: 'cogvideox-2b', name: 'CogVideoX-2B', maxResolution: '720p', maxDuration: 6, features: ['Text-to-video', 'Fast'] }
    ],
    features: ['Open weights', 'Self-hostable', 'Good quality'],
    pricing: { free: true },
    website: 'https://github.com/THUDM/CogVideo',
    requiresApiKey: false
  },
  {
    id: 'hunyuan',
    name: 'Hunyuan Video',
    category: 'video',
    tier: 'opensource',
    description: 'Tencent open source video model',
    models: [
      { id: 'hunyuan-video-1.0', name: 'Hunyuan Video 1.0', maxResolution: '720p', maxDuration: 5, features: ['Text-to-video', 'Open weights'] }
    ],
    features: ['Open weights', 'High quality', 'Chinese + English'],
    pricing: { free: true },
    website: 'https://github.com/Tencent/HunyuanVideo',
    requiresApiKey: false
  },
  {
    id: 'allegro',
    name: 'Allegro',
    category: 'video',
    tier: 'opensource',
    description: 'Rhymes AI open source video model',
    models: [
      { id: 'allegro-1.0', name: 'Allegro 1.0', maxResolution: '720p', maxDuration: 6, features: ['Text-to-video', 'Open weights'] }
    ],
    features: ['Open weights', 'Good motion', 'Self-hostable'],
    pricing: { free: true },
    website: 'https://rhymes.ai',
    requiresApiKey: false
  },
  {
    id: 'pyramid-flow',
    name: 'Pyramid Flow',
    category: 'video',
    tier: 'opensource',
    description: 'Flow-based video generation',
    models: [
      { id: 'pyramid-flow-1.0', name: 'Pyramid Flow 1.0', maxResolution: '768p', maxDuration: 10, features: ['Text-to-video', 'Image-to-video'] }
    ],
    features: ['Flow matching', 'High efficiency', 'Open weights'],
    pricing: { free: true },
    website: 'https://github.com/jy0205/Pyramid-Flow',
    requiresApiKey: false
  },
  {
    id: 'animatediff',
    name: 'AnimateDiff',
    category: 'video',
    tier: 'opensource',
    description: 'Animation for Stable Diffusion',
    models: [
      { id: 'animatediff-v3', name: 'AnimateDiff V3', maxResolution: '512p', maxDuration: 5, features: ['Image-to-video', 'Motion modules'] },
      { id: 'animatediff-lightning', name: 'AnimateDiff Lightning', maxResolution: '512p', maxDuration: 3, features: ['Fast generation'] }
    ],
    features: ['Motion modules', 'SD compatible', 'ControlNet support'],
    pricing: { free: true },
    website: 'https://github.com/guoyww/AnimateDiff',
    requiresApiKey: false
  },
  {
    id: 'hotshot-xl',
    name: 'Hotshot-XL',
    category: 'video',
    tier: 'opensource',
    description: 'SDXL-based video generation',
    models: [
      { id: 'hotshot-xl-1.0', name: 'Hotshot-XL 1.0', maxResolution: '512p', maxDuration: 4, features: ['Text-to-video', 'GIF generation'] }
    ],
    features: ['SDXL-based', 'GIF support', 'Open weights'],
    pricing: { free: true },
    website: 'https://github.com/hotshotco/Hotshot-XL',
    requiresApiKey: false
  }
];

// ==================== IMAGE PROVIDERS ====================

const imageProviders: AIProvider[] = [
  // PREMIUM TIER
  {
    id: 'midjourney',
    name: 'Midjourney',
    category: 'image',
    tier: 'premium',
    description: 'The gold standard for AI art and creative imagery',
    models: [
      { id: 'v7', name: 'V7', maxResolution: '4096x4096', features: ['Text-to-image', 'Style reference', 'Character reference', 'Vary region'] },
      { id: 'v6.1', name: 'V6.1', maxResolution: '4096x4096', features: ['Text-to-image', 'Consistent style'] },
      { id: 'niji-6', name: 'Niji 6', maxResolution: '4096x4096', features: ['Anime/manga specialist'] }
    ],
    features: ['Best artistic quality', 'Style consistency', 'Character reference', 'Vary region', 'Permutation prompts'],
    pricing: { subscription: '$10-120/mo' },
    website: 'https://midjourney.com',
    requiresApiKey: true
  },
  {
    id: 'openai-dalle',
    name: 'OpenAI DALL-E',
    category: 'image',
    tier: 'premium',
    description: 'OpenAI\'s powerful image generation',
    models: [
      { id: 'dalle-4', name: 'DALL-E 4', maxResolution: '4096x4096', features: ['Text-to-image', 'Inpainting', 'Outpainting', 'Variations'] },
      { id: 'dalle-3', name: 'DALL-E 3', maxResolution: '1792x1024', features: ['Text-to-image', 'ChatGPT integration'] },
      { id: 'gpt-image-1', name: 'GPT Image 1', maxResolution: '2048x2048', features: ['Fast generation'] }
    ],
    features: ['Prompt following', 'Photorealism', 'Inpainting', 'Variations', 'ChatGPT integration'],
    pricing: { payAsYouGo: '$0.04-0.08/image' },
    website: 'https://openai.com/dall-e',
    requiresApiKey: true
  },
  {
    id: 'flux',
    name: 'FLUX (Black Forest Labs)',
    category: 'image',
    tier: 'premium',
    description: 'State-of-the-art image generation from Stability AI founders',
    models: [
      { id: 'flux-1.1-ultra', name: 'FLUX 1.1 Ultra', maxResolution: '2048x2048', features: ['Text-to-image', 'Best quality', 'Fast'] },
      { id: 'flux-1.1-pro', name: 'FLUX 1.1 Pro', maxResolution: '2048x2048', features: ['Text-to-image', 'High quality'] },
      { id: 'flux-1-dev', name: 'FLUX 1 Dev', maxResolution: '2048x2048', features: ['Open weights', 'Commercial use'] },
      { id: 'flux-1-schnell', name: 'FLUX 1 Schnell', maxResolution: '1024x1024', features: ['Fast', 'Open weights'] },
      { id: 'flux-kontext', name: 'FLUX Kontext', maxResolution: '2048x2048', features: ['Context-aware'] },
      { id: 'flux-fill', name: 'FLUX Fill', maxResolution: '2048x2048', features: ['Inpainting'] },
      { id: 'flux-canny', name: 'FLUX Canny', maxResolution: '2048x2048', features: ['Edge-guided'] },
      { id: 'flux-depth', name: 'FLUX Depth', maxResolution: '2048x2048', features: ['Depth-guided'] }
    ],
    features: ['Best prompt following', 'Photorealism', 'ControlNet variants', 'Open weights options'],
    pricing: { free: true, payAsYouGo: '$0.003-0.06/image' },
    website: 'https://blackforestlabs.ai',
    requiresApiKey: true
  },
  {
    id: 'stability',
    name: 'Stability AI',
    category: 'image',
    tier: 'premium',
    description: 'Stable Diffusion creators with cutting-edge models',
    models: [
      { id: 'sd-3.5-large', name: 'SD 3.5 Large', maxResolution: '2048x2048', features: ['Text-to-image', 'High quality'] },
      { id: 'sd-3.5-turbo', name: 'SD 3.5 Turbo', maxResolution: '1024x1024', features: ['Fast generation'] },
      { id: 'sd-ultra', name: 'SD Ultra', maxResolution: '4096x4096', features: ['Ultra high quality'] },
      { id: 'sd-core', name: 'SD Core', maxResolution: '1024x1024', features: ['Affordable'] }
    ],
    features: ['High quality', 'Multiple resolutions', 'ControlNet support', 'Fine-tuning'],
    pricing: { payAsYouGo: '$0.02-0.08/image' },
    website: 'https://stability.ai',
    requiresApiKey: true
  },
  {
    id: 'ideogram',
    name: 'Ideogram',
    category: 'image',
    tier: 'premium',
    description: 'Best-in-class text rendering in images',
    models: [
      { id: 'ideogram-3.0', name: 'Ideogram 3.0', maxResolution: '2048x2048', features: ['Text-to-image', 'Perfect text', 'Style presets'] },
      { id: 'ideogram-2.0', name: 'Ideogram 2.0', maxResolution: '2048x2048', features: ['Text-to-image', 'Text rendering'] },
      { id: 'ideogram-turbo', name: 'Ideogram Turbo', maxResolution: '1024x1024', features: ['Fast generation'] }
    ],
    features: ['Best text rendering', 'Style presets', 'Magic prompt', 'Remix'],
    pricing: { free: true, subscription: '$8-48/mo' },
    website: 'https://ideogram.ai',
    requiresApiKey: true
  },
  {
    id: 'google-imagen',
    name: 'Google Imagen',
    category: 'image',
    tier: 'premium',
    description: 'Google\'s enterprise-grade image generation',
    models: [
      { id: 'imagen-3', name: 'Imagen 3', maxResolution: '4096x4096', features: ['Text-to-image', 'Inpainting', 'Outpainting'] },
      { id: 'imagen-3-fast', name: 'Imagen 3 Fast', maxResolution: '2048x2048', features: ['Fast generation'] }
    ],
    features: ['Photorealism', 'Prompt adherence', 'Safety filters', 'Enterprise features'],
    pricing: { subscription: 'Enterprise' },
    website: 'https://deepmind.google/technologies/imagen',
    requiresApiKey: true
  },
  {
    id: 'adobe-firefly',
    name: 'Adobe Firefly',
    category: 'image',
    tier: 'premium',
    description: 'Adobe\'s commercially safe AI image generation',
    models: [
      { id: 'firefly-image-3', name: 'Firefly Image 3', maxResolution: '2048x2048', features: ['Text-to-image', 'Generative fill', 'Generative expand'] },
      { id: 'firefly-vector', name: 'Firefly Vector', features: ['Text-to-vector', 'SVG generation'] }
    ],
    features: ['Generative fill', 'Generative expand', 'Commercial safe', 'Adobe integration'],
    pricing: { free: true, subscription: '$5-60/mo' },
    website: 'https://firefly.adobe.com',
    requiresApiKey: true
  },

  // STANDARD/OPEN SOURCE
  {
    id: 'recraft',
    name: 'Recraft',
    category: 'image',
    tier: 'standard',
    description: 'Vector and raster AI generation',
    models: [
      { id: 'recraft-v3', name: 'Recraft V3', maxResolution: '2048x2048', features: ['Text-to-image', 'Text-to-vector', 'SVG support'] }
    ],
    features: ['Vector generation', 'Brand consistency', 'Style control', 'SVG export'],
    pricing: { free: true, subscription: '$12/mo' },
    website: 'https://recraft.ai',
    requiresApiKey: true
  },
  {
    id: 'leonardo',
    name: 'Leonardo AI',
    category: 'image',
    tier: 'standard',
    description: 'Creative AI platform with multiple models',
    models: [
      { id: 'phoenix', name: 'Phoenix', maxResolution: '1024x1024', features: ['Text-to-image', 'High quality'] },
      { id: 'kino-xl', name: 'Kino XL', maxResolution: '1024x1024', features: ['Cinematic', 'Film-like'] },
      { id: 'anime-xl', name: 'Anime XL', maxResolution: '1024x1024', features: ['Anime style'] }
    ],
    features: ['Multiple models', 'ControlNet', 'Canvas editor', 'Texture generation'],
    pricing: { free: true, subscription: '$12-48/mo' },
    website: 'https://leonardo.ai',
    requiresApiKey: true
  },
  {
    id: 'comfyui',
    name: 'ComfyUI',
    category: 'image',
    tier: 'opensource',
    description: 'Node-based Stable Diffusion interface',
    models: [
      { id: 'comfyui', name: 'ComfyUI', maxResolution: 'Unlimited', features: ['Node-based', 'All SD models', 'Workflows'] }
    ],
    features: ['Node-based UI', 'Workflow system', 'All SD models', 'ControlNet', 'LoRA support'],
    pricing: { free: true },
    website: 'https://github.com/comfyanonymous/ComfyUI',
    requiresApiKey: false
  },
  {
    id: 'automatic1111',
    name: 'Automatic1111 WebUI',
    category: 'image',
    tier: 'opensource',
    description: 'Popular Stable Diffusion web interface',
    models: [
      { id: 'a1111', name: 'A1111 WebUI', maxResolution: 'Unlimited', features: ['All SD models', 'Extensions', 'Scripts'] }
    ],
    features: ['Extensions', 'Scripts', 'All SD models', 'ControlNet', 'Inpainting'],
    pricing: { free: true },
    website: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui',
    requiresApiKey: false
  },
  {
    id: 'fooocus',
    name: 'Fooocus',
    category: 'image',
    tier: 'opensource',
    description: 'Simplified Stable Diffusion with Midjourney-like interface',
    models: [
      { id: 'fooocus', name: 'Fooocus', maxResolution: '2048x2048', features: ['Simplified UI', 'Quality focus'] }
    ],
    features: ['Simple interface', 'Quality presets', 'Inpainting', 'Upscaling'],
    pricing: { free: true },
    website: 'https://github.com/lllyasviel/Fooocus',
    requiresApiKey: false
  },
  {
    id: 'invoke',
    name: 'Invoke AI',
    category: 'image',
    tier: 'opensource',
    description: 'Professional Stable Diffusion platform',
    models: [
      { id: 'invoke', name: 'Invoke AI', maxResolution: 'Unlimited', features: ['Canvas', 'Workflows', 'All SD models'] }
    ],
    features: ['Canvas editor', 'Unified canvas', 'Node editor', 'Model manager'],
    pricing: { free: true },
    website: 'https://invoke.ai',
    requiresApiKey: false
  },
  {
    id: 'playground',
    name: 'Playground',
    category: 'image',
    tier: 'standard',
    description: 'Creative AI image generation platform',
    models: [
      { id: 'playground-v3', name: 'Playground V3', maxResolution: '1024x1024', features: ['Text-to-image', 'Image-to-image'] }
    ],
    features: ['Canvas editor', 'Multiple models', 'Community'],
    pricing: { free: true, subscription: '$15/mo' },
    website: 'https://playground.com',
    requiresApiKey: true
  },
  {
    id: 'getimg',
    name: 'GetImg',
    category: 'image',
    tier: 'standard',
    description: 'AI image tools suite',
    models: [
      { id: 'getimg-v1', name: 'GetImg V1', maxResolution: '1024x1024', features: ['Text-to-image', 'Inpainting', 'Outpainting'] }
    ],
    features: ['Multiple tools', 'ControlNet', 'DreamBooth', 'API access'],
    pricing: { free: true, subscription: '$12-99/mo' },
    website: 'https://getimg.ai',
    requiresApiKey: true
  },
  {
    id: 'lexica',
    name: 'Lexica',
    category: 'image',
    tier: 'standard',
    description: 'Search and generate AI images',
    models: [
      { id: 'aperture', name: 'Aperture', maxResolution: '1024x1024', features: ['Text-to-image', 'Photorealistic'] }
    ],
    features: ['Search engine', 'Prompt library', 'Generation'],
    pricing: { free: true, subscription: '$8-48/mo' },
    website: 'https://lexica.art',
    requiresApiKey: true
  },
  {
    id: 'tensor',
    name: 'Tensor.Art',
    category: 'image',
    tier: 'standard',
    description: 'Community AI image platform',
    models: [
      { id: 'tensor-v1', name: 'Tensor V1', maxResolution: '1024x1024', features: ['Text-to-image', 'Community models'] }
    ],
    features: ['Community models', 'LoRA support', 'Social features'],
    pricing: { free: true, subscription: '$10/mo' },
    website: 'https://tensor.art',
    requiresApiKey: false
  },
  {
    id: 'civitai',
    name: 'CivitAI',
    category: 'image',
    tier: 'standard',
    description: 'Largest AI model sharing platform',
    models: [
      { id: 'civitai-v1', name: 'CivitAI V1', maxResolution: '1024x1024', features: ['Community models', 'LoRAs', 'Embeddings'] }
    ],
    features: ['Model sharing', 'Community', 'LoRAs', 'Embeddings', 'Generation'],
    pricing: { free: true, subscription: '$10/mo' },
    website: 'https://civitai.com',
    requiresApiKey: false
  },
  {
    id: 'seaart',
    name: 'SeaArt',
    category: 'image',
    tier: 'standard',
    description: 'AI art generation platform',
    models: [
      { id: 'seaart-v1', name: 'SeaArt V1', maxResolution: '1024x1024', features: ['Text-to-image', 'Community models'] }
    ],
    features: ['Multiple models', 'Social features', 'Workflows'],
    pricing: { free: true, subscription: '$10/mo' },
    website: 'https://seaart.ai',
    requiresApiKey: false
  },
  {
    id: 'scenario',
    name: 'Scenario',
    category: 'image',
    tier: 'standard',
    description: 'AI for game assets',
    models: [
      { id: 'scenario-v1', name: 'Scenario V1', maxResolution: '1024x1024', features: ['Game assets', 'Style training'] }
    ],
    features: ['Game asset focus', 'Style training', 'Asset management'],
    pricing: { free: true, subscription: '$20-120/mo' },
    website: 'https://scenario.com',
    requiresApiKey: true
  },
  {
    id: 'nightcafe',
    name: 'NightCafe',
    category: 'image',
    tier: 'standard',
    description: 'AI art community platform',
    models: [
      { id: 'nightcafe-v1', name: 'NightCafe V1', maxResolution: '1024x1024', features: ['Multiple algorithms', 'Community'] }
    ],
    features: ['Multiple algorithms', 'Community', 'Contests', 'Print shop'],
    pricing: { free: true, subscription: '$6-50/mo' },
    website: 'https://nightcafe.studio',
    requiresApiKey: false
  }
];

// ==================== AUDIO PROVIDERS ====================

const audioProviders: AIProvider[] = [
  // MUSIC GENERATION
  {
    id: 'suno',
    name: 'Suno',
    category: 'audio',
    tier: 'premium',
    description: 'Revolutionary AI music generation with lyrics',
    models: [
      { id: 'suno-v5', name: 'Suno V5', maxDuration: 240, features: ['Text-to-music', 'Lyrics', 'Extend', 'Cover', 'Stems'] },
      { id: 'suno-v4.5', name: 'Suno V4.5', maxDuration: 180, features: ['Text-to-music', 'Instrumental'] },
      { id: 'suno-v4', name: 'Suno V4', maxDuration: 120, features: ['Text-to-music'] }
    ],
    features: ['Lyrics generation', 'Song extend', 'Cover songs', 'Stem separation', 'Multiple genres'],
    pricing: { free: true, subscription: '$8-30/mo' },
    website: 'https://suno.com',
    requiresApiKey: true
  },
  {
    id: 'udio',
    name: 'Udio',
    category: 'audio',
    tier: 'premium',
    description: 'High-quality AI music generation',
    models: [
      { id: 'udio-v2', name: 'Udio V2', maxDuration: 300, features: ['Text-to-music', 'Extend', 'Remix', 'Inpaint'] },
      { id: 'udio-v1.5', name: 'Udio V1.5', maxDuration: 180, features: ['Text-to-music'] }
    ],
    features: ['High quality', 'Song extend', 'Remix', 'Audio inpainting', 'Stem separation'],
    pricing: { free: true, subscription: '$10-30/mo' },
    website: 'https://udio.com',
    requiresApiKey: true
  },
  {
    id: 'stable-audio',
    name: 'Stable Audio',
    category: 'audio',
    tier: 'premium',
    description: 'Stability AI\'s music and sound effects generator',
    models: [
      { id: 'stable-audio-2.0', name: 'Stable Audio 2.0', maxDuration: 180, features: ['Text-to-music', 'Text-to-SFX', 'Stems'] },
      { id: 'stable-audio-open', name: 'Stable Audio Open', maxDuration: 47, features: ['Open weights', 'Commercial use'] }
    ],
    features: ['Music generation', 'Sound effects', 'Stem control', 'Open weights option'],
    pricing: { free: true, subscription: '$12-150/mo' },
    website: 'https://stability.ai/stable-audio',
    requiresApiKey: true
  },
  {
    id: 'meta-musicgen',
    name: 'Meta MusicGen',
    category: 'audio',
    tier: 'opensource',
    description: 'Meta\'s open source music generation',
    models: [
      { id: 'musicgen-large', name: 'MusicGen Large', maxDuration: 30, features: ['Text-to-music', 'Melody conditioning'] },
      { id: 'audiogen', name: 'AudioGen', maxDuration: 30, features: ['Text-to-SFX'] }
    ],
    features: ['Open source', 'Melody conditioning', 'Sound effects', 'Self-hostable'],
    pricing: { free: true },
    website: 'https://audiocraft.metademolab.com',
    requiresApiKey: false
  },
  {
    id: 'mubert',
    name: 'Mubert',
    category: 'audio',
    tier: 'standard',
    description: 'Royalty-free AI music generation',
    models: [
      { id: 'mubert-v1', name: 'Mubert V1', features: ['Text-to-music', 'Royalty-free', 'Infinite streams'] }
    ],
    features: ['Royalty-free', 'Infinite streams', 'Multiple genres', 'API access'],
    pricing: { free: true, subscription: '$14-199/mo' },
    website: 'https://mubert.com',
    requiresApiKey: true
  },
  {
    id: 'aiva',
    name: 'AIVA',
    category: 'audio',
    tier: 'standard',
    description: 'AI composer for soundtracks',
    models: [
      { id: 'aiva-v1', name: 'AIVA V1', features: ['Composition', 'Multiple genres', 'MIDI export'] }
    ],
    features: ['Composition', 'MIDI export', 'Multiple genres', 'Customization'],
    pricing: { free: true, subscription: '$11-33/mo' },
    website: 'https://aiva.ai',
    requiresApiKey: true
  },
  {
    id: 'boomy',
    name: 'Boomy',
    category: 'audio',
    tier: 'standard',
    description: 'Create and monetize AI music',
    models: [
      { id: 'boomy-v1', name: 'Boomy V1', features: ['Text-to-music', 'Distribution', 'Monetization'] }
    ],
    features: ['Music generation', 'Distribution', 'Monetization', 'Social features'],
    pricing: { free: true, subscription: '$3-30/mo' },
    website: 'https://boomy.com',
    requiresApiKey: true
  },
  {
    id: 'soundraw',
    name: 'Soundraw',
    category: 'audio',
    tier: 'standard',
    description: 'Customizable AI music',
    models: [
      { id: 'soundraw-v1', name: 'Soundraw V1', features: ['AI music', 'Customization', 'Royalty-free'] }
    ],
    features: ['Customizable', 'Royalty-free', 'Unlimited downloads', 'Commercial use'],
    pricing: { subscription: '$16-50/mo' },
    website: 'https://soundraw.io',
    requiresApiKey: true
  },
  {
    id: 'beatoven',
    name: 'Beatoven',
    category: 'audio',
    tier: 'standard',
    description: 'AI music for content creators',
    models: [
      { id: 'beatoven-v1', name: 'Beatoven V1', features: ['Text-to-music', 'Mood-based', 'Royalty-free'] }
    ],
    features: ['Mood-based', 'Royalty-free', 'Customization', 'Multiple genres'],
    pricing: { free: true, subscription: '$20/mo' },
    website: 'https://beatoven.ai',
    requiresApiKey: true
  },

  // VOICE/TTS
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    category: 'audio',
    tier: 'premium',
    description: 'Ultra-realistic voice synthesis and cloning',
    models: [
      { id: 'turbo-v2.5', name: 'Turbo V2.5', features: ['TTS', 'Voice clone', 'Low latency'] },
      { id: 'multilingual-v2', name: 'Multilingual V2', features: ['TTS', '30 languages', 'Voice clone'] },
      { id: 'flash-v2.5', name: 'Flash V2.5', features: ['Fast TTS', 'Low cost'] }
    ],
    features: ['Voice cloning', '30 languages', 'Sound effects', 'Projects', 'Dubbing'],
    pricing: { free: true, subscription: '$5-330/mo', payAsYouGo: '$0.30/1000 chars' },
    website: 'https://elevenlabs.io',
    requiresApiKey: true
  },
  {
    id: 'openai-tts',
    name: 'OpenAI TTS',
    category: 'audio',
    tier: 'premium',
    description: 'OpenAI text-to-speech',
    models: [
      { id: 'tts-1', name: 'TTS-1', features: ['TTS', '6 voices', 'Fast'] },
      { id: 'tts-1-hd', name: 'TTS-1-HD', features: ['TTS', 'HD audio', '6 voices'] },
      { id: 'gpt-4o-audio', name: 'GPT-4o Audio', features: ['Conversational', 'Real-time'] }
    ],
    features: ['Natural voices', 'HD audio', 'Conversational mode', 'Multiple voices'],
    pricing: { payAsYouGo: '$0.015-0.030/1000 chars' },
    website: 'https://platform.openai.com/docs/guides/text-to-speech',
    requiresApiKey: true
  },
  {
    id: 'playht',
    name: 'Play.ht',
    category: 'audio',
    tier: 'premium',
    description: 'Ultra-realistic voice generation',
    models: [
      { id: 'playht-3.0', name: 'Play.ht 3.0', features: ['TTS', 'Voice clone', 'Emotion control'] },
      { id: 'playht-2.0-turbo', name: 'Play.ht 2.0 Turbo', features: ['Fast TTS', 'Voice clone'] }
    ],
    features: ['Voice cloning', 'Emotion control', 'Podcast mode', 'Multi-voice'],
    pricing: { free: true, subscription: '$31-199/mo' },
    website: 'https://play.ht',
    requiresApiKey: true
  },
  {
    id: 'resemble',
    name: 'Resemble AI',
    category: 'audio',
    tier: 'premium',
    description: 'Real-time voice cloning',
    models: [
      { id: 'resemble-realtime', name: 'Resemble Realtime', features: ['Real-time TTS', 'Voice clone', 'Low latency'] }
    ],
    features: ['Real-time synthesis', 'Voice cloning', 'Emotion control', 'Localization'],
    pricing: { subscription: '$0.006/sec' },
    website: 'https://resemble.ai',
    requiresApiKey: true
  },
  {
    id: 'coqui',
    name: 'Coqui TTS',
    category: 'audio',
    tier: 'opensource',
    description: 'Open source voice synthesis',
    models: [
      { id: 'xtts-v2', name: 'XTTS V2', features: ['TTS', 'Voice clone', 'Multi-language', 'Open weights'] }
    ],
    features: ['Open source', 'Voice cloning', 'Multi-language', 'Self-hostable'],
    pricing: { free: true },
    website: 'https://github.com/coqui-ai/TTS',
    requiresApiKey: false
  },
  {
    id: 'fish-audio',
    name: 'Fish Audio',
    category: 'audio',
    tier: 'opensource',
    description: 'Open source voice synthesis',
    models: [
      { id: 'fish-speech', name: 'Fish Speech', features: ['TTS', 'Voice clone', 'Multi-language'] }
    ],
    features: ['Open source', 'Voice cloning', 'Multi-language', 'Self-hostable'],
    pricing: { free: true },
    website: 'https://github.com/fishaudio/fish-speech',
    requiresApiKey: false
  },
  {
    id: 'bark',
    name: 'Bark',
    category: 'audio',
    tier: 'opensource',
    description: 'Text-to-audio model by Suno',
    models: [
      { id: 'bark-v1', name: 'Bark V1', features: ['TTS', 'Multi-language', 'Sound effects'] }
    ],
    features: ['Open source', 'Multi-language', 'Sound effects', 'Laughter', 'Music'],
    pricing: { free: true },
    website: 'https://github.com/suno-ai/bark',
    requiresApiKey: false
  },

  // AUDIO PROCESSING
  {
    id: 'demucs',
    name: 'Demucs',
    category: 'audio',
    tier: 'opensource',
    description: 'Music source separation',
    models: [
      { id: 'demucs-v4', name: 'Demucs V4', features: ['Stem separation', '4-6 stems', 'High quality'] }
    ],
    features: ['Stem separation', 'Vocals', 'Drums', 'Bass', 'Other instruments'],
    pricing: { free: true },
    website: 'https://github.com/facebookresearch/demucs',
    requiresApiKey: false
  },
  {
    id: 'whisper',
    name: 'Whisper',
    category: 'audio',
    tier: 'opensource',
    description: 'Speech recognition by OpenAI',
    models: [
      { id: 'whisper-large-v3', name: 'Whisper Large V3', features: ['Speech-to-text', 'Multi-language', 'Translation'] },
      { id: 'whisper-medium', name: 'Whisper Medium', features: ['Speech-to-text', 'Fast'] },
      { id: 'whisper-turbo', name: 'Whisper Turbo', features: ['Speech-to-text', 'Ultra-fast'] }
    ],
    features: ['Speech-to-text', 'Multi-language', 'Translation', 'Timestamps'],
    pricing: { free: true },
    website: 'https://github.com/openai/whisper',
    requiresApiKey: false
  },
  {
    id: 'rvc',
    name: 'RVC (Retrieval-based Voice Conversion)',
    category: 'audio',
    tier: 'opensource',
    description: 'Voice conversion',
    models: [
      { id: 'rvc-v2', name: 'RVC V2', features: ['Voice conversion', 'Voice training'] }
    ],
    features: ['Voice conversion', 'Voice training', 'Real-time', 'Self-hostable'],
    pricing: { free: true },
    website: 'https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI',
    requiresApiKey: false
  }
];

// Import extended providers
import { llmProviders, threeDProviders, toolsProviders } from './ai-providers-extended';

export const aiProvidersRegistry = {
  video: videoProviders,
  image: imageProviders,
  audio: audioProviders,
  llm: llmProviders,
  '3d': threeDProviders,
  tools: toolsProviders
};

export const getAllProviders = (): AIProvider[] => {
  return [
    ...videoProviders,
    ...imageProviders,
    ...audioProviders,
    ...llmProviders,
    ...threeDProviders,
    ...toolsProviders
  ];
};

export const getProviderById = (id: string): AIProvider | undefined => {
  return getAllProviders().find(p => p.id === id);
};

export const getProvidersByCategory = (category: AIProvider['category']): AIProvider[] => {
  return getAllProviders().filter(p => p.category === category);
};

export const getTotalStats = () => {
  const allProviders = getAllProviders();
  const totalModels = allProviders.reduce((sum, p) => sum + p.models.length, 0);

  return {
    totalProviders: allProviders.length,
    totalModels,
    byCategory: {
      video: videoProviders.length,
      image: imageProviders.length,
      audio: audioProviders.length,
      llm: llmProviders.length,
      '3d': threeDProviders.length,
      tools: toolsProviders.length
    }
  };
};

export { videoProviders, imageProviders, audioProviders };
