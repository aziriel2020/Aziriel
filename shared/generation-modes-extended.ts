/**
 * NEURAFIELD QUANTUM v5.0 - Generation Modes Extended
 * Audio, LLM, and 3D modes
 */

import { GenerationMode } from './generation-modes';

// ==================== AUDIO MODES (40+) ====================

export const audioModes: GenerationMode[] = [
  // Music
  { id: 'text-to-music', name: 'Text to Music', category: 'audio', description: 'Generate music from description', inputTypes: ['text'], outputType: 'audio', complexity: 'simple', supportedProviders: ['suno', 'udio', 'stable-audio'] },
  { id: 'music-extend', name: 'Music Extend', category: 'audio', description: 'Extend music duration', inputTypes: ['audio'], outputType: 'audio', complexity: 'simple', supportedProviders: ['suno', 'udio'] },
  { id: 'music-remix', name: 'Music Remix', category: 'audio', description: 'Remix existing music', inputTypes: ['audio', 'text'], outputType: 'audio', complexity: 'moderate', supportedProviders: ['udio'] },
  { id: 'stem-generation', name: 'Stem Generation', category: 'audio', description: 'Generate individual instrument stems', inputTypes: ['text'], outputType: 'audio', complexity: 'moderate', supportedProviders: ['suno', 'stable-audio'] },
  { id: 'lyrics-generation', name: 'Lyrics Generation', category: 'audio', description: 'Generate song with lyrics', inputTypes: ['text'], outputType: 'audio', complexity: 'simple', supportedProviders: ['suno'] },
  { id: 'cover-song', name: 'Cover Song', category: 'audio', description: 'Create cover version', inputTypes: ['audio', 'style'], outputType: 'audio', complexity: 'moderate', supportedProviders: ['suno'] },
  { id: 'melody-to-song', name: 'Melody to Song', category: 'audio', description: 'Generate full song from melody', inputTypes: ['audio'], outputType: 'audio', complexity: 'moderate', supportedProviders: ['meta-musicgen'] },
  { id: 'genre-transfer', name: 'Genre Transfer', category: 'audio', description: 'Change music genre', inputTypes: ['audio', 'genre'], outputType: 'audio', complexity: 'moderate', supportedProviders: ['udio'] },
  { id: 'instrumental', name: 'Instrumental', category: 'audio', description: 'Generate instrumental music', inputTypes: ['text'], outputType: 'audio', complexity: 'simple', supportedProviders: ['suno', 'stable-audio'] },
  { id: 'soundtrack', name: 'Soundtrack', category: 'audio', description: 'Generate film/game soundtrack', inputTypes: ['text', 'mood'], outputType: 'audio', complexity: 'moderate', supportedProviders: ['aiva', 'mubert'] },
  { id: 'loop-music', name: 'Music Loop', category: 'audio', description: 'Generate seamless music loop', inputTypes: ['text'], outputType: 'audio', complexity: 'moderate', supportedProviders: ['mubert'] },
  { id: 'adaptive-music', name: 'Adaptive Music', category: 'audio', description: 'Generate adaptive/interactive music', inputTypes: ['text'], outputType: 'audio', complexity: 'advanced', supportedProviders: ['mubert'] },

  // Voice/TTS
  { id: 'text-to-speech', name: 'Text to Speech', category: 'audio', description: 'Convert text to speech', inputTypes: ['text'], outputType: 'audio', complexity: 'simple', supportedProviders: ['elevenlabs', 'openai-tts', 'playht'] },
  { id: 'voice-clone', name: 'Voice Cloning', category: 'audio', description: 'Clone voice from sample', inputTypes: ['audio', 'text'], outputType: 'audio', complexity: 'advanced', supportedProviders: ['elevenlabs', 'playht', 'resemble'] },
  { id: 'speech-to-text', name: 'Speech to Text', category: 'audio', description: 'Transcribe speech to text', inputTypes: ['audio'], outputType: 'text', complexity: 'simple', supportedProviders: ['whisper'] },
  { id: 'voice-conversion', name: 'Voice Conversion', category: 'audio', description: 'Convert voice to different voice', inputTypes: ['audio', 'target-voice'], outputType: 'audio', complexity: 'advanced', supportedProviders: ['rvc', 'resemble'] },
  { id: 'dubbing', name: 'AI Dubbing', category: 'audio', description: 'Translate and dub audio', inputTypes: ['audio', 'language'], outputType: 'audio', complexity: 'advanced', supportedProviders: ['elevenlabs', 'heygen'] },
  { id: 'emotion-tts', name: 'Emotional TTS', category: 'audio', description: 'TTS with emotion control', inputTypes: ['text', 'emotion'], outputType: 'audio', complexity: 'moderate', supportedProviders: ['elevenlabs', 'playht'] },
  { id: 'multi-speaker', name: 'Multi-Speaker TTS', category: 'audio', description: 'Multiple voices in conversation', inputTypes: ['script'], outputType: 'audio', complexity: 'moderate', supportedProviders: ['elevenlabs', 'playht'] },
  { id: 'accent-conversion', name: 'Accent Conversion', category: 'audio', description: 'Change speaker accent', inputTypes: ['audio', 'accent'], outputType: 'audio', complexity: 'advanced', supportedProviders: ['resemble'] },
  { id: 'voice-enhancement', name: 'Voice Enhancement', category: 'audio', description: 'Enhance voice quality', inputTypes: ['audio'], outputType: 'audio', complexity: 'simple', supportedProviders: ['resemble'] },

  // SFX
  { id: 'text-to-sfx', name: 'Text to Sound Effects', category: 'audio', description: 'Generate sound effects from text', inputTypes: ['text'], outputType: 'audio', complexity: 'simple', supportedProviders: ['stable-audio', 'elevenlabs'] },
  { id: 'foley', name: 'Foley Generation', category: 'audio', description: 'Generate foley sound effects', inputTypes: ['text', 'video'], outputType: 'audio', complexity: 'moderate', supportedProviders: ['stable-audio'] },
  { id: 'ambience', name: 'Ambience', category: 'audio', description: 'Generate ambient soundscapes', inputTypes: ['text'], outputType: 'audio', complexity: 'simple', supportedProviders: ['stable-audio'] },
  { id: 'video-to-sfx', name: 'Video to SFX', category: 'audio', description: 'Generate SFX matching video', inputTypes: ['video'], outputType: 'audio', complexity: 'advanced', supportedProviders: ['stable-audio'] },

  // Processing
  { id: 'stem-separation', name: 'Stem Separation', category: 'audio', description: 'Separate audio into stems', inputTypes: ['audio'], outputType: 'audio', complexity: 'simple', supportedProviders: ['demucs'] },
  { id: 'noise-reduction', name: 'Noise Reduction', category: 'audio', description: 'Remove background noise', inputTypes: ['audio'], outputType: 'audio', complexity: 'simple', supportedProviders: ['resemble'] },
  { id: 'audio-enhance', name: 'Audio Enhancement', category: 'audio', description: 'Enhance audio quality', inputTypes: ['audio'], outputType: 'audio', complexity: 'simple', supportedProviders: ['resemble'] },
  { id: 'mastering', name: 'Audio Mastering', category: 'audio', description: 'Master audio track', inputTypes: ['audio'], outputType: 'audio', complexity: 'moderate', supportedProviders: ['stable-audio'] },
  { id: 'pitch-shift', name: 'Pitch Shifting', category: 'audio', description: 'Change audio pitch', inputTypes: ['audio', 'pitch'], outputType: 'audio', complexity: 'simple', supportedProviders: ['rvc'] },
  { id: 'tempo-change', name: 'Tempo Change', category: 'audio', description: 'Change audio tempo', inputTypes: ['audio', 'tempo'], outputType: 'audio', complexity: 'simple', supportedProviders: ['stable-audio'] },
  { id: 'reverb', name: 'Reverb Generation', category: 'audio', description: 'Add realistic reverb', inputTypes: ['audio', 'space'], outputType: 'audio', complexity: 'moderate', supportedProviders: ['stable-audio'] },

  // Specialized
  { id: 'podcast', name: 'Podcast Generation', category: 'audio', description: 'Generate podcast episode', inputTypes: ['script', 'voices'], outputType: 'audio', complexity: 'advanced', supportedProviders: ['playht', 'elevenlabs'] },
  { id: 'audiobook', name: 'Audiobook', category: 'audio', description: 'Convert text to audiobook', inputTypes: ['text'], outputType: 'audio', complexity: 'moderate', supportedProviders: ['elevenlabs', 'playht'] },
  { id: 'jingle', name: 'Jingle', category: 'audio', description: 'Generate advertising jingle', inputTypes: ['text', 'brand'], outputType: 'audio', complexity: 'moderate', supportedProviders: ['suno', 'udio'] },
  { id: 'background-music', name: 'Background Music', category: 'audio', description: 'Generate background music', inputTypes: ['mood', 'duration'], outputType: 'audio', complexity: 'simple', supportedProviders: ['mubert', 'beatoven'] },
  { id: 'meditation', name: 'Meditation Music', category: 'audio', description: 'Generate meditation/relaxation music', inputTypes: ['duration'], outputType: 'audio', complexity: 'simple', supportedProviders: ['mubert'] },
  { id: 'workout-music', name: 'Workout Music', category: 'audio', description: 'Generate energetic workout music', inputTypes: ['duration', 'intensity'], outputType: 'audio', complexity: 'simple', supportedProviders: ['mubert'] },
  { id: 'game-music', name: 'Game Music', category: 'audio', description: 'Generate video game music', inputTypes: ['text', 'mood'], outputType: 'audio', complexity: 'moderate', supportedProviders: ['aiva'] }
];

// ==================== LLM MODES (30+) ====================

export const llmModes: GenerationMode[] = [
  // Core
  { id: 'chat', name: 'Chat', category: 'llm', description: 'Conversational AI chat', inputTypes: ['text'], outputType: 'text', complexity: 'simple', supportedProviders: ['openai', 'anthropic', 'google-gemini'] },
  { id: 'completion', name: 'Text Completion', category: 'llm', description: 'Complete text from prompt', inputTypes: ['text'], outputType: 'text', complexity: 'simple', supportedProviders: ['openai', 'anthropic'] },
  { id: 'reasoning', name: 'Reasoning', category: 'llm', description: 'Advanced reasoning tasks', inputTypes: ['text'], outputType: 'text', complexity: 'advanced', supportedProviders: ['openai', 'deepseek', 'google-gemini'] },

  // Writing
  { id: 'writing', name: 'Creative Writing', category: 'llm', description: 'Generate creative content', inputTypes: ['text'], outputType: 'text', complexity: 'simple', supportedProviders: ['openai', 'anthropic', 'google-gemini'] },
  { id: 'copywriting', name: 'Copywriting', category: 'llm', description: 'Marketing copy generation', inputTypes: ['text'], outputType: 'text', complexity: 'moderate', supportedProviders: ['openai', 'anthropic'] },
  { id: 'creative-writing', name: 'Story Writing', category: 'llm', description: 'Write stories and narratives', inputTypes: ['text'], outputType: 'text', complexity: 'moderate', supportedProviders: ['openai', 'anthropic'] },
  { id: 'translation', name: 'Translation', category: 'llm', description: 'Translate between languages', inputTypes: ['text', 'language'], outputType: 'text', complexity: 'simple', supportedProviders: ['openai', 'anthropic', 'google-gemini'] },
  { id: 'summarization', name: 'Summarization', category: 'llm', description: 'Summarize long content', inputTypes: ['text'], outputType: 'text', complexity: 'simple', supportedProviders: ['openai', 'anthropic', 'google-gemini'] },
  { id: 'rewriting', name: 'Rewriting', category: 'llm', description: 'Rewrite and improve text', inputTypes: ['text'], outputType: 'text', complexity: 'simple', supportedProviders: ['openai', 'anthropic'] },
  { id: 'grammar-check', name: 'Grammar Check', category: 'llm', description: 'Check and fix grammar', inputTypes: ['text'], outputType: 'text', complexity: 'simple', supportedProviders: ['openai', 'anthropic'] },
  { id: 'paraphrasing', name: 'Paraphrasing', category: 'llm', description: 'Rephrase content', inputTypes: ['text'], outputType: 'text', complexity: 'simple', supportedProviders: ['openai', 'anthropic'] },

  // Coding
  { id: 'coding', name: 'Code Generation', category: 'llm', description: 'Generate code from description', inputTypes: ['text'], outputType: 'code', complexity: 'moderate', supportedProviders: ['openai', 'anthropic', 'deepseek'] },
  { id: 'code-review', name: 'Code Review', category: 'llm', description: 'Review and improve code', inputTypes: ['code'], outputType: 'text', complexity: 'moderate', supportedProviders: ['openai', 'anthropic', 'deepseek'] },
  { id: 'debugging', name: 'Debugging', category: 'llm', description: 'Find and fix bugs', inputTypes: ['code'], outputType: 'code', complexity: 'advanced', supportedProviders: ['openai', 'anthropic', 'deepseek'] },
  { id: 'code-explanation', name: 'Code Explanation', category: 'llm', description: 'Explain code functionality', inputTypes: ['code'], outputType: 'text', complexity: 'simple', supportedProviders: ['openai', 'anthropic'] },
  { id: 'code-optimization', name: 'Code Optimization', category: 'llm', description: 'Optimize code performance', inputTypes: ['code'], outputType: 'code', complexity: 'advanced', supportedProviders: ['deepseek', 'anthropic'] },
  { id: 'code-refactoring', name: 'Code Refactoring', category: 'llm', description: 'Refactor code structure', inputTypes: ['code'], outputType: 'code', complexity: 'advanced', supportedProviders: ['anthropic', 'deepseek'] },

  // Analysis
  { id: 'analysis', name: 'Text Analysis', category: 'llm', description: 'Analyze and extract insights', inputTypes: ['text'], outputType: 'text', complexity: 'moderate', supportedProviders: ['openai', 'anthropic', 'google-gemini'] },
  { id: 'research', name: 'Research', category: 'llm', description: 'Research and compile information', inputTypes: ['text'], outputType: 'text', complexity: 'advanced', supportedProviders: ['perplexity', 'google-gemini'] },
  { id: 'extraction', name: 'Data Extraction', category: 'llm', description: 'Extract structured data', inputTypes: ['text'], outputType: 'json', complexity: 'moderate', supportedProviders: ['openai', 'anthropic'] },
  { id: 'sentiment-analysis', name: 'Sentiment Analysis', category: 'llm', description: 'Analyze text sentiment', inputTypes: ['text'], outputType: 'text', complexity: 'simple', supportedProviders: ['openai', 'anthropic'] },
  { id: 'classification', name: 'Classification', category: 'llm', description: 'Classify and categorize text', inputTypes: ['text'], outputType: 'text', complexity: 'simple', supportedProviders: ['openai', 'anthropic'] },

  // Specialized
  { id: 'roleplay', name: 'Roleplay', category: 'llm', description: 'Character roleplay conversation', inputTypes: ['text', 'character'], outputType: 'text', complexity: 'moderate', supportedProviders: ['anthropic', 'openai'] },
  { id: 'tutoring', name: 'Tutoring', category: 'llm', description: 'Educational tutoring', inputTypes: ['text'], outputType: 'text', complexity: 'moderate', supportedProviders: ['openai', 'anthropic', 'google-gemini'] },
  { id: 'brainstorming', name: 'Brainstorming', category: 'llm', description: 'Generate creative ideas', inputTypes: ['text'], outputType: 'text', complexity: 'simple', supportedProviders: ['openai', 'anthropic'] },
  { id: 'function-calling', name: 'Function Calling', category: 'llm', description: 'Execute functions via AI', inputTypes: ['text', 'functions'], outputType: 'json', complexity: 'expert', supportedProviders: ['openai', 'anthropic', 'google-gemini'] },
  { id: 'vision', name: 'Vision Analysis', category: 'llm', description: 'Analyze images with AI', inputTypes: ['image', 'text'], outputType: 'text', complexity: 'moderate', supportedProviders: ['openai', 'anthropic', 'google-gemini'] },
  { id: 'audio-analysis', name: 'Audio Analysis', category: 'llm', description: 'Analyze audio content', inputTypes: ['audio'], outputType: 'text', complexity: 'moderate', supportedProviders: ['openai'] },
  { id: 'web-search', name: 'Web Search', category: 'llm', description: 'Search-augmented responses', inputTypes: ['text'], outputType: 'text', complexity: 'moderate', supportedProviders: ['perplexity'] },
  { id: 'long-context', name: 'Long Context', category: 'llm', description: 'Process very long documents', inputTypes: ['text'], outputType: 'text', complexity: 'advanced', supportedProviders: ['google-gemini', 'anthropic'] }
];

// ==================== 3D MODES (8) ====================

export const threeDModes: GenerationMode[] = [
  { id: 'text-to-3d', name: 'Text to 3D', category: '3d', description: 'Generate 3D model from text', inputTypes: ['text'], outputType: '3d-model', complexity: 'simple', supportedProviders: ['meshy', 'tripo', 'luma-genie'] },
  { id: 'image-to-3d', name: 'Image to 3D', category: '3d', description: 'Generate 3D model from image', inputTypes: ['image'], outputType: '3d-model', complexity: 'simple', supportedProviders: ['meshy', 'tripo', 'stable-3d'] },
  { id: 'video-to-3d', name: 'Video to 3D', category: '3d', description: 'Generate 3D model from video', inputTypes: ['video'], outputType: '3d-model', complexity: 'advanced', supportedProviders: ['csm', 'luma-genie'] },
  { id: 'texture-generation', name: 'Texture Generation', category: '3d', description: 'Generate PBR textures for 3D models', inputTypes: ['3d-model', 'text'], outputType: '3d-model', complexity: 'moderate', supportedProviders: ['meshy'] },
  { id: 'rigging', name: 'Auto-Rigging', category: '3d', description: 'Automatically rig 3D models', inputTypes: ['3d-model'], outputType: '3d-model', complexity: 'advanced', supportedProviders: ['meshy'] },
  { id: 'animation', name: '3D Animation', category: '3d', description: 'Animate 3D models', inputTypes: ['3d-model', 'text'], outputType: '3d-animation', complexity: 'advanced', supportedProviders: ['meshy'] },
  { id: 'nerf', name: 'NeRF Generation', category: '3d', description: 'Generate Neural Radiance Fields', inputTypes: ['images'], outputType: 'nerf', complexity: 'expert', supportedProviders: ['luma-genie'] },
  { id: 'gaussian-splatting', name: 'Gaussian Splatting', category: '3d', description: 'Generate 3D Gaussian splats', inputTypes: ['images'], outputType: 'gaussian-splat', complexity: 'expert', supportedProviders: ['luma-genie'] }
];

export { audioModes, llmModes, threeDModes };
