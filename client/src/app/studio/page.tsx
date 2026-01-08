'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play, Settings, Image, Music, Wand2, Zap } from 'lucide-react';

const MODELS = [
  { id: 'auto', name: 'Auto (Smart Routing)', category: 'Auto', color: 'from-purple-500 to-pink-500', cost: 'Variable' },
  { id: 'sora2', name: 'Sora 2', category: 'Big Three', color: 'from-green-400 to-blue-500', cost: '$0.08/s', features: ['Character Cameos', 'Storyboards', 'Up to 25s'] },
  { id: 'veo31', name: 'Veo 3.1', category: 'Big Three', color: 'from-blue-400 to-purple-500', cost: '$0.12/s', features: ['4K', 'Ingredients', 'Extensions >60s'] },
  { id: 'gen45', name: 'Gen-4.5', category: 'Big Three', color: 'from-purple-400 to-pink-500', cost: '$0.05/s', features: ['Physics Engine', 'Camera Controls'] },
  { id: 'hailuo', name: 'Hailuo 2.3', category: 'Chinese', color: 'from-cyan-400 to-blue-500', cost: '$0.045/s', features: ['Fastest', 'Media Agent'] },
  { id: 'hunyuan', name: 'HunyuanVideo', category: 'Chinese', color: 'from-red-400 to-orange-500', cost: 'FREE', features: ['Open Source', '4-Step'] },
  { id: 'hyworld', name: 'HY-World', category: 'Chinese', color: 'from-orange-400 to-yellow-500', cost: 'FREE', features: ['Interactive', 'WASD Control'] },
  { id: 'wan', name: 'Wan 2.2', category: 'Chinese', color: 'from-yellow-400 to-green-500', cost: '$0.07/s', features: ['MoE', 'Speech-to-Video'] },
  { id: 'kling26', name: 'Kling 2.6', category: 'Chinese', color: 'from-pink-400 to-red-500', cost: '$0.08/s', features: ['Motion Control', 'Native Audio'] },
  { id: 'klingo1', name: 'Kling O1', category: 'Chinese', color: 'from-red-500 to-pink-500', cost: '$0.12/s', features: ['Chain-of-Thought', 'Reasoning'] },
  { id: 'luma-ray3', name: 'Luma Ray 3', category: 'Specialized', color: 'from-indigo-400 to-purple-500', cost: '$0.30', features: ['3D Native', 'Modify'] },
  { id: 'pika22', name: 'Pika 2.2', category: 'Specialized', color: 'from-fuchsia-400 to-pink-500', cost: '$0.08/s', features: ['Pikaffects', 'Lip Sync'] },
  { id: 'mochi', name: 'Mochi 1', category: 'Specialized', color: 'from-violet-400 to-purple-500', cost: 'FREE', features: ['Open Source', 'AsymmDiT'] },
];

export default function StudioPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('auto');
  const [duration, setDuration] = useState(5);
  const [quality, setQuality] = useState('standard');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageUrl, setImageUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // API call would go here
    setTimeout(() => setIsGenerating(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
            Video Generation Studio
          </h1>
          <p className="text-gray-400 text-lg">Create stunning videos with 15+ state-of-the-art AI models</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Generation Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt Input */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your video... (e.g., 'A cinematic shot of a futuristic city at sunset with flying cars')"
                className="w-full h-32 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <button className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Enhance with AI
              </button>
            </div>

            {/* Model Selector */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <label className="block text-white font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Model Selection
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {MODELS.map((model) => (
                  <motion.button
                    key={model.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedModel(model.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedModel === model.id
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                    }`}
                  >
                    <div className={`text-sm font-bold bg-gradient-to-r ${model.color} bg-clip-text text-transparent`}>
                      {model.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{model.cost}</div>
                    {model.features && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {model.features.slice(0, 2).map((feature) => (
                          <span key={feature} className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-gray-300">
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <label className="block text-white font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Advanced Settings
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Duration (seconds)</label>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                  <div className="text-right text-sm text-gray-400">{duration}s</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Quality</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="standard">Standard</option>
                    <option value="high">High</option>
                    <option value="ultra">Ultra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Aspect Ratio</label>
                  <div className="flex gap-2">
                    {['16:9', '9:16', '1:1', '4:3'].map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          aspectRatio === ratio
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Init Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2 flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Audio URL (For S2V)
                  </label>
                  <input
                    type="url"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="w-full py-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl text-white font-bold text-xl flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  Generate Video
                  <Sparkles className="w-6 h-6" />
                </>
              )}
            </motion.button>
          </div>

          {/* Sidebar - Recent & Tips */}
          <div className="space-y-6">
            {/* Cost Estimate */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Cost Estimate
              </h3>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                {selectedModel === 'auto' ? 'Auto' : selectedModel === 'hunyuan' || selectedModel === 'hyworld' || selectedModel === 'mochi' ? 'FREE' : `$${(duration * 0.08).toFixed(2)}`}
              </div>
              <p className="text-sm text-gray-300 mt-2">
                {duration} seconds at {selectedModel === 'auto' ? 'variable rate' : MODELS.find(m => m.id === selectedModel)?.cost || '$0.08/s'}
              </p>
            </div>

            {/* Quick Tips */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Pro Tips</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                  <span><strong>Auto mode</strong> intelligently selects the best model for your needs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                  <span><strong>Hailuo 2.3</strong> is the fastest option at only $0.045/sec</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                  <span><strong>Sora 2</strong> supports character cameos for persistent characters</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
                  <span><strong>Wan 2.2</strong> can generate video from speech (add audio URL)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
