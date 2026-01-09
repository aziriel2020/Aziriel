'use client';

import { motion } from 'framer-motion';
import { Sparkles, Video, Clock, DollarSign, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { useUserJobs } from '@/hooks/useVideo';
import { useCredits } from '@/hooks/useAuth';
import { useWebSocketStore } from '@/store/useWebSocketStore';

export default function DashboardPage() {
  const { data: jobsData } = useUserJobs({ limit: 10 });
  const { data: creditsData } = useCredits();
  const isConnected = useWebSocketStore((state) => state.isConnected);

  const jobs = jobsData?.data?.jobs || [];
  const credits = creditsData?.data?.credits || 0;

  const stats = {
    totalVideos: jobs.length,
    completed: jobs.filter((j: any) => j.status === 'COMPLETED').length,
    processing: jobs.filter((j: any) => j.status === 'PROCESSING').length,
    failed: jobs.filter((j: any) => j.status === 'FAILED').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-gray-300 hover:text-white mb-2 inline-block text-sm">
                ← Back
              </Link>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {isConnected && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-300 text-sm font-medium">Live</span>
                </div>
              )}
              <Link
                href="/studio"
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold hover:scale-105 transition-transform"
              >
                Create New
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Video className="w-6 h-6" />}
            title="Total Videos"
            value={stats.totalVideos}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Completed"
            value={stats.completed}
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Processing"
            value={stats.processing}
            color="from-yellow-500 to-orange-500"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            title="Credits"
            value={credits}
            color="from-purple-500 to-pink-500"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-purple-400" />
              Recent Activity
            </h2>
            <Link href="/gallery" className="text-purple-300 hover:text-purple-200 text-sm font-medium">
              View All →
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No videos yet</p>
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold hover:scale-105 transition-transform"
              >
                <Sparkles className="w-4 h-4" />
                Create Your First Video
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.slice(0, 5).map((job: any, index: number) => (
                <ActivityItem key={job.id} job={job} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <QuickActionCard
            title="Generate Video"
            description="Create stunning videos with 15+ AI models"
            href="/studio"
            color="from-purple-500 to-pink-500"
          />
          <QuickActionCard
            title="Browse Models"
            description="Compare all available AI video models"
            href="/models"
            color="from-blue-500 to-cyan-500"
          />
          <QuickActionCard
            title="View Gallery"
            description="See all your created videos"
            href="/gallery"
            color="from-green-500 to-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
    >
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${color} mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-gray-400 text-sm">{title}</div>
    </motion.div>
  );
}

function ActivityItem({ job, index }: { job: any; index: number }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-400';
      case 'PROCESSING':
        return 'text-blue-400';
      case 'FAILED':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
    >
      <div className="flex-1">
        <p className="text-white font-medium mb-1 line-clamp-1">{job.prompt}</p>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>{job.provider || job.options?.model || 'auto'}</span>
          <span>•</span>
          <span>{new Date(job.createdAt).toLocaleString()}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-sm font-medium ${getStatusColor(job.status)}`}>
          {job.status}
        </span>
        {job.status === 'COMPLETED' && job.outputUrl && (
          <a
            href={job.outputUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 text-sm font-medium transition-colors"
          >
            View
          </a>
        )}
      </div>
    </motion.div>
  );
}

function QuickActionCard({ title, description, href, color }: { title: string; description: string; href: string; color: string }) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all h-full"
      >
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center mb-4`}>
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </motion.div>
    </Link>
  );
}
