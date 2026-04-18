'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon, Heart, MessageCircle, Share2, MapPin,
  Calendar, User, Camera, Plus, X, Send, Plane, Globe
} from 'lucide-react';

interface Postcard {
  id: string;
  image: string;
  location: string;
  country: string;
  caption: string;
  author: { name: string; avatar: string };
  date: string;
  likes: number;
  comments: number;
  tags: string[];
}

const POSTCARDS: Postcard[] = [
  {
    id: 'pc-1',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    location: 'Eiffel Tower',
    country: 'France',
    caption: 'Watching the sunset from the City of Light. Paris never disappoints! 🗼✨',
    author: { name: 'Emma Wilson', avatar: '/avatars/emma.jpg' },
    date: '2024-04-15',
    likes: 1234,
    comments: 89,
    tags: ['paris', 'france', 'sunset', 'travel']
  },
  {
    id: 'pc-2',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    location: 'Ubud Rice Terraces',
    country: 'Indonesia',
    caption: 'Found my peace in these emerald waves of rice. Bali is pure magic 🌿',
    author: { name: 'Alex Chen', avatar: '/avatars/alex.jpg' },
    date: '2024-04-14',
    likes: 2156,
    comments: 123,
    tags: ['bali', 'indonesia', 'nature', 'peaceful']
  },
  {
    id: 'pc-3',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    location: 'Swiss Alps',
    country: 'Switzerland',
    caption: 'Above the clouds, where dreams touch the sky ⛰️❄️',
    author: { name: 'Marco Berg', avatar: '/avatars/marco.jpg' },
    date: '2024-04-13',
    likes: 3421,
    comments: 234,
    tags: ['switzerland', 'alps', 'mountains', 'adventure']
  },
  {
    id: 'pc-4',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
    location: 'Maldives',
    country: 'Maldives',
    caption: 'This is what paradise looks like. Crystal clear waters and pure bliss 🏝️',
    author: { name: 'Sophie Lee', avatar: '/avatars/sophie.jpg' },
    date: '2024-04-12',
    likes: 4532,
    comments: 312,
    tags: ['maldives', 'beach', 'paradise', 'ocean']
  },
  {
    id: 'pc-5',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    location: 'Shibuya Crossing',
    country: 'Japan',
    caption: 'Lost in the organized chaos of Tokyo. The energy here is unmatched! 🗼🎌',
    author: { name: 'Yuki Tanaka', avatar: '/avatars/yuki.jpg' },
    date: '2024-04-11',
    likes: 2890,
    comments: 178,
    tags: ['tokyo', 'japan', 'city', 'culture']
  },
  {
    id: 'pc-6',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
    location: 'Colosseum',
    country: 'Italy',
    caption: 'Walking where gladiators once fought. History comes alive in Rome 🏛️',
    author: { name: 'Luca Romano', avatar: '/avatars/luca.jpg' },
    date: '2024-04-10',
    likes: 1987,
    comments: 145,
    tags: ['rome', 'italy', 'history', 'architecture']
  },
  {
    id: 'pc-7',
    image: 'https://images.unsplash.com/photo-1520769945061-0a448c463865?w=800',
    location: 'Northern Lights',
    country: 'Iceland',
    caption: 'Witnessing the aurora borealis - a bucket list moment! 💚✨',
    author: { name: 'Erik Johansson', avatar: '/avatars/erik.jpg' },
    date: '2024-04-09',
    likes: 5678,
    comments: 456,
    tags: ['iceland', 'aurora', 'nature', 'magic']
  },
  {
    id: 'pc-8',
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800',
    location: 'Santorini',
    country: 'Greece',
    caption: 'Blue domes, white walls, and endless sunsets. Greek island life 🇬🇷',
    author: { name: 'Maria Papadopoulos', avatar: '/avatars/maria.jpg' },
    date: '2024-04-08',
    likes: 3456,
    comments: 234,
    tags: ['santorini', 'greece', 'islands', 'sunset']
  }
];

export default function PostcardsPage() {
  const [postcards] = useState<Postcard[]>(POSTCARDS);
  const [likedPostcards, setLikedPostcards] = useState<Set<string>>(new Set());
  const [selectedPostcard, setSelectedPostcard] = useState<Postcard | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const toggleLike = (postcardId: string) => {
    setLikedPostcards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postcardId)) {
        newSet.delete(postcardId);
      } else {
        newSet.add(postcardId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-cyan-400 to-cyan-500 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Plane className="w-6 h-6 text-cyan-500" />
              </div>
              <span className="text-2xl font-bold text-white">Skyward</span>
            </Link>

            <h1 className="text-xl font-bold text-white">Postcards</h1>

            <button className="p-2 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Travel Postcards from Around the World
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Share your adventures and discover stunning destinations through the eyes of fellow travelers.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition"
          >
            <Camera className="w-5 h-5" />
            Share Your Postcard
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12 max-w-xl mx-auto">
          {[
            { label: 'Postcards', value: '12,456' },
            { label: 'Countries', value: '156' },
            { label: 'Travelers', value: '45,678' }
          ].map(stat => (
            <div key={stat.label} className="text-center p-4 bg-white rounded-xl shadow-sm">
              <p className="text-2xl font-bold text-cyan-600">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Postcards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {postcards.map((postcard, index) => (
            <motion.div
              key={postcard.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group"
              onClick={() => setSelectedPostcard(postcard)}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={postcard.image}
                  alt={postcard.location}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Location Badge */}
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-bold text-lg">{postcard.location}</p>
                  <p className="text-white/80 text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {postcard.country}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {postcard.caption}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {postcard.author.name.charAt(0)}
                    </div>
                    <span className="text-sm text-gray-600">{postcard.author.name}</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-500 text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(postcard.id);
                      }}
                      className={`flex items-center gap-1 ${
                        likedPostcards.has(postcard.id) ? 'text-red-500' : ''
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${likedPostcards.has(postcard.id) ? 'fill-current' : ''}`} />
                      {postcard.likes + (likedPostcards.has(postcard.id) ? 1 : 0)}
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {postcard.comments}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition">
            Load More Postcards
          </button>
        </div>
      </div>

      {/* Postcard Detail Modal */}
      <AnimatePresence>
        {selectedPostcard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80"
              onClick={() => setSelectedPostcard(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <button
                onClick={() => setSelectedPostcard(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="md:flex">
                <div className="md:w-2/3 h-64 md:h-auto">
                  <img
                    src={selectedPostcard.image}
                    alt={selectedPostcard.location}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="md:w-1/3 p-6 overflow-y-auto max-h-[60vh] md:max-h-[90vh]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                      {selectedPostcard.author.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{selectedPostcard.author.name}</p>
                      <p className="text-sm text-gray-500">{new Date(selectedPostcard.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-cyan-500" />
                      {selectedPostcard.location}
                    </p>
                    <p className="text-gray-500">{selectedPostcard.country}</p>
                  </div>

                  <p className="text-gray-700 mb-6">
                    {selectedPostcard.caption}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedPostcard.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-cyan-100 text-cyan-700 text-sm rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 pb-4 border-b border-gray-200 mb-4">
                    <button
                      onClick={() => toggleLike(selectedPostcard.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                        likedPostcards.has(selectedPostcard.id)
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${likedPostcards.has(selectedPostcard.id) ? 'fill-current' : ''}`} />
                      {selectedPostcard.likes + (likedPostcards.has(selectedPostcard.id) ? 1 : 0)}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200">
                      <Share2 className="w-5 h-5" />
                      Share
                    </button>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Comments ({selectedPostcard.comments})
                    </h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <button className="p-2 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition">
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowUploadModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl"
            >
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-gray-800 mb-6">Share Your Postcard</h3>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6 hover:border-cyan-500 transition cursor-pointer">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">Drop your photo here or click to upload</p>
                <p className="text-sm text-gray-400">JPG, PNG up to 10MB</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Where was this taken?"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                  <textarea
                    placeholder="Share your story..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    placeholder="Add tags (comma separated)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <button className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition">
                Share Postcard
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 md:hidden z-40">
        <div className="flex items-center justify-around">
          {[
            { href: '/', icon: '🏠', label: 'Home' },
            { href: '/flight-deals', icon: '✈️', label: 'Flights' },
            { href: '/postcards', icon: '🖼️', label: 'Postcards', active: true },
            { href: '/articles', icon: '📰', label: 'Articles' },
            { href: '/premium', icon: '👑', label: 'Upgrade' }
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 ${
                item.active ? 'text-cyan-600' : 'text-gray-500'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
