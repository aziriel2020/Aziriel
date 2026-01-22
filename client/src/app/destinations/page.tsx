'use client';

/**
 * DESTINATIONS PAGE
 * Browse and explore travel destinations
 */

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Plane,
  Sun,
  Umbrella,
  Mountain,
  Building2,
  Palmtree,
  Snowflake,
  Heart,
  Star,
  TrendingUp,
  Filter,
  ChevronRight,
  Globe,
  Calendar,
  DollarSign
} from 'lucide-react';

const FEATURED_DESTINATIONS = [
  {
    slug: 'paris',
    name: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    description: 'City of Light, romance, and world-class cuisine',
    flightFrom: 487,
    hotelFrom: 189,
    rating: 4.8,
    reviews: 12453,
    tags: ['City Break', 'Culture', 'Romance'],
    bestTime: 'Apr-Jun, Sep-Oct',
    weather: '15-25°C'
  },
  {
    slug: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    description: 'Ancient traditions meet cutting-edge technology',
    flightFrom: 892,
    hotelFrom: 156,
    rating: 4.9,
    reviews: 9876,
    tags: ['City Break', 'Culture', 'Food'],
    bestTime: 'Mar-May, Sep-Nov',
    weather: '10-28°C'
  },
  {
    slug: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    description: 'Tropical paradise with rich spiritual heritage',
    flightFrom: 756,
    hotelFrom: 89,
    rating: 4.7,
    reviews: 15234,
    tags: ['Beach', 'Culture', 'Wellness'],
    bestTime: 'Apr-Oct',
    weather: '27-30°C'
  },
  {
    slug: 'new-york',
    name: 'New York',
    country: 'United States',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    description: 'The city that never sleeps',
    flightFrom: 298,
    hotelFrom: 199,
    rating: 4.6,
    reviews: 18932,
    tags: ['City Break', 'Shopping', 'Entertainment'],
    bestTime: 'Apr-Jun, Sep-Nov',
    weather: '0-30°C'
  },
  {
    slug: 'maldives',
    name: 'Maldives',
    country: 'Maldives',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
    description: 'Ultimate luxury on pristine turquoise waters',
    flightFrom: 1245,
    hotelFrom: 450,
    rating: 4.9,
    reviews: 7654,
    tags: ['Beach', 'Luxury', 'Romance'],
    bestTime: 'Nov-Apr',
    weather: '28-32°C'
  },
  {
    slug: 'rome',
    name: 'Rome',
    country: 'Italy',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
    description: 'Eternal city of history, art, and gastronomy',
    flightFrom: 534,
    hotelFrom: 145,
    rating: 4.8,
    reviews: 11234,
    tags: ['City Break', 'History', 'Food'],
    bestTime: 'Apr-Jun, Sep-Oct',
    weather: '10-30°C'
  }
];

const REGIONS = [
  { id: 'europe', name: 'Europe', icon: Building2, count: 156 },
  { id: 'asia', name: 'Asia', icon: Mountain, count: 124 },
  { id: 'americas', name: 'Americas', icon: Building2, count: 98 },
  { id: 'caribbean', name: 'Caribbean', icon: Palmtree, count: 45 },
  { id: 'middle-east', name: 'Middle East', icon: Sun, count: 32 },
  { id: 'africa', name: 'Africa', icon: Sun, count: 54 },
  { id: 'oceania', name: 'Oceania', icon: Umbrella, count: 28 }
];

const TRAVEL_STYLES = [
  { id: 'beach', name: 'Beach & Sun', icon: Sun, color: 'bg-yellow-500' },
  { id: 'city', name: 'City Breaks', icon: Building2, color: 'bg-blue-500' },
  { id: 'adventure', name: 'Adventure', icon: Mountain, color: 'bg-green-500' },
  { id: 'culture', name: 'Culture', icon: Globe, color: 'bg-purple-500' },
  { id: 'romantic', name: 'Romantic', icon: Heart, color: 'bg-pink-500' },
  { id: 'winter', name: 'Winter Sports', icon: Snowflake, color: 'bg-cyan-500' }
];

const TRENDING = [
  { name: 'Dubai', country: 'UAE', trend: '+45%' },
  { name: 'Iceland', country: 'Iceland', trend: '+38%' },
  { name: 'Portugal', country: 'Portugal', trend: '+32%' },
  { name: 'Vietnam', country: 'Vietnam', trend: '+28%' },
  { name: 'Mexico', country: 'Mexico', trend: '+25%' }
];

export default function DestinationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [savedDestinations, setSavedDestinations] = useState<string[]>([]);

  const toggleSave = (slug: string) => {
    setSavedDestinations(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const filteredDestinations = FEATURED_DESTINATIONS.filter(dest => {
    if (searchQuery && !dest.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !dest.country.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920"
            alt="Travel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/50 to-gray-900" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Explore the World
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover amazing destinations and plan your perfect getaway
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations, countries, or experiences..."
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Travel Styles */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">How do you want to travel?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {TRAVEL_STYLES.map((style) => (
              <motion.button
                key={style.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedStyle(selectedStyle === style.id ? null : style.id)}
                className={`p-6 rounded-2xl border transition-all ${
                  selectedStyle === style.id
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-white/10 bg-gray-800/50 hover:border-white/20'
                }`}
              >
                <div className={`w-12 h-12 ${style.color} rounded-xl flex items-center justify-center mb-3 mx-auto`}>
                  <style.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-white font-medium text-center">{style.name}</p>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Regions */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Browse by Region</h2>
          <div className="flex flex-wrap gap-3">
            {REGIONS.map((region) => (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(selectedRegion === region.id ? null : region.id)}
                className={`px-5 py-3 rounded-xl flex items-center gap-3 transition-all ${
                  selectedRegion === region.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800 border border-white/10'
                }`}
              >
                <region.icon className="w-5 h-5" />
                <span>{region.name}</span>
                <span className="text-sm opacity-70">({region.count})</span>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Destinations */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Featured Destinations</h2>
            <Link href="/destinations/all" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((destination, index) => (
              <motion.div
                key={destination.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/destinations/${destination.slug}`}>
                  <div className="group bg-gray-800/50 rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all">
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

                      {/* Save Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleSave(destination.slug);
                        }}
                        className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                          savedDestinations.includes(destination.slug)
                            ? 'bg-red-500 text-white'
                            : 'bg-black/50 text-white hover:bg-black/70'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${savedDestinations.includes(destination.slug) ? 'fill-current' : ''}`} />
                      </button>

                      {/* Tags */}
                      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                        {destination.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs text-white">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                            {destination.name}
                          </h3>
                          <p className="text-gray-400 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {destination.country}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-blue-500/20 px-2 py-1 rounded-lg">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-white font-medium">{destination.rating}</span>
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm mb-4">{destination.description}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Plane className="w-4 h-4 text-blue-400" />
                            <span className="text-gray-400">from</span>
                            <span className="text-white font-semibold">${destination.flightFrom}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Building2 className="w-4 h-4 text-purple-400" />
                            <span className="text-gray-400">from</span>
                            <span className="text-white font-semibold">${destination.hotelFrom}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trending Destinations */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Trending Now</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {TRENDING.map((dest, index) => (
              <Link
                key={dest.name}
                href={`/destinations/${dest.name.toLowerCase().replace(' ', '-')}`}
                className="bg-gray-800/50 rounded-xl p-4 border border-white/10 hover:border-green-500/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">#{index + 1}</span>
                  <span className="text-green-400 text-sm font-medium">{dest.trend}</span>
                </div>
                <h3 className="text-white font-semibold group-hover:text-green-400 transition-colors">{dest.name}</h3>
                <p className="text-gray-500 text-sm">{dest.country}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Best Time to Travel */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Best Time to Visit</h2>
          <div className="bg-gray-800/50 rounded-2xl border border-white/10 overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
              {FEATURED_DESTINATIONS.map((dest) => (
                <div key={dest.slug} className="p-6 border-b border-r border-white/5 last:border-r-0">
                  <h3 className="text-white font-semibold mb-2">{dest.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>{dest.bestTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Sun className="w-4 h-4" />
                    <span>{dest.weather}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl p-12 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">Not sure where to go?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Let our AI travel assistant help you find the perfect destination based on your preferences, budget, and travel dates.
            </p>
            <Link
              href="/assistant"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-colors"
            >
              Chat with AI Assistant
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
