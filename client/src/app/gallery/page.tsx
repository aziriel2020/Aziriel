'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Download, Heart, Share2, Filter, Search, Grid3x3, List } from 'lucide-react';
import Link from 'next/link';
import { useUserJobs } from '@/hooks/useVideo';

export default function GalleryPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'completed' | 'processing' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: jobsData, isLoading } = useUserJobs({
    status: filter === 'all' ? undefined : filter.toUpperCase(),
    limit: 50,
  });

  const jobs = jobsData?.data?.jobs || [];

  const filteredJobs = jobs.filter((job: any) =>
    job.prompt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Link href="/" className="text-gray-300 hover:text-white mb-2 inline-block text-sm">
                ← Back
              </Link>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                My Gallery
              </h1>
            </div>
            <Link
              href="/studio"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold hover:scale-105 transition-transform"
            >
              Create New
            </Link>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by prompt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
                {['all', 'completed', 'processing', 'failed'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === f
                        ? 'bg-purple-500 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid/List */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-6">No videos found</p>
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold hover:scale-105 transition-transform"
            >
              Create Your First Video
            </Link>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredJobs.map((job: any, index: number) => (
                  <VideoCard key={job.id} job={job} index={index} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {filteredJobs.map((job: any, index: number) => (
                  <VideoListItem key={job.id} job={job} index={index} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function VideoCard({ job, index }: { job: any; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all"
    >
      {/* Thumbnail/Video */}
      <div className="relative aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50">
        {job.status === 'COMPLETED' && job.outputUrl ? (
          <video
            src={job.outputUrl}
            poster={job.thumbnailUrl}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
            {...(isHovered && { autoPlay: true })}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            {job.status === 'PROCESSING' ? (
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
                <p className="text-white text-sm">Processing...</p>
              </div>
            ) : job.status === 'FAILED' ? (
              <div className="text-center text-red-400">
                <p className="text-sm">Generation Failed</p>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <p className="text-sm">Pending</p>
              </div>
            )}
          </div>
        )}

        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
          job.status === 'COMPLETED' ? 'bg-green-500/90' :
          job.status === 'PROCESSING' ? 'bg-blue-500/90' :
          job.status === 'FAILED' ? 'bg-red-500/90' :
          'bg-gray-500/90'
        } text-white backdrop-blur-sm`}>
          {job.status}
        </div>

        {/* Hover Overlay */}
        {job.status === 'COMPLETED' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center gap-3"
          >
            <button className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
              <Play className="w-6 h-6 text-white" />
            </button>
            <button className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
              <Download className="w-6 h-6 text-white" />
            </button>
            <button className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
              <Share2 className="w-6 h-6 text-white" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-white font-medium mb-2 line-clamp-2">{job.prompt}</p>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{job.provider || job.options?.model || 'auto'}</span>
          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
}

function VideoListItem({ job, index }: { job: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
    >
      <div className="flex items-center gap-4">
        {/* Thumbnail */}
        <div className="w-40 aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg flex-shrink-0 overflow-hidden">
          {job.status === 'COMPLETED' && job.outputUrl ? (
            <video src={job.outputUrl} poster={job.thumbnailUrl} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              {job.status}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-white font-medium mb-1">{job.prompt}</p>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>{job.provider || job.options?.model || 'auto'}</span>
                <span>•</span>
                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span className={`${
                  job.status === 'COMPLETED' ? 'text-green-400' :
                  job.status === 'PROCESSING' ? 'text-blue-400' :
                  job.status === 'FAILED' ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {job.status}
                </span>
              </div>
            </div>

            {/* Actions */}
            {job.status === 'COMPLETED' && (
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Play className="w-5 h-5 text-gray-300" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-gray-300" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Heart className="w-5 h-5 text-gray-300" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Share2 className="w-5 h-5 text-gray-300" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
