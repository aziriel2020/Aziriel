/**
 * NEURAFIELD QUANTUM v5.0 - Extended AI Providers (LLM, 3D, Tools)
 */

import { AIProvider } from './ai-providers-registry';

// ==================== LLM PROVIDERS ====================

export const llmProviders: AIProvider[] = [
  // FRONTIER MODELS
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'llm',
    tier: 'premium',
    description: 'Leading AI research lab with GPT and reasoning models',
    models: [
      { id: 'gpt-4.1', name: 'GPT-4.1', contextWindow: 128000, features: ['Chat', 'Vision', 'Function calling'] },
      { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', contextWindow: 128000, features: ['Fast', 'Affordable'] },
      { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', contextWindow: 128000, features: ['Ultra-fast', 'Low cost'] },
      { id: 'gpt-4o', name: 'GPT-4o', contextWindow: 128000, features: ['Omni-modal', 'Vision', 'Audio'] },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000, features: ['Fast omni-modal'] },
      { id: 'o1', name: 'o1', contextWindow: 200000, features: ['Advanced reasoning'] },
      { id: 'o1-mini', name: 'o1 Mini', contextWindow: 128000, features: ['Fast reasoning'] },
      { id: 'o1-pro', name: 'o1 Pro', contextWindow: 200000, features: ['Maximum reasoning'] },
      { id: 'o3', name: 'o3', contextWindow: 200000, features: ['Next-gen reasoning'] },
      { id: 'o3-mini', name: 'o3 Mini', contextWindow: 128000, features: ['Efficient reasoning'] },
      { id: 'o4-mini', name: 'o4 Mini', contextWindow: 128000, features: ['Latest reasoning'] }
    ],
    features: ['Function calling', 'Vision', 'Audio', 'Reasoning', 'JSON mode', 'Structured outputs'],
    pricing: { payAsYouGo: '$0.15-$15/1M tokens' },
    website: 'https://openai.com',
    requiresApiKey: true
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    category: 'llm',
    tier: 'premium',
    description: 'Claude models with extended thinking and computer use',
    models: [
      { id: 'claude-opus-4', name: 'Claude Opus 4', contextWindow: 200000, features: ['Best intelligence', 'Extended thinking', 'Computer use'] },
      { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', contextWindow: 200000, features: ['Balanced performance'] },
      { id: 'claude-4.5-opus', name: 'Claude 4.5 Opus', contextWindow: 200000, features: ['Enhanced opus'] },
      { id: 'claude-4.5-sonnet', name: 'Claude 4.5 Sonnet', contextWindow: 200000, features: ['Enhanced sonnet'] },
      { id: 'claude-4.5-haiku', name: 'Claude 4.5 Haiku', contextWindow: 200000, features: ['Fast', 'Affordable'] },
      { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', contextWindow: 200000, features: ['Best value'] },
      { id: 'claude-3.5-haiku', name: 'Claude 3.5 Haiku', contextWindow: 200000, features: ['Fast responses'] }
    ],
    features: ['Extended thinking', 'Computer use', 'Vision', 'Long context', 'Constitutional AI'],
    pricing: { payAsYouGo: '$0.25-$15/1M tokens' },
    website: 'https://anthropic.com',
    requiresApiKey: true
  },
  {
    id: 'google-gemini',
    name: 'Google Gemini',
    category: 'llm',
    tier: 'premium',
    description: 'Google\'s multimodal AI with massive context windows',
    models: [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', contextWindow: 2000000, features: ['2M context', 'Multimodal', 'Thinking mode'] },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', contextWindow: 1000000, features: ['1M context', 'Fast'] },
      { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro', contextWindow: 1000000, features: ['Multimodal'] },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', contextWindow: 1000000, features: ['Fast', 'Affordable'] },
      { id: 'gemini-2.0-flash-thinking', name: 'Gemini 2.0 Flash Thinking', contextWindow: 1000000, features: ['Reasoning', 'Fast'] },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', contextWindow: 2000000, features: ['2M context'] }
    ],
    features: ['Massive context', 'Multimodal', 'Thinking mode', 'Search grounding', 'Code execution'],
    pricing: { free: true, payAsYouGo: '$0.075-$7.50/1M tokens' },
    website: 'https://deepmind.google/technologies/gemini',
    requiresApiKey: true
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    category: 'llm',
    tier: 'opensource',
    description: 'Chinese AI lab with reasoning models',
    models: [
      { id: 'deepseek-r1', name: 'DeepSeek R1', contextWindow: 128000, features: ['Advanced reasoning', 'Open weights'] },
      { id: 'deepseek-r1-zero', name: 'DeepSeek R1 Zero', contextWindow: 128000, features: ['Pure reasoning', 'No RLHF'] },
      { id: 'deepseek-v3', name: 'DeepSeek V3', contextWindow: 128000, features: ['General purpose', 'Open weights'] },
      { id: 'deepseek-coder-v2', name: 'DeepSeek Coder V2', contextWindow: 128000, features: ['Code specialist'] }
    ],
    features: ['Reasoning', 'Open weights', 'Coding', 'Math', 'Self-hostable'],
    pricing: { free: true, payAsYouGo: '$0.14-0.55/1M tokens' },
    website: 'https://deepseek.com',
    requiresApiKey: true
  },
  {
    id: 'xai',
    name: 'xAI',
    category: 'llm',
    tier: 'premium',
    description: 'Elon Musk\'s AI with real-time data access',
    models: [
      { id: 'grok-3', name: 'Grok 3', contextWindow: 128000, features: ['Latest', 'Real-time data', 'Humor'] },
      { id: 'grok-2', name: 'Grok 2', contextWindow: 128000, features: ['Real-time data', 'Vision'] },
      { id: 'grok-2-mini', name: 'Grok 2 Mini', contextWindow: 128000, features: ['Fast', 'Affordable'] },
      { id: 'grok-2-vision', name: 'Grok 2 Vision', contextWindow: 128000, features: ['Multimodal'] }
    ],
    features: ['Real-time X data', 'Humor', 'Vision', 'Uncensored mode'],
    pricing: { subscription: '$16/mo' },
    website: 'https://x.ai',
    requiresApiKey: true
  },

  // OPEN SOURCE
  {
    id: 'meta-llama',
    name: 'Meta Llama',
    category: 'llm',
    tier: 'opensource',
    description: 'Meta\'s flagship open source models',
    models: [
      { id: 'llama-4-maverick-400b', name: 'Llama 4 Maverick 400B', contextWindow: 10000000, features: ['10M context', 'Open weights'] },
      { id: 'llama-4-scout-100b', name: 'Llama 4 Scout 100B', contextWindow: 1000000, features: ['1M context', 'Fast'] },
      { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', contextWindow: 128000, features: ['Instruction following'] },
      { id: 'llama-3.2-90b-vision', name: 'Llama 3.2 90B Vision', contextWindow: 128000, features: ['Multimodal'] },
      { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', contextWindow: 128000, features: ['Largest open model'] }
    ],
    features: ['Open weights', 'Self-hostable', 'Commercial use', 'Long context', 'Vision'],
    pricing: { free: true },
    website: 'https://llama.meta.com',
    requiresApiKey: false
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    category: 'llm',
    tier: 'opensource',
    description: 'European AI with open and commercial models',
    models: [
      { id: 'mistral-large-2', name: 'Mistral Large 2', contextWindow: 128000, features: ['128K context', 'Multilingual'] },
      { id: 'mistral-medium', name: 'Mistral Medium', contextWindow: 32000, features: ['Balanced'] },
      { id: 'mistral-small', name: 'Mistral Small', contextWindow: 32000, features: ['Fast', 'Affordable'] },
      { id: 'pixtral-large', name: 'Pixtral Large', contextWindow: 128000, features: ['Vision'] },
      { id: 'codestral', name: 'Codestral', contextWindow: 32000, features: ['Code specialist'] },
      { id: 'ministral-8b', name: 'Ministral 8B', contextWindow: 128000, features: ['Edge deployment'] }
    ],
    features: ['Open weights options', 'Multilingual', 'Function calling', 'Vision', 'Code'],
    pricing: { free: true, payAsYouGo: '$0.10-$2/1M tokens' },
    website: 'https://mistral.ai',
    requiresApiKey: true
  },
  {
    id: 'alibaba-qwen',
    name: 'Alibaba Qwen',
    category: 'llm',
    tier: 'opensource',
    description: 'Alibaba\'s multilingual AI models',
    models: [
      { id: 'qwen-2.5-max', name: 'Qwen 2.5 Max', contextWindow: 128000, features: ['Best performance', 'Multilingual'] },
      { id: 'qwen-2.5-72b', name: 'Qwen 2.5 72B', contextWindow: 128000, features: ['Open weights'] },
      { id: 'qwen-vl-max', name: 'Qwen VL Max', contextWindow: 128000, features: ['Vision'] },
      { id: 'qwq-32b', name: 'QwQ 32B', contextWindow: 32000, features: ['Reasoning'] },
      { id: 'qwen-coder-32b', name: 'Qwen Coder 32B', contextWindow: 128000, features: ['Code specialist'] }
    ],
    features: ['Multilingual', 'Open weights', 'Reasoning', 'Vision', 'Code'],
    pricing: { free: true },
    website: 'https://qwenlm.github.io',
    requiresApiKey: false
  },

  // INFERENCE PLATFORMS
  {
    id: 'groq',
    name: 'Groq',
    category: 'llm',
    tier: 'premium',
    description: 'Ultra-fast LPU inference',
    models: [
      { id: 'llama-3.3-70b-groq', name: 'Llama 3.3 70B', contextWindow: 128000, features: ['750 tok/s', 'Ultra-fast'] },
      { id: 'llama-3.2-90b-groq', name: 'Llama 3.2 90B Vision', contextWindow: 128000, features: ['Vision', 'Fast'] },
      { id: 'mixtral-8x7b-groq', name: 'Mixtral 8x7B', contextWindow: 32000, features: ['400 tok/s'] }
    ],
    features: ['Ultra-fast inference', '400-750 tok/s', 'LPU technology', 'Low latency'],
    pricing: { free: true, payAsYouGo: '$0.05-0.79/1M tokens' },
    website: 'https://groq.com',
    requiresApiKey: true
  },
  {
    id: 'together',
    name: 'Together AI',
    category: 'llm',
    tier: 'standard',
    description: 'Serverless inference platform',
    models: [
      { id: 'together-llama-3.3-70b', name: 'Llama 3.3 70B', contextWindow: 128000, features: ['Fast inference'] },
      { id: 'together-qwen-2.5-72b', name: 'Qwen 2.5 72B', contextWindow: 128000, features: ['Multilingual'] }
    ],
    features: ['Multiple models', 'Fine-tuning', 'Serverless', 'Fast inference'],
    pricing: { payAsYouGo: '$0.18-0.90/1M tokens' },
    website: 'https://together.ai',
    requiresApiKey: true
  },
  {
    id: 'fireworks',
    name: 'Fireworks AI',
    category: 'llm',
    tier: 'standard',
    description: 'Fast inference with function calling',
    models: [
      { id: 'fireworks-llama-3.3-70b', name: 'Llama 3.3 70B', contextWindow: 128000, features: ['Fast', 'Function calling'] }
    ],
    features: ['Fast inference', 'Function calling', 'Multiple models', 'Fine-tuning'],
    pricing: { payAsYouGo: '$0.20-0.90/1M tokens' },
    website: 'https://fireworks.ai',
    requiresApiKey: true
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    category: 'llm',
    tier: 'premium',
    description: 'Search-augmented AI with citations',
    models: [
      { id: 'sonar-pro', name: 'Sonar Pro', contextWindow: 127000, features: ['Search-augmented', 'Citations', 'Real-time'] },
      { id: 'sonar', name: 'Sonar', contextWindow: 127000, features: ['Search-augmented', 'Fast'] }
    ],
    features: ['Search integration', 'Citations', 'Real-time data', 'Internet access'],
    pricing: { free: true, subscription: '$20/mo' },
    website: 'https://perplexity.ai',
    requiresApiKey: true
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    category: 'llm',
    tier: 'standard',
    description: 'Unified API for 300+ models',
    models: [
      { id: 'openrouter-auto', name: 'Auto (Best for Prompt)', features: ['Automatic model selection'] }
    ],
    features: ['300+ models', 'Unified API', 'Model comparison', 'Fallbacks', 'Rate limiting'],
    pricing: { payAsYouGo: 'Variable by model' },
    website: 'https://openrouter.ai',
    requiresApiKey: true
  }
];

// ==================== 3D PROVIDERS ====================

export const threeDProviders: AIProvider[] = [
  {
    id: 'meshy',
    name: 'Meshy',
    category: '3d',
    tier: 'premium',
    description: 'Professional 3D generation with rigging and textures',
    models: [
      { id: 'meshy-4', name: 'Meshy 4', features: ['Text-to-3D', 'Image-to-3D', 'Rigging', 'PBR textures'] },
      { id: 'meshy-texture', name: 'Meshy Texture', features: ['AI texturing', 'PBR materials'] }
    ],
    features: ['Text-to-3D', 'Image-to-3D', 'Auto-rigging', 'PBR textures', 'Multiple formats'],
    pricing: { free: true, subscription: '$16-200/mo' },
    website: 'https://meshy.ai',
    requiresApiKey: true
  },
  {
    id: 'tripo',
    name: 'Tripo AI',
    category: '3d',
    tier: 'premium',
    description: 'Fast high-quality 3D generation',
    models: [
      { id: 'tripo-2.0', name: 'Tripo 2.0', features: ['Text-to-3D', 'Image-to-3D', 'Fast generation'] }
    ],
    features: ['Fast generation', 'High quality', 'Multiple formats', 'Stylization'],
    pricing: { free: true, subscription: '$12-200/mo' },
    website: 'https://tripo3d.ai',
    requiresApiKey: true
  },
  {
    id: 'luma-genie',
    name: 'Luma Genie',
    category: '3d',
    tier: 'premium',
    description: '3D generation with NeRF support',
    models: [
      { id: 'genie-1.0', name: 'Genie 1.0', features: ['Text-to-3D', 'NeRF', 'Gaussian splatting'] }
    ],
    features: ['NeRF support', 'Gaussian splatting', 'High quality', 'Multiple formats'],
    pricing: { free: true, subscription: '$10-120/mo' },
    website: 'https://lumalabs.ai/genie',
    requiresApiKey: true
  },
  {
    id: 'rodin',
    name: 'Rodin',
    category: '3d',
    tier: 'premium',
    description: 'Multi-view 3D generation',
    models: [
      { id: 'rodin-gen-1', name: 'Rodin Gen-1', features: ['Text-to-3D', 'Multi-view', 'High quality'] }
    ],
    features: ['Multi-view generation', 'High quality', 'Detailed geometry'],
    pricing: { free: true },
    website: 'https://hyperhuman.deemos.com',
    requiresApiKey: false
  },
  {
    id: 'stable-3d',
    name: 'Stable 3D',
    category: '3d',
    tier: 'standard',
    description: 'Stability AI 3D generation',
    models: [
      { id: 'stable-fast-3d', name: 'Stable Fast 3D', features: ['Image-to-3D', 'Fast'] },
      { id: 'sv3d', name: 'SV3D', features: ['3D video', 'Novel views'] }
    ],
    features: ['Fast generation', 'Novel view synthesis', 'Multiple formats'],
    pricing: { payAsYouGo: '$0.20/generation' },
    website: 'https://stability.ai',
    requiresApiKey: true
  },
  {
    id: 'csm',
    name: 'CSM.ai',
    category: '3d',
    tier: 'premium',
    description: 'Video-to-3D and world building',
    models: [
      { id: 'csm-3d', name: 'CSM 3D', features: ['Video-to-3D', 'Image-to-3D', 'World building'] }
    ],
    features: ['Video-to-3D', 'World building', 'Game-ready assets'],
    pricing: { free: true },
    website: 'https://csm.ai',
    requiresApiKey: false
  },
  {
    id: 'openai-3d',
    name: 'OpenAI 3D',
    category: '3d',
    tier: 'opensource',
    description: 'OpenAI 3D models',
    models: [
      { id: 'point-e', name: 'Point-E', features: ['Text-to-3D', 'Point clouds', 'Open source'] },
      { id: 'shap-e', name: 'Shap-E', features: ['Text-to-3D', 'Mesh generation', 'Open source'] }
    ],
    features: ['Open source', 'Point clouds', 'Mesh generation', 'Self-hostable'],
    pricing: { free: true },
    website: 'https://github.com/openai/point-e',
    requiresApiKey: false
  },
  {
    id: 'kaedim',
    name: 'Kaedim',
    category: '3d',
    tier: 'premium',
    description: 'Game-ready 3D assets',
    models: [
      { id: 'kaedim-v2', name: 'Kaedim V2', features: ['Image-to-3D', 'Game-ready', 'Manual refinement'] }
    ],
    features: ['Game-ready assets', 'Manual refinement', 'High quality', 'Multiple formats'],
    pricing: { subscription: '$25-800/mo' },
    website: 'https://kaedim3d.com',
    requiresApiKey: true
  },
  {
    id: 'spline',
    name: 'Spline AI',
    category: '3d',
    tier: 'standard',
    description: 'Web-based 3D design with AI',
    models: [
      { id: 'spline-ai', name: 'Spline AI', features: ['Text-to-3D', 'Web-based', 'Interactive'] }
    ],
    features: ['Web-based', 'Interactive 3D', 'Collaboration', 'Export options'],
    pricing: { free: true, subscription: '$8-40/mo' },
    website: 'https://spline.design',
    requiresApiKey: false
  }
];

// ==================== AI TOOLS ====================

export const toolsProviders: AIProvider[] = [
  {
    id: 'real-esrgan',
    name: 'Real-ESRGAN',
    category: 'tools',
    tier: 'opensource',
    description: 'Image upscaling and enhancement',
    models: [
      { id: 'realesrgan-x4', name: 'Real-ESRGAN x4', features: ['4x upscale', 'General'] },
      { id: 'realesrgan-x8', name: 'Real-ESRGAN x8', features: ['8x upscale', 'Ultra quality'] },
      { id: 'realesrgan-anime', name: 'Real-ESRGAN Anime', features: ['Anime specialist', '4x'] }
    ],
    features: ['Image upscaling', '4x-8x', 'Anime support', 'Face enhancement'],
    pricing: { free: true },
    website: 'https://github.com/xinntao/Real-ESRGAN',
    requiresApiKey: false
  },
  {
    id: 'topaz',
    name: 'Topaz Labs',
    category: 'tools',
    tier: 'premium',
    description: 'Professional image and video enhancement',
    models: [
      { id: 'topaz-photo-ai', name: 'Photo AI', features: ['Denoise', 'Sharpen', 'Upscale'] },
      { id: 'topaz-video-ai', name: 'Video AI', features: ['Video enhancement', 'Upscale', 'Slow-mo'] },
      { id: 'topaz-gigapixel', name: 'Gigapixel AI', features: ['6x upscale', 'Best quality'] }
    ],
    features: ['Professional quality', 'Batch processing', 'Video support', 'Face recovery'],
    pricing: { payAsYouGo: '$199-299 one-time' },
    website: 'https://topazlabs.com',
    requiresApiKey: false
  },
  {
    id: 'remove-bg',
    name: 'Remove.bg',
    category: 'tools',
    tier: 'standard',
    description: 'AI background removal',
    models: [
      { id: 'removebg-v1', name: 'Remove.bg V1', features: ['Background removal', 'Auto-detect'] }
    ],
    features: ['Background removal', 'Automatic detection', 'Batch processing', 'API'],
    pricing: { free: true, subscription: '$9-249/mo' },
    website: 'https://remove.bg',
    requiresApiKey: true
  },
  {
    id: 'sam',
    name: 'SAM (Segment Anything)',
    category: 'tools',
    tier: 'opensource',
    description: 'Meta\'s universal segmentation model',
    models: [
      { id: 'sam-2', name: 'SAM 2', features: ['Image segmentation', 'Video segmentation', 'Open source'] }
    ],
    features: ['Segment anything', 'Video support', 'Zero-shot', 'Self-hostable'],
    pricing: { free: true },
    website: 'https://github.com/facebookresearch/segment-anything',
    requiresApiKey: false
  },
  {
    id: 'codeformer',
    name: 'CodeFormer',
    category: 'tools',
    tier: 'opensource',
    description: 'Face restoration',
    models: [
      { id: 'codeformer-v1', name: 'CodeFormer V1', features: ['Face restoration', 'Face enhancement'] }
    ],
    features: ['Face restoration', 'Old photo restoration', 'Blind face restoration'],
    pricing: { free: true },
    website: 'https://github.com/sczhou/CodeFormer',
    requiresApiKey: false
  },
  {
    id: 'gfpgan',
    name: 'GFPGAN',
    category: 'tools',
    tier: 'opensource',
    description: 'Face restoration and enhancement',
    models: [
      { id: 'gfpgan-v1.4', name: 'GFPGAN V1.4', features: ['Face restoration', 'Colorization'] }
    ],
    features: ['Face restoration', 'Colorization', 'Enhancement', 'Self-hostable'],
    pricing: { free: true },
    website: 'https://github.com/TencentARC/GFPGAN',
    requiresApiKey: false
  },
  {
    id: 'rife',
    name: 'RIFE',
    category: 'tools',
    tier: 'opensource',
    description: 'Frame interpolation for smooth video',
    models: [
      { id: 'rife-4.6', name: 'RIFE 4.6', features: ['Frame interpolation', '60fps', 'Smooth motion'] }
    ],
    features: ['Frame interpolation', '60fps conversion', 'Slow motion', 'Self-hostable'],
    pricing: { free: true },
    website: 'https://github.com/megvii-research/ECCV2022-RIFE',
    requiresApiKey: false
  },
  {
    id: 'dain',
    name: 'DAIN',
    category: 'tools',
    tier: 'opensource',
    description: 'Depth-aware video frame interpolation',
    models: [
      { id: 'dain-v1', name: 'DAIN V1', features: ['Depth-aware interpolation', 'Smooth motion'] }
    ],
    features: ['Depth-aware', 'Frame interpolation', 'Smooth slow-mo'],
    pricing: { free: true },
    website: 'https://github.com/baowenbo/DAIN',
    requiresApiKey: false
  },
  {
    id: 'flowframes',
    name: 'Flowframes',
    category: 'tools',
    tier: 'opensource',
    description: 'Multi-model frame interpolation app',
    models: [
      { id: 'flowframes-v1', name: 'Flowframes V1', features: ['Multiple models', 'RIFE', 'DAIN', 'GUI'] }
    ],
    features: ['Multiple models', 'GUI application', 'Batch processing', 'Quality presets'],
    pricing: { free: true },
    website: 'https://nmkd.itch.io/flowframes',
    requiresApiKey: false
  },
  {
    id: 'video-retalking',
    name: 'Video ReTalking',
    category: 'tools',
    tier: 'opensource',
    description: 'Audio-based lip sync for videos',
    models: [
      { id: 'video-retalking-v1', name: 'Video ReTalking V1', features: ['Lip sync', 'Face restoration'] }
    ],
    features: ['Audio-based lip sync', 'Face restoration', 'Identity preservation'],
    pricing: { free: true },
    website: 'https://github.com/OpenTalker/video-retalking',
    requiresApiKey: false
  }
];

export { llmProviders, threeDProviders, toolsProviders };
