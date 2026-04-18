'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen, Clock, Heart, MessageCircle, Share2, User,
  TrendingUp, Calendar, Tag, Search, ChevronRight,
  Plane, Globe, Utensils, Mountain, Building, Palmtree
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: { name: string; avatar: string; role: string };
  category: string;
  tags: string[];
  readTime: number;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  isTrending: boolean;
  isFeatured: boolean;
}

const CATEGORIES = [
  { id: 'all', name: 'All', icon: Globe },
  { id: 'destinations', name: 'Destinations', icon: Palmtree },
  { id: 'tips', name: 'Travel Tips', icon: BookOpen },
  { id: 'food', name: 'Food & Drink', icon: Utensils },
  { id: 'adventure', name: 'Adventure', icon: Mountain },
  { id: 'city-breaks', name: 'City Breaks', icon: Building },
  { id: 'flights', name: 'Flight Deals', icon: Plane }
];

const ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'Will the New EES Give You Border Control Nightmares this Summer?',
    excerpt: "I'd like to know your views on the new EES system which is due to roll out in April '26. I'm a UK passport holder...",
    content: '',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
    author: { name: 'Tom Carter', avatar: '/avatars/tom.jpg', role: 'Navigator' },
    category: 'tips',
    tags: ['europe', 'border-control', 'travel-tips'],
    readTime: 5,
    publishedAt: '2024-04-15',
    views: 3421,
    likes: 234,
    comments: 89,
    isTrending: true,
    isFeatured: true
  },
  {
    id: 'art-2',
    title: 'Food and Drink Runs Around the World',
    excerpt: 'From wine tours in Bordeaux to street food in Bangkok, these are the culinary adventures worth traveling for.',
    content: '',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    author: { name: 'Sophie Chen', avatar: '/avatars/sophie.jpg', role: 'Food Editor' },
    category: 'food',
    tags: ['food', 'wine', 'culinary'],
    readTime: 8,
    publishedAt: '2024-04-14',
    views: 2156,
    likes: 567,
    comments: 45,
    isTrending: false,
    isFeatured: false
  },
  {
    id: 'art-3',
    title: 'Cathedrals, Canyons, and Crimes: Wild West Mythos from the Nevada Desert',
    excerpt: "Enjoyed that. There's definitely something about the American Southwest that captures the imagination...",
    content: '',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
    author: { name: 'Mike Rodriguez', avatar: '/avatars/mike.jpg', role: 'Adventure Writer' },
    category: 'adventure',
    tags: ['usa', 'desert', 'road-trip'],
    readTime: 12,
    publishedAt: '2024-04-13',
    views: 1876,
    likes: 432,
    comments: 67,
    isTrending: true,
    isFeatured: false
  },
  {
    id: 'art-4',
    title: '10 Hidden Gems in Portugal You Need to Visit',
    excerpt: 'Beyond Lisbon and Porto, Portugal holds countless treasures waiting to be discovered.',
    content: '',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
    author: { name: 'Ana Silva', avatar: '/avatars/ana.jpg', role: 'Local Expert' },
    category: 'destinations',
    tags: ['portugal', 'hidden-gems', 'europe'],
    readTime: 10,
    publishedAt: '2024-04-12',
    views: 4532,
    likes: 891,
    comments: 123,
    isTrending: true,
    isFeatured: true
  },
  {
    id: 'art-5',
    title: 'How to Find Mistake Fares: A Complete Guide',
    excerpt: 'Learn the secrets of finding error fares and booking flights at a fraction of the normal price.',
    content: '',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
    author: { name: 'James Wilson', avatar: '/avatars/james.jpg', role: 'Deal Hunter' },
    category: 'flights',
    tags: ['deals', 'tips', 'savings'],
    readTime: 7,
    publishedAt: '2024-04-11',
    views: 8921,
    likes: 2341,
    comments: 456,
    isTrending: true,
    isFeatured: false
  },
  {
    id: 'art-6',
    title: 'The Ultimate Tokyo Itinerary: 7 Days in Japan',
    excerpt: 'From ancient temples to neon-lit streets, experience the best of Tokyo with this perfect week-long guide.',
    content: '',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    author: { name: 'Yuki Tanaka', avatar: '/avatars/yuki.jpg', role: 'Japan Specialist' },
    category: 'city-breaks',
    tags: ['japan', 'tokyo', 'itinerary'],
    readTime: 15,
    publishedAt: '2024-04-10',
    views: 6754,
    likes: 1567,
    comments: 234,
    isTrending: false,
    isFeatured: true
  }
];

export default function ArticlesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set());

  const filteredArticles = ARTICLES.filter(article => {
    if (selectedCategory !== 'all' && article.category !== selectedCategory) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return article.title.toLowerCase().includes(query) ||
             article.excerpt.toLowerCase().includes(query);
    }
    return true;
  });

  const featuredArticle = ARTICLES.find(a => a.isFeatured);
  const trendingArticles = ARTICLES.filter(a => a.isTrending).slice(0, 3);

  const toggleLike = (articleId: string) => {
    setLikedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
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

            <h1 className="text-xl font-bold text-white">Articles</h1>

            <button className="p-2 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured Article */}
        {featuredArticle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Link href={`/articles/${featuredArticle.id}`}>
              <div className="relative h-96 rounded-3xl overflow-hidden group">
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-cyan-500 text-white text-sm font-medium rounded-full">
                      Featured
                    </span>
                    <span className="text-white/80 text-sm flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {featuredArticle.readTime} min read
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-white/80 mb-4 line-clamp-2">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {featuredArticle.author.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{featuredArticle.author.name}</p>
                        <p className="text-white/60 text-sm">{featuredArticle.author.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Search & Categories */}
        <div className="mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Articles */}
          <div className="lg:col-span-2 space-y-6">
            {filteredArticles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                <Link href={`/articles/${article.id}`}>
                  <div className="md:flex">
                    <div className="md:w-72 h-48 md:h-auto flex-shrink-0">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-cyan-100 text-cyan-700 text-xs font-medium rounded-full capitalize">
                          {article.category.replace('-', ' ')}
                        </span>
                        {article.isTrending && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Trending
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-cyan-600 transition-colors">
                        {article.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {article.author.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{article.author.name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {' · '}{article.readTime} min read
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-gray-500 text-sm">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleLike(article.id);
                            }}
                            className={`flex items-center gap-1 ${
                              likedArticles.has(article.id) ? 'text-red-500' : ''
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${likedArticles.has(article.id) ? 'fill-current' : ''}`} />
                            {article.likes + (likedArticles.has(article.id) ? 1 : 0)}
                          </button>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {article.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Trending */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Trending Now
              </h3>
              <div className="space-y-4">
                {trendingArticles.map((article, i) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.id}`}
                    className="flex items-start gap-3 group"
                  >
                    <span className="text-2xl font-bold text-cyan-500">{i + 1}</span>
                    <div>
                      <h4 className="font-medium text-gray-800 group-hover:text-cyan-600 transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {article.views.toLocaleString()} views
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Tags */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-cyan-500" />
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {['europe', 'beach', 'city-break', 'budget', 'luxury', 'adventure', 'food', 'culture', 'tips', 'deals'].map(tag => (
                  <button
                    key={tag}
                    className="px-3 py-1 bg-gray-100 hover:bg-cyan-100 text-gray-600 hover:text-cyan-700 text-sm rounded-full transition"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Get Travel Insights</h3>
              <p className="text-white/80 text-sm mb-4">
                Weekly articles, deals, and travel inspiration delivered to your inbox.
              </p>
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-2 rounded-lg bg-white/20 placeholder-white/60 text-white border border-white/30 focus:outline-none focus:border-white mb-3"
              />
              <button className="w-full py-2 bg-white text-cyan-600 font-semibold rounded-lg hover:bg-gray-100 transition">
                Subscribe Free
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 md:hidden z-50">
        <div className="flex items-center justify-around">
          {[
            { href: '/', icon: '🏠', label: 'Home' },
            { href: '/flight-deals', icon: '✈️', label: 'Flights' },
            { href: '/postcards', icon: '🖼️', label: 'Postcards' },
            { href: '/articles', icon: '📰', label: 'Articles', active: true },
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
