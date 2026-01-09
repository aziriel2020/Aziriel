'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Clock, DollarSign, Star, Check, X } from 'lucide-react';
import Link from 'next/link';

const MODELS = [
  {
    id: 'sora2',
    name: 'Sora 2',
    provider: 'OpenAI',
    category: 'Big Three',
    color: 'from-green-400 to-blue-500',
    cost: '$0.08/s',
    duration: 'Up to 25s',
    resolution: '1080p',
    features: ['Character Cameos', 'Storyboards', 'Native Audio', 'Remix & Stitch', 'Physics Simulation'],
    pros: ['Best social simulation', 'Character persistence', 'Frame-by-frame control'],
    cons: ['Higher cost', 'Limited duration'],
    useCase: 'Social media content, viral videos, character-driven stories',
    speed: 'Medium (8s/s)',
    quality: 5,
  },
  {
    id: 'veo31',
    name: 'Veo 3.1',
    provider: 'Google DeepMind',
    category: 'Big Three',
    color: 'from-blue-400 to-purple-500',
    cost: '$0.12/s',
    duration: '>60s',
    resolution: '4K',
    features: ['Ingredient Control', 'Extensions', 'Masked Editing', 'Gemini Prompts', 'Fast Mode'],
    pros: ['Enterprise reliability', '4K quality', 'Longest duration', 'Ecosystem integration'],
    cons: ['Most expensive', 'Complex interface'],
    useCase: 'Enterprise content, long-form videos, professional production',
    speed: 'Fast (25s/s)',
    quality: 5,
  },
  {
    id: 'gen45',
    name: 'Gen-4.5',
    provider: 'Runway',
    category: 'Big Three',
    color: 'from-purple-400 to-pink-500',
    cost: '$0.05/s',
    duration: 'Up to 10s',
    resolution: '1080p',
    features: ['Physics Engine', 'Camera Controls', 'Multi-Motion Brush', 'Character Reference'],
    pros: ['Best physics (1247 Elo)', 'Filmmaker precision', 'Advanced camera control'],
    cons: ['Shorter clips', 'Steeper learning curve'],
    useCase: 'Professional VFX, cinematic shots, physics-heavy scenes',
    speed: 'Fast (15s/s)',
    quality: 5,
  },
  {
    id: 'hailuo',
    name: 'Hailuo 2.3',
    provider: 'MiniMax',
    category: 'Chinese Powerhouses',
    color: 'from-cyan-400 to-blue-500',
    cost: '$0.045/s (CHEAPEST)',
    duration: '6s',
    resolution: '1080p',
    features: ['Media Agent', 'Anime Style', '2-3x Faster', 'Smart Tool Selection'],
    pros: ['Fastest speed', 'Lowest cost', 'Great for anime', 'Efficient'],
    cons: ['Shorter clips', 'Less photorealistic'],
    useCase: 'Anime content, stylized videos, high-volume generation',
    speed: 'FASTEST (10s/s)',
    quality: 4,
  },
  {
    id: 'hunyuan',
    name: 'HunyuanVideo 1.5',
    provider: 'Tencent',
    category: 'Chinese Powerhouses',
    color: 'from-red-400 to-orange-500',
    cost: 'FREE',
    duration: '10s',
    resolution: '1080p (Super-Res)',
    features: ['Open Source', '4-Step Generation', 'RTX 4090 Compatible', '8.3B Params'],
    pros: ['FREE!', 'Open source', 'Runs locally', 'Super-resolution'],
    cons: ['Requires GPU', 'Shorter clips'],
    useCase: 'Unlimited generation, local deployment, research',
    speed: 'Fast (20s/s)',
    quality: 4,
  },
  {
    id: 'hyworld',
    name: 'HY-World 1.5',
    provider: 'Tencent',
    category: 'Chinese Powerhouses',
    color: 'from-orange-400 to-yellow-500',
    cost: 'FREE',
    duration: 'Real-time',
    resolution: 'HD',
    features: ['Interactive', 'WASD Control', 'Real-time 24 FPS', 'World Model'],
    pros: ['FREE!', 'Revolutionary', 'Interactive exploration', 'Real-time streaming'],
    cons: ['Limited resolution', 'Experimental'],
    useCase: 'Interactive experiences, game-like exploration, demos',
    speed: 'Real-time',
    quality: 3,
  },
  {
    id: 'wan',
    name: 'Wan 2.2',
    provider: 'Alibaba',
    category: 'Chinese Powerhouses',
    color: 'from-yellow-400 to-green-500',
    cost: '$0.07/s',
    duration: '5s',
    resolution: '720p',
    features: ['MoE Architecture', 'Speech-to-Video', 'Multi-modal', '14B Params'],
    pros: ['Speech-to-video', 'Efficient MoE', 'Audio-reactive', 'Good value'],
    cons: ['Lower resolution', 'Shorter clips'],
    useCase: 'Audio-driven content, speech visualization, multi-modal generation',
    speed: 'Fast (25s/s)',
    quality: 4,
  },
  {
    id: 'kling26',
    name: 'Kling 2.6',
    provider: 'Kuaishou',
    category: 'Chinese Powerhouses',
    color: 'from-pink-400 to-red-500',
    cost: '$0.08/s',
    duration: '10s',
    resolution: '1080p',
    features: ['Motion Control', 'Motion Transfer', 'Native Audio', 'Camera Control'],
    pros: ['Superior motion quality', 'Good all-rounder', 'Native audio'],
    cons: ['Mid-range pricing'],
    useCase: 'Motion-heavy content, dynamic scenes, general-purpose',
    speed: 'Medium (50s/s)',
    quality: 4,
  },
  {
    id: 'klingo1',
    name: 'Kling O1',
    provider: 'Kuaishou',
    category: 'Chinese Powerhouses',
    color: 'from-red-500 to-pink-500',
    cost: '$0.12/s',
    duration: '10s',
    resolution: '1080p',
    features: ['Chain-of-Thought', 'Start+End Frames', 'Logic Reasoning', 'No Teleportation'],
    pros: ['Reasoning capability', 'Logical sequences', 'Start+end control'],
    cons: ['Slower', 'Higher cost'],
    useCase: 'Complex sequences, logical narratives, precise transitions',
    speed: 'Slow (80s/s)',
    quality: 5,
  },
  {
    id: 'luma-ray3',
    name: 'Luma Ray 3',
    provider: 'Luma',
    category: 'Specialized',
    color: 'from-indigo-400 to-purple-500',
    cost: '$0.30',
    duration: '5s',
    resolution: '1080p',
    features: ['3D Native', 'Modify with Instructions', 'Reframe', 'Camera Concepts'],
    pros: ['3D consistency', 'Natural language editing', 'NeRF-based'],
    cons: ['Per-generation cost', 'Shorter clips'],
    useCase: '3D content, editing existing videos, camera manipulation',
    speed: 'Medium (90s)',
    quality: 4,
  },
  {
    id: 'pika22',
    name: 'Pika 2.2',
    provider: 'Pika Art',
    category: 'Specialized',
    color: 'from-fuchsia-400 to-pink-500',
    cost: '$0.08/s',
    duration: '3s',
    resolution: '720p',
    features: ['Pikaffects', 'Pikaframes', 'Lip Sync', 'Character Performance'],
    pros: ['Creative effects', 'Surreal transformations', 'Social-first', 'Fun!'],
    cons: ['Short clips', 'Lower resolution'],
    useCase: 'Memes, creative effects, social media, surreal content',
    speed: 'Fast (30s/s)',
    quality: 3,
  },
  {
    id: 'mochi',
    name: 'Mochi 1',
    provider: 'Genmo',
    category: 'Specialized',
    color: 'from-violet-400 to-purple-500',
    cost: 'FREE',
    duration: '6s',
    resolution: '1080p',
    features: ['Open Source', 'AsymmDiT', 'Apache 2.0', 'Research-Friendly'],
    pros: ['FREE!', 'Open source', 'Commercial use', 'Great prompt adherence'],
    cons: ['Requires setup', 'Limited features'],
    useCase: 'Research, unlimited generation, commercial projects',
    speed: 'Medium (180s)',
    quality: 4,
  },
];

export default function ModelsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Back
          </Link>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-3">
            All 15+ AI Models
          </h1>
          <p className="text-gray-300 text-lg">
            The most comprehensive AI video model comparison. Choose the perfect model for your needs.
          </p>
        </div>
      </div>

      {/* Models Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid gap-6">
          {MODELS.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Model Info */}
                <div className="lg:w-1/3">
                  <div className={`inline-block px-4 py-2 rounded-xl bg-gradient-to-r ${model.color} mb-3`}>
                    <div className="text-xl font-bold text-white">{model.name}</div>
                    <div className="text-sm text-white/90">{model.provider}</div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">{model.cost}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span>{model.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Zap className="w-4 h-4" />
                      <span>{model.speed}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-300">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < model.quality ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Middle: Features & Use Case */}
                <div className="lg:w-1/3">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Features
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {model.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs px-3 py-1 bg-white/10 rounded-full text-gray-300 border border-white/20"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 mt-3">
                    <span className="text-purple-300 font-semibold">Best for:</span> {model.useCase}
                  </p>
                </div>

                {/* Right: Pros & Cons */}
                <div className="lg:w-1/3">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-green-400 font-semibold mb-2 text-sm">Pros</h4>
                      <ul className="space-y-1">
                        {model.pros.map((pro) => (
                          <li key={pro} className="flex items-start gap-2 text-sm text-gray-300">
                            <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-red-400 font-semibold mb-2 text-sm">Cons</h4>
                      <ul className="space-y-1">
                        {model.cons.map((con) => (
                          <li key={con} className="flex items-start gap-2 text-sm text-gray-300">
                            <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Try Button */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <Link
                  href={`/studio?model=${model.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:scale-105 transition-transform"
                >
                  <Sparkles className="w-4 h-4" />
                  Try {model.name}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
