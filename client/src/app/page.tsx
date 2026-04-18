'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Plane,
  Building2,
  Package,
  Car,
  Sparkles,
  Globe,
  Shield,
  Trophy,
  ChevronRight,
  Star,
  MapPin,
  Search,
  Calendar,
  Users,
  ArrowRight
} from 'lucide-react';

export default function HomePage() {
  const [searchType, setSearchType] = useState<'flights' | 'hotels' | 'packages'>('flights');
  const [showAIChat, setShowAIChat] = useState(false);

  // Flight search state
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);

  // Hotel search state
  const [hotelDestination, setHotelDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);

  const handleFlightSearch = () => {
    const params = new URLSearchParams({
      origin,
      destination,
      departureDate,
      ...(returnDate && { returnDate }),
      passengers: passengers.toString()
    });
    window.location.href = `/flights/search?${params}`;
  };

  const handleHotelSearch = () => {
    const params = new URLSearchParams({
      destination: hotelDestination,
      checkIn,
      checkOut,
      rooms: rooms.toString(),
      guests: guests.toString()
    });
    window.location.href = `/hotels/search?${params}`;
  };

  const deals = [
    { city: 'Paris', country: 'France', price: 299, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400', discount: 35 },
    { city: 'Tokyo', country: 'Japan', price: 599, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', discount: 25 },
    { city: 'New York', country: 'USA', price: 199, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400', discount: 40 },
    { city: 'Bali', country: 'Indonesia', price: 449, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400', discount: 30 },
  ];

  const destinations = [
    { name: 'Maldives', type: 'Beach Paradise', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600', rating: 4.9 },
    { name: 'Santorini', type: 'Greek Islands', image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600', rating: 4.8 },
    { name: 'Dubai', type: 'Luxury City', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600', rating: 4.7 },
    { name: 'Swiss Alps', type: 'Mountain Adventure', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600', rating: 4.9 },
    { name: 'Rome', type: 'Historical City', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600', rating: 4.8 },
    { name: 'Cancun', type: 'Beach Resort', image: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=600', rating: 4.6 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/70 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Skyward
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/flights" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
              <Plane className="w-4 h-4" /> Flights
            </Link>
            <Link href="/hotels" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
              <Building2 className="w-4 h-4" /> Hotels
            </Link>
            <Link href="/packages" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
              <Package className="w-4 h-4" /> Packages
            </Link>
            <Link href="/cars" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
              <Car className="w-4 h-4" /> Cars
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold hover:scale-105 transition-transform text-white"
            >
              Join Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-8 px-6 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">AI-Powered Travel Planning</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-white">Discover Your</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Dream Destination
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Search 500+ airlines, 1M+ hotels, and endless vacation packages.
              Best prices guaranteed with AI-powered recommendations.
            </p>

            {/* AI Chat Button */}
            <button
              onClick={() => setShowAIChat(true)}
              className="mb-10 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition"
            >
              <Sparkles className="w-5 h-5" />
              Ask AI: "Beach vacation under $1000"
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-700 p-6 shadow-2xl">
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                {[
                  { id: 'flights', icon: Plane, label: 'Flights' },
                  { id: 'hotels', icon: Building2, label: 'Hotels' },
                  { id: 'packages', icon: Package, label: 'Packages' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSearchType(tab.id as any)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition ${
                      searchType === tab.id
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Flight Search */}
              {searchType === 'flights' && (
                <div className="grid md:grid-cols-5 gap-4">
                  <div className="relative">
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <input
                      type="text"
                      placeholder="City or Airport"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <input
                      type="text"
                      placeholder="City or Airport"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Departure</label>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Return</label>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Travelers</label>
                    <select
                      value={passengers}
                      onChange={(e) => setPassengers(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    >
                      {[1,2,3,4,5,6,7,8,9].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Hotel Search */}
              {searchType === 'hotels' && (
                <div className="grid md:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Destination</label>
                    <input
                      type="text"
                      placeholder="City, hotel, or landmark"
                      value={hotelDestination}
                      onChange={(e) => setHotelDestination(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Check-in</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Check-out</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Guests</label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    >
                      {[1,2,3,4,5,6].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Package Search - Same as flights for now */}
              {searchType === 'packages' && (
                <div className="grid md:grid-cols-5 gap-4">
                  <div className="relative">
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <input
                      type="text"
                      placeholder="Departure city"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <input
                      type="text"
                      placeholder="Destination"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Departure</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Return</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Travelers</label>
                    <select className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500">
                      <option>2 Adults</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Search Button */}
              <button
                onClick={searchType === 'flights' ? handleFlightSearch : handleHotelSearch}
                className="mt-6 w-full md:w-auto md:px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search {searchType.charAt(0).toUpperCase() + searchType.slice(1)}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Globe, title: '500+ Airlines', desc: 'Compare prices worldwide' },
              { icon: Building2, title: '1M+ Hotels', desc: 'Best rates guaranteed' },
              { icon: Shield, title: 'Price Match', desc: "We'll beat any price" },
              { icon: Trophy, title: 'Earn Rewards', desc: 'Points on every booking' }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl hover:border-slate-600 transition group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Deals Section */}
      <section className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Today's Best Deals</h2>
              <p className="text-gray-400">Limited-time offers on popular destinations</p>
            </div>
            <Link href="/deals" className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
              View all <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {deals.map((deal, i) => (
              <motion.div
                key={deal.city}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl mb-3">
                  <img
                    src={deal.image}
                    alt={deal.city}
                    className="w-full h-48 object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
                    -{deal.discount}%
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white">{deal.city}</h3>
                <p className="text-gray-400 text-sm mb-1">{deal.country}</p>
                <p className="text-blue-400 font-semibold">From ${deal.price}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Popular Destinations
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Explore trending destinations loved by travelers worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {destinations.map((dest, i) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-medium">{dest.rating}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">{dest.name}</h3>
                    <p className="text-gray-300">{dest.type}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Loved by Travelers</h2>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-gray-400">4.9/5 based on 50,000+ reviews</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah M.', loc: 'New York', text: 'Found an amazing deal to Maldives. Saved over $800!' },
              { name: 'James L.', loc: 'London', text: 'The AI assistant helped me plan the perfect family trip.' },
              { name: 'Maria G.', loc: 'Barcelona', text: 'Best travel platform. The rewards program is incredible.' }
            ].map((review, i) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{review.name}</p>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {review.loc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-slate-700"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Explore?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join millions of travelers. Sign up now and get 500 bonus points!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
              >
                Create Free Account
              </Link>
              <button
                onClick={() => setShowAIChat(true)}
                className="w-full sm:w-auto px-8 py-4 border border-slate-600 text-white rounded-xl font-semibold hover:bg-slate-800 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Try AI Assistant
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Plane className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Skyward</span>
              </Link>
              <p className="text-gray-400 text-sm">
                Your trusted partner for seamless travel experiences worldwide.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/flights" className="hover:text-white">Flights</Link></li>
                <li><Link href="/hotels" className="hover:text-white">Hotels</Link></li>
                <li><Link href="/packages" className="hover:text-white">Packages</Link></li>
                <li><Link href="/cars" className="hover:text-white">Car Rentals</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQs</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Skyward Travels. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* AI Chat Modal */}
      {showAIChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl mx-4 bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="font-semibold text-white">AI Travel Assistant</span>
              </div>
              <button
                onClick={() => setShowAIChat(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="h-96 p-4 overflow-y-auto">
              <div className="bg-slate-800 rounded-lg p-4 mb-4">
                <p className="text-gray-300">
                  Hi! I'm your AI travel assistant. Tell me what kind of trip you're looking for.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Try: "I want a romantic beach getaway in March under $2000"
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Describe your dream trip..."
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium">
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
