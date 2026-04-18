'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, Heart, Share2, Clock, MapPin, Calendar, Filter,
  TrendingUp, Zap, Star, ChevronRight, Search, Bell, Lock,
  Unlock, Briefcase, Check, X, Globe, Sun, Thermometer,
  Users, Crown, Sparkles, ArrowRight, Eye, MessageCircle
} from 'lucide-react';

interface FlightDeal {
  id: string;
  destination: string;
  country: string;
  countryCode: string;
  image: string;
  priceFrom: number;
  priceTo: number;
  currency: string;
  description: string;
  addedAt: string;
  expiresAt?: string;
  views: number;
  saves: number;
  comments: number;
  tags: string[];
  isUnlocked: boolean;
  isPremium: boolean;
  isTrending: boolean;
  isLatest: boolean;
  freeBag: boolean;
  weather?: { temp: number; condition: string };
  airports: string[];
}

const FLIGHT_DEALS: FlightDeal[] = [
  {
    id: 'deal-1',
    destination: 'Barcelona',
    country: 'Spain',
    countryCode: 'ES',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
    priceFrom: 30,
    priceTo: 120,
    currency: 'EUR',
    description: 'Amazing deals to the vibrant Catalan capital! Perfect for architecture lovers.',
    addedAt: '2024-04-15',
    views: 739,
    saves: 234,
    comments: 45,
    tags: ['city-break', 'beach', 'culture'],
    isUnlocked: true,
    isPremium: false,
    isTrending: true,
    isLatest: false,
    freeBag: false,
    weather: { temp: 22, condition: 'sunny' },
    airports: ['BCN']
  },
  {
    id: 'deal-2',
    destination: 'New York',
    country: 'USA',
    countryCode: 'US',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    priceFrom: 390,
    priceTo: 410,
    currency: 'EUR',
    description: 'The Big Apple awaits! Incredible prices for transatlantic flights.',
    addedAt: '2024-04-13',
    views: 1523,
    saves: 567,
    comments: 89,
    tags: ['city-break', 'shopping', 'iconic'],
    isUnlocked: true,
    isPremium: false,
    isTrending: false,
    isLatest: true,
    freeBag: true,
    weather: { temp: 18, condition: 'cloudy' },
    airports: ['JFK', 'EWR', 'LGA']
  },
  {
    id: 'deal-3',
    destination: 'Casablanca',
    country: 'Morocco',
    countryCode: 'MA',
    image: 'https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=800',
    priceFrom: 120,
    priceTo: 200,
    currency: 'EUR',
    description: "Bet you didn't know these Hollywood flicks were shot in Casablanca...",
    addedAt: '2024-04-15',
    views: 456,
    saves: 123,
    comments: 23,
    tags: ['exotic', 'culture', 'history'],
    isUnlocked: true,
    isPremium: false,
    isTrending: false,
    isLatest: false,
    freeBag: false,
    weather: { temp: 24, condition: 'sunny' },
    airports: ['CMN']
  },
  {
    id: 'deal-4',
    destination: 'China',
    country: 'China',
    countryCode: 'CN',
    image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800',
    priceFrom: 390,
    priceTo: 470,
    currency: 'EUR',
    description: "Word to the wise...don't miss this place off your China bucket list!",
    addedAt: '2024-02-27',
    views: 892,
    saves: 345,
    comments: 67,
    tags: ['adventure', 'culture', 'nature'],
    isUnlocked: true,
    isPremium: true,
    isTrending: false,
    isLatest: false,
    freeBag: true,
    weather: { temp: 20, condition: 'cloudy' },
    airports: ['PEK', 'PVG', 'CAN']
  },
  {
    id: 'deal-5',
    destination: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    priceFrom: 450,
    priceTo: 580,
    currency: 'EUR',
    description: 'Cherry blossom season deals! Experience the magic of Japan.',
    addedAt: '2024-04-10',
    views: 2341,
    saves: 891,
    comments: 156,
    tags: ['culture', 'food', 'technology'],
    isUnlocked: false,
    isPremium: true,
    isTrending: true,
    isLatest: false,
    freeBag: true,
    weather: { temp: 16, condition: 'sunny' },
    airports: ['NRT', 'HND']
  },
  {
    id: 'deal-6',
    destination: 'Bali',
    country: 'Indonesia',
    countryCode: 'ID',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    priceFrom: 520,
    priceTo: 650,
    currency: 'EUR',
    description: 'Paradise awaits! Unbeatable prices to the Island of Gods.',
    addedAt: '2024-04-08',
    views: 1876,
    saves: 723,
    comments: 98,
    tags: ['beach', 'wellness', 'nature'],
    isUnlocked: false,
    isPremium: true,
    isTrending: false,
    isLatest: false,
    freeBag: false,
    weather: { temp: 30, condition: 'sunny' },
    airports: ['DPS']
  },
  {
    id: 'deal-7',
    destination: 'Iceland',
    country: 'Iceland',
    countryCode: 'IS',
    image: 'https://images.unsplash.com/photo-1520769945061-0a448c463865?w=800',
    priceFrom: 89,
    priceTo: 150,
    currency: 'EUR',
    description: 'Northern lights season! Incredible stopover deals to Reykjavik.',
    addedAt: '2024-04-14',
    views: 3421,
    saves: 1234,
    comments: 234,
    tags: ['nature', 'adventure', 'unique'],
    isUnlocked: true,
    isPremium: false,
    isTrending: true,
    isLatest: true,
    freeBag: true,
    weather: { temp: 5, condition: 'cloudy' },
    airports: ['KEF']
  },
  {
    id: 'deal-8',
    destination: 'Maldives',
    country: 'Maldives',
    countryCode: 'MV',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
    priceFrom: 680,
    priceTo: 850,
    currency: 'EUR',
    description: 'Luxury for less! Premium cabin deals to paradise.',
    addedAt: '2024-04-12',
    views: 4521,
    saves: 1890,
    comments: 312,
    tags: ['luxury', 'beach', 'honeymoon'],
    isUnlocked: false,
    isPremium: true,
    isTrending: true,
    isLatest: false,
    freeBag: true,
    weather: { temp: 31, condition: 'sunny' },
    airports: ['MLE']
  }
];

const FLAG_EMOJIS: Record<string, string> = {
  ES: '🇪🇸', US: '🇺🇸', MA: '🇲🇦', CN: '🇨🇳', JP: '🇯🇵',
  ID: '🇮🇩', IS: '🇮🇸', MV: '🇲🇻', FR: '🇫🇷', IT: '🇮🇹',
  GB: '🇬🇧', DE: '🇩🇪', TH: '🇹🇭', AU: '🇦🇺', BR: '🇧🇷'
};

export default function FlightDealsPage() {
  const [deals, setDeals] = useState<FlightDeal[]>(FLIGHT_DEALS);
  const [savedDeals, setSavedDeals] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'trending' | 'latest' | 'free-bag'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<FlightDeal | null>(null);

  const filteredDeals = deals.filter(deal => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!deal.destination.toLowerCase().includes(query) &&
          !deal.country.toLowerCase().includes(query)) {
        return false;
      }
    }

    switch (filter) {
      case 'trending': return deal.isTrending;
      case 'latest': return deal.isLatest;
      case 'free-bag': return deal.freeBag;
      default: return true;
    }
  });

  const toggleSave = (dealId: string) => {
    setSavedDeals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dealId)) {
        newSet.delete(dealId);
      } else {
        newSet.add(dealId);
      }
      return newSet;
    });
  };

  const handleDealClick = (deal: FlightDeal) => {
    if (!deal.isUnlocked && deal.isPremium) {
      setSelectedDeal(deal);
      setShowPremiumModal(true);
    }
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

            <nav className="hidden md:flex items-center gap-6 text-white">
              <Link href="/flight-deals" className="font-medium border-b-2 border-white pb-1">Flights</Link>
              <Link href="/postcards" className="hover:opacity-80">Postcards</Link>
              <Link href="/articles" className="hover:opacity-80">Articles</Link>
              <Link href="/premium" className="hover:opacity-80">Upgrade</Link>
            </nav>

            <button className="p-2 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Personalization Banner */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl">👥</div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">
                We know hardly anything about you 😭
              </p>
              <p className="text-sm text-gray-600">
                Tell us your dream destinations and when you're ready to go so our Navigators know what to look out for.
              </p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {[
              { key: 'all', label: 'All Deals', icon: Globe },
              { key: 'trending', label: 'Trending', icon: TrendingUp },
              { key: 'latest', label: 'Latest', icon: Zap },
              { key: 'free-bag', label: 'Free Bag', icon: Briefcase }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition ${
                  filter === key
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-between mb-6 text-sm text-gray-600">
          <p>{filteredDeals.length} deals found</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              5.2M+ members
            </span>
            <span className="flex items-center gap-1">
              <Plane className="w-4 h-4" />
              150+ deals/month
            </span>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal, index) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all ${
                !deal.isUnlocked && deal.isPremium ? 'opacity-75' : ''
              }`}
            >
              {/* Image */}
              <div className="relative h-48">
                <img
                  src={deal.image}
                  alt={deal.destination}
                  className="w-full h-full object-cover"
                />

                {/* Country Flag */}
                <div className="absolute top-3 left-3 text-2xl bg-white/90 rounded-lg px-2 py-1">
                  {FLAG_EMOJIS[deal.countryCode] || '🌍'}
                </div>

                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  {deal.freeBag && (
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded">
                      free bag
                    </span>
                  )}
                  {deal.isTrending && (
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded">
                      Trending
                    </span>
                  )}
                  {deal.isLatest && (
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded">
                      Latest Deal
                    </span>
                  )}
                </div>

                {/* Lock overlay for premium */}
                {!deal.isUnlocked && deal.isPremium && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white rounded-full p-3">
                      <Lock className="w-6 h-6 text-gray-600" />
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {deal.destination} {FLAG_EMOJIS[deal.countryCode]}
                    </h3>
                    <p className="text-cyan-600 font-semibold">
                      in €{deal.priceFrom}s-€{deal.priceTo}s rtn
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSave(deal.id)}
                    className={`p-2 rounded-full transition ${
                      savedDeals.has(deal.id)
                        ? 'text-red-500'
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${savedDeals.has(deal.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {deal.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {deal.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {deal.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {deal.saves}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {deal.comments}
                    </span>
                  </div>

                  {deal.isUnlocked ? (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <Unlock className="w-3 h-3" />
                      Unlocked
                    </span>
                  ) : (
                    <button
                      onClick={() => handleDealClick(deal)}
                      className="flex items-center gap-1 text-xs text-cyan-600 font-medium"
                    >
                      <Crown className="w-3 h-3" />
                      Premium
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Added: {new Date(deal.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Premium CTA Banner */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 py-12 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Get all our Flights
            </h2>
            <p className="text-cyan-600 text-xl font-bold mb-6">€1 today</p>

            <Link
              href="/premium"
              className="block w-full py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition mb-6"
            >
              Unlock all flights
            </Link>

            <div className="space-y-3 text-left">
              {[
                'Immediate access to all our flights',
                'Unlock 100s more from your airport',
                'Save hundreds on your next trip',
                'Join 5,200,000+ members'
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-6">
              Only €1 today. Renews annually at €48. Cancel any time.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 md:hidden z-50">
        <div className="flex items-center justify-around">
          {[
            { href: '/', icon: '🏠', label: 'Home' },
            { href: '/flight-deals', icon: '✈️', label: 'Flights', active: true },
            { href: '/postcards', icon: '🖼️', label: 'Postcards' },
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

      {/* Premium Modal */}
      <AnimatePresence>
        {showPremiumModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowPremiumModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <button
                onClick={() => setShowPremiumModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Unlock {selectedDeal?.destination} Deal
                </h3>
                <p className="text-gray-600">
                  Get instant access to this deal and hundreds more with Premium.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  'Full deal details & booking links',
                  'Price alerts when fares drop',
                  'Exclusive premium-only deals',
                  'No ads, ever'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/premium"
                className="block w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl text-center hover:opacity-90 transition"
              >
                Try Premium for €1
              </Link>

              <p className="text-xs text-gray-500 text-center mt-3">
                7-day trial, then €48/year. Cancel anytime.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
