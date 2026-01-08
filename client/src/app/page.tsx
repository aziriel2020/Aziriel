'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Globe, Video, Wand2, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              NeuraField
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/studio" className="text-gray-300 hover:text-white transition-colors">
              Studio
            </Link>
            <Link href="/models" className="text-gray-300 hover:text-white transition-colors">
              Models
            </Link>
            <Link href="/gallery" className="text-gray-300 hover:text-white transition-colors">
              Gallery
            </Link>
            <Link
              href="/studio"
              className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-semibold hover:scale-105 transition-transform"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-7xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              The Future of
              <br />
              Video Creation
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              15+ State-of-the-Art AI Models. One Ultimate Platform.
              <br />
              From OpenAI Sora 2 to Tencent HY-World, All in Real-Time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/studio"
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-lg font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                <Rocket className="w-5 h-5" />
                Launch Studio
              </Link>
              <Link
                href="/models"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-lg font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Explore Models
              </Link>
            </div>
          </motion.div>

          {/* Feature Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 mt-20"
          >
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Lightning Fast"
              description="Generate videos 2-3x faster with Hailuo 2.3 at just $0.045/sec"
            />
            <FeatureCard
              icon={<Globe className="w-8 h-8" />}
              title="15+ SOTA Models"
              description="Access every major AI video model: Sora 2, Veo 3.1, Gen-4.5, and more"
            />
            <FeatureCard
              icon={<Wand2 className="w-8 h-8" />}
              title="Advanced Features"
              description="Character Cameos, Speech-to-Video, Physics Engine, Interactive Worlds"
            />
          </motion.div>
        </div>
      </section>

      {/* Models Showcase */}
      <section className="py-20 px-6 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Powered by the Best
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            <ModelBadge name="Sora 2" provider="OpenAI" color="from-green-400 to-blue-400" />
            <ModelBadge name="Veo 3.1" provider="Google" color="from-blue-400 to-purple-400" />
            <ModelBadge name="Gen-4.5" provider="Runway" color="from-purple-400 to-pink-400" />
            <ModelBadge name="Kling 2.6" provider="Kuaishou" color="from-pink-400 to-red-400" />
            <ModelBadge name="HunyuanVideo" provider="Tencent" color="from-red-400 to-orange-400" />
            <ModelBadge name="HY-World" provider="Tencent" color="from-orange-400 to-yellow-400" />
            <ModelBadge name="Wan 2.2" provider="Alibaba" color="from-yellow-400 to-green-400" />
            <ModelBadge name="Hailuo 2.3" provider="MiniMax" color="from-cyan-400 to-blue-400" />
            <ModelBadge name="Luma Ray 3" provider="Luma" color="from-indigo-400 to-purple-400" />
            <ModelBadge name="Pika 2.2" provider="Pika" color="from-fuchsia-400 to-pink-400" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Ready to Create?
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Join thousands of creators using the world's most powerful AI video platform
            </p>
            <Link
              href="/studio"
              className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full text-xl font-bold hover:scale-105 transition-transform"
            >
              <Video className="w-6 h-6" />
              Start Creating Now
              <Sparkles className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all hover:scale-105">
      <div className="text-purple-400 mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function ModelBadge({ name, provider, color }: { name: string; provider: string; color: string }) {
  return (
    <div className={`p-4 bg-gradient-to-br ${color} rounded-xl text-center hover:scale-110 transition-transform cursor-pointer`}>
      <div className="text-sm font-bold text-white">{name}</div>
      <div className="text-xs text-white/80">{provider}</div>
    </div>
  );
}
