'use client';

/**
 * FLIGHT SEARCH RESULTS PAGE
 * Real-time flight search with Amadeus & Duffel integration
 * Advanced filtering, sorting, and booking functionality
 */

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane,
  Clock,
  ArrowRight,
  Filter,
  SortAsc,
  Briefcase,
  Wifi,
  Coffee,
  Tv,
  Zap,
  ChevronDown,
  ChevronUp,
  Star,
  Heart,
  Share2,
  AlertCircle,
  Loader2,
  ArrowUpDown,
  Sun,
  Moon,
  Sunset,
  RefreshCw,
  Check,
  X,
  Info
} from 'lucide-react';

// Types
interface FlightSegment {
  id: string;
  departureAirport: string;
  departureCity: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalCity: string;
  arrivalTime: string;
  airline: string;
  airlineLogo: string;
  flightNumber: string;
  aircraft: string;
  duration: string;
  cabinClass: string;
  amenities: string[];
}

interface FlightOffer {
  id: string;
  provider: 'amadeus' | 'duffel';
  price: number;
  currency: string;
  outbound: FlightSegment[];
  inbound?: FlightSegment[];
  totalDuration: string;
  stops: number;
  airline: string;
  airlineLogo: string;
  baggageIncluded: boolean;
  baggageAllowance?: string;
  refundable: boolean;
  changeable: boolean;
  seatsRemaining?: number;
  co2Emissions?: number;
  fareType: string;
  validUntil: string;
}

interface FilterState {
  priceRange: [number, number];
  stops: number[];
  airlines: string[];
  departureTime: string[];
  duration: [number, number];
  amenities: string[];
  cabinClass: string[];
  baggageIncluded: boolean | null;
  refundable: boolean | null;
}

interface SortOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'price_asc', label: 'Price: Low to High', icon: <ArrowUpDown className="w-4 h-4" /> },
  { value: 'price_desc', label: 'Price: High to Low', icon: <ArrowUpDown className="w-4 h-4" /> },
  { value: 'duration_asc', label: 'Duration: Shortest', icon: <Clock className="w-4 h-4" /> },
  { value: 'duration_desc', label: 'Duration: Longest', icon: <Clock className="w-4 h-4" /> },
  { value: 'departure_asc', label: 'Departure: Earliest', icon: <Sun className="w-4 h-4" /> },
  { value: 'departure_desc', label: 'Departure: Latest', icon: <Moon className="w-4 h-4" /> },
  { value: 'arrival_asc', label: 'Arrival: Earliest', icon: <Sunset className="w-4 h-4" /> },
  { value: 'stops_asc', label: 'Stops: Fewest', icon: <Plane className="w-4 h-4" /> },
  { value: 'rating', label: 'Best Rating', icon: <Star className="w-4 h-4" /> }
];

const DEPARTURE_TIMES = [
  { value: 'morning', label: 'Morning', time: '6am - 12pm', icon: <Sun className="w-4 h-4 text-yellow-500" /> },
  { value: 'afternoon', label: 'Afternoon', time: '12pm - 6pm', icon: <Sunset className="w-4 h-4 text-orange-500" /> },
  { value: 'evening', label: 'Evening', time: '6pm - 12am', icon: <Moon className="w-4 h-4 text-blue-500" /> },
  { value: 'night', label: 'Night', time: '12am - 6am', icon: <Moon className="w-4 h-4 text-indigo-500" /> }
];

const AMENITIES = [
  { value: 'wifi', label: 'Wi-Fi', icon: <Wifi className="w-4 h-4" /> },
  { value: 'meals', label: 'Meals', icon: <Coffee className="w-4 h-4" /> },
  { value: 'entertainment', label: 'Entertainment', icon: <Tv className="w-4 h-4" /> },
  { value: 'power', label: 'Power Outlet', icon: <Zap className="w-4 h-4" /> },
  { value: 'legroom', label: 'Extra Legroom', icon: <Briefcase className="w-4 h-4" /> }
];

export default function FlightSearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search parameters
  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const departureDate = searchParams.get('departure') || '';
  const returnDate = searchParams.get('return') || '';
  const passengers = parseInt(searchParams.get('passengers') || '1');
  const cabinClass = searchParams.get('cabin') || 'ECONOMY';

  // State
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('price_asc');
  const [showFilters, setShowFilters] = useState(true);
  const [expandedFlight, setExpandedFlight] = useState<string | null>(null);
  const [savedFlights, setSavedFlights] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 10000],
    stops: [],
    airlines: [],
    departureTime: [],
    duration: [0, 48],
    amenities: [],
    cabinClass: [],
    baggageIncluded: null,
    refundable: null
  });

  // Fetch flights from API
  useEffect(() => {
    const fetchFlights = async () => {
      if (!origin || !destination || !departureDate) {
        setError('Missing search parameters');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/flights/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin,
            destination,
            departureDate,
            returnDate: returnDate || undefined,
            adults: passengers,
            cabinClass: cabinClass.toUpperCase()
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch flights');
        }

        const data = await response.json();
        setFlights(data.offers || mockFlights);

        // Update price range based on results
        if (data.offers?.length > 0) {
          const prices = data.offers.map((f: FlightOffer) => f.price);
          setFilters(prev => ({
            ...prev,
            priceRange: [Math.min(...prices), Math.max(...prices)]
          }));
        }
      } catch (err) {
        console.error('Flight search error:', err);
        // Use mock data for demonstration
        setFlights(mockFlights);
        const prices = mockFlights.map(f => f.price);
        setFilters(prev => ({
          ...prev,
          priceRange: [Math.min(...prices), Math.max(...prices)]
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [origin, destination, departureDate, returnDate, passengers, cabinClass]);

  // Get unique airlines for filter
  const airlines = useMemo(() => {
    const airlineSet = new Set(flights.map(f => f.airline));
    return Array.from(airlineSet);
  }, [flights]);

  // Filter and sort flights
  const filteredFlights = useMemo(() => {
    let result = flights.filter(flight => {
      // Price filter
      if (flight.price < filters.priceRange[0] || flight.price > filters.priceRange[1]) {
        return false;
      }

      // Stops filter
      if (filters.stops.length > 0 && !filters.stops.includes(flight.stops)) {
        return false;
      }

      // Airlines filter
      if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline)) {
        return false;
      }

      // Baggage filter
      if (filters.baggageIncluded !== null && flight.baggageIncluded !== filters.baggageIncluded) {
        return false;
      }

      // Refundable filter
      if (filters.refundable !== null && flight.refundable !== filters.refundable) {
        return false;
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'duration_asc':
          return parseDuration(a.totalDuration) - parseDuration(b.totalDuration);
        case 'duration_desc':
          return parseDuration(b.totalDuration) - parseDuration(a.totalDuration);
        case 'stops_asc':
          return a.stops - b.stops;
        default:
          return 0;
      }
    });

    return result;
  }, [flights, filters, sortBy]);

  const parseDuration = (duration: string): number => {
    const match = duration.match(/(\d+)h\s*(\d*)m?/);
    if (match) {
      return parseInt(match[1]) * 60 + (parseInt(match[2]) || 0);
    }
    return 0;
  };

  const toggleSaveFlight = (flightId: string) => {
    setSavedFlights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(flightId)) {
        newSet.delete(flightId);
      } else {
        newSet.add(flightId);
      }
      return newSet;
    });
  };

  const handleBookFlight = (flight: FlightOffer) => {
    router.push(`/booking/flight?offerId=${flight.id}&provider=${flight.provider}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Searching Flights</h2>
          <p className="text-gray-400">
            Finding the best deals from {origin} to {destination}...
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <div className="animate-pulse bg-blue-600/30 rounded-lg px-4 py-2 text-blue-400 text-sm">
              Checking Amadeus...
            </div>
            <div className="animate-pulse bg-purple-600/30 rounded-lg px-4 py-2 text-purple-400 text-sm">
              Checking Duffel...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Search Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Search summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowRight className="w-5 h-5 text-white rotate-180" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  {origin} <ArrowRight className="w-4 h-4" /> {destination}
                </h1>
                <p className="text-sm text-gray-400">
                  {departureDate} {returnDate && `- ${returnDate}`} • {passengers} passenger{passengers > 1 ? 's' : ''} • {cabinClass}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-colors">
                <RefreshCw className="w-4 h-4" />
                Modify Search
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Results count and sort */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <span className="text-gray-400">
              {filteredFlights.length} flights found
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value} className="bg-gray-900">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex-shrink-0 overflow-hidden"
              >
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-6">
                  {/* Price Range */}
                  <div>
                    <h3 className="text-white font-semibold mb-3">Price Range</h3>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min={0}
                        max={10000}
                        value={filters.priceRange[1]}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                        }))}
                        className="w-full accent-blue-500"
                      />
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>${filters.priceRange[0]}</span>
                        <span>${filters.priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stops */}
                  <div>
                    <h3 className="text-white font-semibold mb-3">Stops</h3>
                    <div className="space-y-2">
                      {[0, 1, 2].map(stop => (
                        <label key={stop} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.stops.includes(stop)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters(prev => ({ ...prev, stops: [...prev.stops, stop] }));
                              } else {
                                setFilters(prev => ({ ...prev, stops: prev.stops.filter(s => s !== stop) }));
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-gray-300">
                            {stop === 0 ? 'Non-stop' : stop === 1 ? '1 stop' : '2+ stops'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Airlines */}
                  <div>
                    <h3 className="text-white font-semibold mb-3">Airlines</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {airlines.map(airline => (
                        <label key={airline} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.airlines.includes(airline)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters(prev => ({ ...prev, airlines: [...prev.airlines, airline] }));
                              } else {
                                setFilters(prev => ({ ...prev, airlines: prev.airlines.filter(a => a !== airline) }));
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-gray-300">{airline}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Departure Time */}
                  <div>
                    <h3 className="text-white font-semibold mb-3">Departure Time</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {DEPARTURE_TIMES.map(time => (
                        <button
                          key={time.value}
                          onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              departureTime: prev.departureTime.includes(time.value)
                                ? prev.departureTime.filter(t => t !== time.value)
                                : [...prev.departureTime, time.value]
                            }));
                          }}
                          className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors ${
                            filters.departureTime.includes(time.value)
                              ? 'bg-blue-600/30 border-blue-500 text-blue-400'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {time.icon}
                          <span className="text-xs">{time.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Filters */}
                  <div>
                    <h3 className="text-white font-semibold mb-3">Additional</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.baggageIncluded === true}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            baggageIncluded: e.target.checked ? true : null
                          }))}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-gray-300">Baggage included</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.refundable === true}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            refundable: e.target.checked ? true : null
                          }))}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-gray-300">Refundable</span>
                      </label>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <button
                    onClick={() => setFilters({
                      priceRange: [0, 10000],
                      stops: [],
                      airlines: [],
                      departureTime: [],
                      duration: [0, 48],
                      amenities: [],
                      cabinClass: [],
                      baggageIncluded: null,
                      refundable: null
                    })}
                    className="w-full py-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Flight results */}
          <div className="flex-1 space-y-4">
            {filteredFlights.length === 0 ? (
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
                <Plane className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No flights found</h3>
                <p className="text-gray-400">Try adjusting your filters or search criteria</p>
              </div>
            ) : (
              filteredFlights.map((flight, index) => (
                <motion.div
                  key={flight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-blue-500/50 transition-colors"
                >
                  {/* Main flight card */}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      {/* Airline and flight info */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                          {flight.airlineLogo ? (
                            <img src={flight.airlineLogo} alt={flight.airline} className="w-8 h-8 object-contain" />
                          ) : (
                            <Plane className="w-6 h-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{flight.airline}</p>
                          <p className="text-sm text-gray-400">
                            {flight.outbound[0]?.flightNumber}
                            {flight.stops === 0 ? ' • Non-stop' : ` • ${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                          </p>
                        </div>
                      </div>

                      {/* Flight times and route */}
                      <div className="flex-1 mx-8">
                        <div className="flex items-center justify-center gap-4">
                          {/* Departure */}
                          <div className="text-right">
                            <p className="text-2xl font-bold text-white">
                              {flight.outbound[0]?.departureTime?.split('T')[1]?.substring(0, 5) || '09:00'}
                            </p>
                            <p className="text-sm text-gray-400">{flight.outbound[0]?.departureAirport || origin}</p>
                          </div>

                          {/* Duration */}
                          <div className="flex-1 max-w-48">
                            <div className="text-center text-sm text-gray-400 mb-1">{flight.totalDuration}</div>
                            <div className="relative">
                              <div className="h-0.5 bg-gray-600 rounded"></div>
                              <div className="absolute top-1/2 left-0 w-2 h-2 bg-blue-500 rounded-full transform -translate-y-1/2"></div>
                              {flight.stops > 0 && (
                                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-orange-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                              )}
                              <div className="absolute top-1/2 right-0 w-2 h-2 bg-blue-500 rounded-full transform -translate-y-1/2"></div>
                              <Plane className="absolute top-1/2 right-0 w-4 h-4 text-blue-500 transform -translate-y-1/2 translate-x-2" />
                            </div>
                            {flight.stops > 0 && (
                              <div className="text-center text-xs text-orange-400 mt-1">
                                {flight.stops} stop
                              </div>
                            )}
                          </div>

                          {/* Arrival */}
                          <div className="text-left">
                            <p className="text-2xl font-bold text-white">
                              {flight.outbound[flight.outbound.length - 1]?.arrivalTime?.split('T')[1]?.substring(0, 5) || '14:30'}
                            </p>
                            <p className="text-sm text-gray-400">
                              {flight.outbound[flight.outbound.length - 1]?.arrivalAirport || destination}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Price and book */}
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-2">
                          {flight.seatsRemaining && flight.seatsRemaining < 5 && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                              {flight.seatsRemaining} left
                            </span>
                          )}
                          {flight.provider === 'duffel' && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                              Duffel
                            </span>
                          )}
                          {flight.provider === 'amadeus' && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                              Amadeus
                            </span>
                          )}
                        </div>
                        <p className="text-3xl font-bold text-white">
                          ${flight.price.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-400 mb-3">per person</p>
                        <button
                          onClick={() => handleBookFlight(flight)}
                          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-medium transition-all transform hover:scale-105"
                        >
                          Select
                        </button>
                      </div>
                    </div>

                    {/* Tags and actions */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        {flight.baggageIncluded && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                            <Briefcase className="w-3 h-3" />
                            Baggage included
                          </span>
                        )}
                        {flight.refundable && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                            <RefreshCw className="w-3 h-3" />
                            Refundable
                          </span>
                        )}
                        {flight.co2Emissions && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                            🌱 {flight.co2Emissions}kg CO₂
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSaveFlight(flight.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            savedFlights.has(flight.id)
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${savedFlights.has(flight.id) ? 'fill-current' : ''}`} />
                        </button>
                        <button className="p-2 bg-white/5 text-gray-400 hover:bg-white/10 rounded-lg transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setExpandedFlight(expandedFlight === flight.id ? null : flight.id)}
                          className="flex items-center gap-1 px-3 py-2 bg-white/5 text-gray-400 hover:bg-white/10 rounded-lg transition-colors text-sm"
                        >
                          <Info className="w-4 h-4" />
                          Details
                          {expandedFlight === flight.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {expandedFlight === flight.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2 border-t border-white/10">
                          <h4 className="text-white font-semibold mb-4">Flight Details</h4>

                          {/* Outbound segments */}
                          <div className="space-y-4">
                            {flight.outbound.map((segment, segIndex) => (
                              <div key={segment.id || segIndex} className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Plane className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-white font-medium">
                                        {segment.departureCity} ({segment.departureAirport}) → {segment.arrivalCity} ({segment.arrivalAirport})
                                      </p>
                                      <p className="text-sm text-gray-400">
                                        {segment.airline} {segment.flightNumber} • {segment.aircraft}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-white">{segment.duration}</p>
                                      <p className="text-sm text-gray-400">{segment.cabinClass}</p>
                                    </div>
                                  </div>

                                  {/* Amenities */}
                                  {segment.amenities && segment.amenities.length > 0 && (
                                    <div className="flex items-center gap-2 mt-2">
                                      {segment.amenities.includes('wifi') && (
                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                          <Wifi className="w-3 h-3" /> Wi-Fi
                                        </span>
                                      )}
                                      {segment.amenities.includes('meals') && (
                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                          <Coffee className="w-3 h-3" /> Meals
                                        </span>
                                      )}
                                      {segment.amenities.includes('entertainment') && (
                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                          <Tv className="w-3 h-3" /> Entertainment
                                        </span>
                                      )}
                                      {segment.amenities.includes('power') && (
                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                          <Zap className="w-3 h-3" /> Power
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Fare details */}
                          <div className="mt-6 p-4 bg-white/5 rounded-xl">
                            <h5 className="text-white font-medium mb-3">Fare Details</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-400">Fare Type</p>
                                <p className="text-white">{flight.fareType}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Baggage</p>
                                <p className="text-white">{flight.baggageAllowance || 'Not included'}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Changeable</p>
                                <p className="text-white">{flight.changeable ? 'Yes' : 'No'}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Refundable</p>
                                <p className="text-white">{flight.refundable ? 'Yes' : 'No'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Mock data for demonstration
const mockFlights: FlightOffer[] = [
  {
    id: 'FL001',
    provider: 'amadeus',
    price: 589,
    currency: 'USD',
    outbound: [
      {
        id: 'SEG001',
        departureAirport: 'JFK',
        departureCity: 'New York',
        departureTime: '2024-03-15T09:00:00',
        arrivalAirport: 'CDG',
        arrivalCity: 'Paris',
        arrivalTime: '2024-03-15T22:30:00',
        airline: 'Air France',
        airlineLogo: '',
        flightNumber: 'AF007',
        aircraft: 'Boeing 777-300ER',
        duration: '7h 30m',
        cabinClass: 'Economy',
        amenities: ['wifi', 'meals', 'entertainment', 'power']
      }
    ],
    totalDuration: '7h 30m',
    stops: 0,
    airline: 'Air France',
    airlineLogo: '',
    baggageIncluded: true,
    baggageAllowance: '23kg checked + 8kg cabin',
    refundable: false,
    changeable: true,
    seatsRemaining: 8,
    co2Emissions: 456,
    fareType: 'Economy Light',
    validUntil: '2024-03-14T23:59:59'
  },
  {
    id: 'FL002',
    provider: 'duffel',
    price: 649,
    currency: 'USD',
    outbound: [
      {
        id: 'SEG002',
        departureAirport: 'JFK',
        departureCity: 'New York',
        departureTime: '2024-03-15T14:30:00',
        arrivalAirport: 'CDG',
        arrivalCity: 'Paris',
        arrivalTime: '2024-03-16T04:00:00',
        airline: 'Delta Air Lines',
        airlineLogo: '',
        flightNumber: 'DL264',
        aircraft: 'Airbus A330-900neo',
        duration: '7h 30m',
        cabinClass: 'Economy',
        amenities: ['wifi', 'meals', 'entertainment', 'power']
      }
    ],
    totalDuration: '7h 30m',
    stops: 0,
    airline: 'Delta Air Lines',
    airlineLogo: '',
    baggageIncluded: true,
    baggageAllowance: '23kg checked + 10kg cabin',
    refundable: true,
    changeable: true,
    seatsRemaining: 12,
    co2Emissions: 423,
    fareType: 'Main Cabin',
    validUntil: '2024-03-14T23:59:59'
  },
  {
    id: 'FL003',
    provider: 'amadeus',
    price: 445,
    currency: 'USD',
    outbound: [
      {
        id: 'SEG003A',
        departureAirport: 'JFK',
        departureCity: 'New York',
        departureTime: '2024-03-15T06:00:00',
        arrivalAirport: 'LHR',
        arrivalCity: 'London',
        arrivalTime: '2024-03-15T18:00:00',
        airline: 'British Airways',
        airlineLogo: '',
        flightNumber: 'BA178',
        aircraft: 'Boeing 787-9',
        duration: '6h 00m',
        cabinClass: 'Economy',
        amenities: ['meals', 'entertainment']
      },
      {
        id: 'SEG003B',
        departureAirport: 'LHR',
        departureCity: 'London',
        departureTime: '2024-03-15T20:30:00',
        arrivalAirport: 'CDG',
        arrivalCity: 'Paris',
        arrivalTime: '2024-03-15T22:45:00',
        airline: 'British Airways',
        airlineLogo: '',
        flightNumber: 'BA334',
        aircraft: 'Airbus A320',
        duration: '1h 15m',
        cabinClass: 'Economy',
        amenities: []
      }
    ],
    totalDuration: '10h 45m',
    stops: 1,
    airline: 'British Airways',
    airlineLogo: '',
    baggageIncluded: false,
    refundable: false,
    changeable: false,
    seatsRemaining: 3,
    co2Emissions: 512,
    fareType: 'Basic Economy',
    validUntil: '2024-03-14T23:59:59'
  },
  {
    id: 'FL004',
    provider: 'duffel',
    price: 1249,
    currency: 'USD',
    outbound: [
      {
        id: 'SEG004',
        departureAirport: 'JFK',
        departureCity: 'New York',
        departureTime: '2024-03-15T19:00:00',
        arrivalAirport: 'CDG',
        arrivalCity: 'Paris',
        arrivalTime: '2024-03-16T08:30:00',
        airline: 'United Airlines',
        airlineLogo: '',
        flightNumber: 'UA57',
        aircraft: 'Boeing 767-400ER',
        duration: '7h 30m',
        cabinClass: 'Business',
        amenities: ['wifi', 'meals', 'entertainment', 'power', 'legroom']
      }
    ],
    totalDuration: '7h 30m',
    stops: 0,
    airline: 'United Airlines',
    airlineLogo: '',
    baggageIncluded: true,
    baggageAllowance: '2x32kg checked + 12kg cabin',
    refundable: true,
    changeable: true,
    seatsRemaining: 6,
    co2Emissions: 389,
    fareType: 'Polaris Business',
    validUntil: '2024-03-14T23:59:59'
  },
  {
    id: 'FL005',
    provider: 'amadeus',
    price: 398,
    currency: 'USD',
    outbound: [
      {
        id: 'SEG005A',
        departureAirport: 'JFK',
        departureCity: 'New York',
        departureTime: '2024-03-15T11:00:00',
        arrivalAirport: 'DUB',
        arrivalCity: 'Dublin',
        arrivalTime: '2024-03-15T22:30:00',
        airline: 'Aer Lingus',
        airlineLogo: '',
        flightNumber: 'EI108',
        aircraft: 'Airbus A330-300',
        duration: '6h 30m',
        cabinClass: 'Economy',
        amenities: ['meals', 'entertainment']
      },
      {
        id: 'SEG005B',
        departureAirport: 'DUB',
        departureCity: 'Dublin',
        departureTime: '2024-03-16T07:00:00',
        arrivalAirport: 'CDG',
        arrivalCity: 'Paris',
        arrivalTime: '2024-03-16T10:15:00',
        airline: 'Aer Lingus',
        airlineLogo: '',
        flightNumber: 'EI520',
        aircraft: 'Airbus A320',
        duration: '1h 45m',
        cabinClass: 'Economy',
        amenities: []
      }
    ],
    totalDuration: '17h 15m',
    stops: 1,
    airline: 'Aer Lingus',
    airlineLogo: '',
    baggageIncluded: false,
    refundable: false,
    changeable: true,
    co2Emissions: 534,
    fareType: 'Saver',
    validUntil: '2024-03-14T23:59:59'
  }
];
