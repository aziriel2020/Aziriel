'use client';

/**
 * DEALS & OFFERS PAGE
 * Current promotions, flash sales, and special offers
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Tag,
  Plane,
  Hotel,
  Clock,
  Percent,
  Star,
  MapPin,
  Calendar,
  ArrowRight,
  Filter,
  TrendingDown,
  Zap,
  Gift,
  Bell,
  ChevronRight
} from 'lucide-react';

const FLASH_DEALS = [
  {
    id: 'flash-1',
    type: 'flight',
    title: 'Paris Flash Sale',
    from: 'New York (JFK)',
    to: 'Paris (CDG)',
    originalPrice: 892,
    salePrice: 449,
    discount: 50,
    airline: 'Air France',
    dates: 'Jan 15 - Mar 31, 2025',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
    expiresIn: 7200, // seconds
    seatsLeft: 12
  },
  {
    id: 'flash-2',
    type: 'hotel',
    title: 'Maldives Luxury Escape',
    destination: 'Maldives',
    hotelName: 'Paradise Island Resort',
    originalPrice: 650,
    salePrice: 389,
    discount: 40,
    rating: 4.9,
    dates: 'Book by Dec 31',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600',
    expiresIn: 14400,
    roomsLeft: 5
  },
  {
    id: 'flash-3',
    type: 'flight',
    title: 'Tokyo Adventure',
    from: 'Los Angeles (LAX)',
    to: 'Tokyo (NRT)',
    originalPrice: 1450,
    salePrice: 799,
    discount: 45,
    airline: 'Japan Airlines',
    dates: 'Feb 1 - Apr 30, 2025',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600',
    expiresIn: 21600,
    seatsLeft: 8
  }
];

const FEATURED_DEALS = [
  {
    id: 'deal-1',
    type: 'package',
    title: 'Rome City Break',
    description: 'Flight + 4* Hotel + Breakfast',
    destination: 'Rome, Italy',
    originalPrice: 1299,
    salePrice: 899,
    discount: 31,
    duration: '4 nights',
    includes: ['Round-trip flight', '4-star central hotel', 'Daily breakfast', 'Airport transfer'],
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600',
    rating: 4.7,
    reviews: 234
  },
  {
    id: 'deal-2',
    type: 'package',
    title: 'Barcelona Beach Getaway',
    description: 'Flight + Beachfront Hotel + Tours',
    destination: 'Barcelona, Spain',
    originalPrice: 1599,
    salePrice: 1099,
    discount: 31,
    duration: '5 nights',
    includes: ['Round-trip flight', 'Beachfront hotel', 'City tour', 'Sagrada Familia tickets'],
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600',
    rating: 4.8,
    reviews: 456
  },
  {
    id: 'deal-3',
    type: 'package',
    title: 'Dubai Luxury Experience',
    description: 'Flight + 5* Hotel + Desert Safari',
    destination: 'Dubai, UAE',
    originalPrice: 2499,
    salePrice: 1799,
    discount: 28,
    duration: '6 nights',
    includes: ['Business class option', '5-star hotel', 'Desert safari', 'Burj Khalifa tickets'],
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600',
    rating: 4.9,
    reviews: 567
  }
];

const FLIGHT_DEALS = [
  { from: 'NYC', to: 'London', price: 399, originalPrice: 650, airline: 'British Airways' },
  { from: 'LA', to: 'Sydney', price: 899, originalPrice: 1400, airline: 'Qantas' },
  { from: 'Chicago', to: 'Cancun', price: 249, originalPrice: 450, airline: 'United' },
  { from: 'Miami', to: 'Bahamas', price: 149, originalPrice: 299, airline: 'American' },
  { from: 'Seattle', to: 'Hawaii', price: 299, originalPrice: 550, airline: 'Hawaiian' },
  { from: 'Boston', to: 'Dublin', price: 449, originalPrice: 750, airline: 'Aer Lingus' }
];

const HOTEL_DEALS = [
  { name: 'The Ritz Paris', location: 'Paris', price: 450, originalPrice: 800, rating: 4.9 },
  { name: 'Aman Tokyo', location: 'Tokyo', price: 550, originalPrice: 950, rating: 4.9 },
  { name: 'Marina Bay Sands', location: 'Singapore', price: 380, originalPrice: 600, rating: 4.8 },
  { name: 'Burj Al Arab', location: 'Dubai', price: 1200, originalPrice: 2000, rating: 4.9 },
  { name: 'Atlantis Resort', location: 'Bahamas', price: 350, originalPrice: 550, rating: 4.7 },
  { name: 'Four Seasons Bali', location: 'Bali', price: 420, originalPrice: 700, rating: 4.8 }
];

function CountdownTimer({ seconds }: { seconds: number }) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const secs = timeLeft % 60;

  return (
    <div className="flex items-center gap-1 text-orange-400">
      <Clock className="w-4 h-4" />
      <span className="font-mono">
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
    </div>
  );
}

export default function DealsPage() {
  const [filter, setFilter] = useState<'all' | 'flights' | 'hotels' | 'packages'>('all');

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600/20 via-red-600/20 to-pink-600/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-full text-orange-400 mb-4">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">Limited Time Offers</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Incredible Travel Deals
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Save up to 50% on flights, hotels, and vacation packages. Book now before they're gone!
            </p>
            <Link
              href="/alerts"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
            >
              <Bell className="w-5 h-5" />
              Get Price Alerts
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Flash Deals */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Flash Deals</h2>
            <span className="text-gray-400">Ending Soon!</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FLASH_DEALS.map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-2xl overflow-hidden border border-orange-500/30 hover:border-orange-500/50 transition-all group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 rounded-full text-white font-bold text-sm">
                    -{deal.discount}%
                  </div>
                  <div className="absolute top-4 right-4">
                    <CountdownTimer seconds={deal.expiresIn} />
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    {deal.type === 'flight' ? <Plane className="w-4 h-4" /> : <Hotel className="w-4 h-4" />}
                    <span className="capitalize">{deal.type}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{deal.title}</h3>

                  {deal.type === 'flight' ? (
                    <p className="text-gray-400 text-sm mb-3">{deal.from} → {deal.to}</p>
                  ) : (
                    <p className="text-gray-400 text-sm mb-3">{deal.hotelName}</p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-gray-500 line-through text-sm">${deal.originalPrice}</span>
                      <span className="text-2xl font-bold text-white ml-2">${deal.salePrice}</span>
                    </div>
                    <span className="text-orange-400 text-sm">
                      {deal.type === 'flight' ? `${deal.seatsLeft} seats left` : `${deal.roomsLeft} rooms left`}
                    </span>
                  </div>

                  <Link
                    href={deal.type === 'flight' ? '/flights/search' : '/hotels/search'}
                    className="block w-full py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-semibold text-center transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8">
          {['all', 'flights', 'hotels', 'packages'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-5 py-2 rounded-xl font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Featured Package Deals */}
        {(filter === 'all' || filter === 'packages') && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Gift className="w-6 h-6 text-purple-400" />
                Featured Packages
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURED_DEALS.map((deal, index) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={deal.image} alt={deal.title} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-purple-500 rounded-full text-white font-bold text-sm">
                      Save {deal.discount}%
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">{deal.destination}</span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1">{deal.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{deal.description}</p>

                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">{deal.duration}</span>
                      <span className="mx-2 text-gray-600">•</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white">{deal.rating}</span>
                      <span className="text-gray-500 text-sm">({deal.reviews})</span>
                    </div>

                    <ul className="space-y-1 mb-4">
                      {deal.includes.slice(0, 3).map((item, i) => (
                        <li key={i} className="text-gray-400 text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div>
                        <span className="text-gray-500 line-through text-sm">${deal.originalPrice}</span>
                        <p className="text-2xl font-bold text-white">${deal.salePrice}</p>
                        <span className="text-gray-500 text-xs">per person</span>
                      </div>
                      <Link
                        href="/booking/flight"
                        className="px-5 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl text-white font-semibold transition-colors"
                      >
                        View Deal
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Flight Deals */}
        {(filter === 'all' || filter === 'flights') && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Plane className="w-6 h-6 text-blue-400" />
                Flight Deals
              </h2>
              <Link href="/flights/search" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FLIGHT_DEALS.map((deal, index) => (
                <Link
                  key={index}
                  href="/flights/search"
                  className="bg-gray-800/50 rounded-xl p-5 border border-white/10 hover:border-blue-500/50 transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-semibold text-lg">{deal.from} → {deal.to}</p>
                    <p className="text-gray-400 text-sm">{deal.airline}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 line-through text-sm">${deal.originalPrice}</p>
                    <p className="text-xl font-bold text-white">${deal.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Hotel Deals */}
        {(filter === 'all' || filter === 'hotels') && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Hotel className="w-6 h-6 text-purple-400" />
                Hotel Deals
              </h2>
              <Link href="/hotels/search" className="text-purple-400 hover:text-purple-300 flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {HOTEL_DEALS.map((deal, index) => (
                <Link
                  key={index}
                  href="/hotels/search"
                  className="bg-gray-800/50 rounded-xl p-5 border border-white/10 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-semibold">{deal.name}</p>
                      <p className="text-gray-400 text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {deal.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-blue-500/20 px-2 py-0.5 rounded">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-white text-sm">{deal.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-gray-500 line-through text-sm">${deal.originalPrice}</span>
                    <div>
                      <span className="text-xl font-bold text-white">${deal.price}</span>
                      <span className="text-gray-500 text-sm">/night</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Newsletter CTA */}
        <section className="text-center py-16">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl p-12 border border-white/10">
            <Bell className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Never Miss a Deal</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Set up price alerts and get notified when prices drop for your favorite destinations.
            </p>
            <Link
              href="/alerts"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-colors"
            >
              Create Price Alert
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
