'use client';

/**
 * FLIGHT DETAIL PAGE
 * Full flight information with fare rules, baggage, seat selection
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Plane,
  Clock,
  Luggage,
  Wifi,
  Utensils,
  Monitor,
  Plug,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  AlertCircle,
  Info,
  Calendar,
  Users,
  ArrowRight,
  Shield,
  CreditCard,
  Briefcase,
  ShoppingBag,
  Baby,
  Heart,
  Share2,
  RefreshCw
} from 'lucide-react';

// Demo flight data
const DEMO_FLIGHT = {
  id: 'flight-1',
  provider: 'amadeus',
  airline: {
    code: 'AF',
    name: 'Air France',
    logo: 'https://logos-world.net/wp-content/uploads/2023/01/Air-France-Logo.png',
    alliance: 'SkyTeam'
  },
  price: {
    amount: 487,
    currency: 'USD',
    breakdown: {
      baseFare: 398,
      taxes: 67,
      fees: 22
    }
  },
  originalPrice: 612,
  outbound: {
    date: '2024-12-15',
    segments: [
      {
        departure: {
          airport: 'JFK',
          airportName: 'John F. Kennedy International',
          city: 'New York',
          terminal: '1',
          time: '18:30',
          date: '2024-12-15'
        },
        arrival: {
          airport: 'CDG',
          airportName: 'Charles de Gaulle Airport',
          city: 'Paris',
          terminal: '2E',
          time: '07:45',
          date: '2024-12-16'
        },
        airline: { code: 'AF', name: 'Air France', flightNumber: 'AF007' },
        duration: 435, // 7h 15m
        aircraft: 'Boeing 777-300ER',
        cabinClass: 'Economy',
        amenities: ['wifi', 'entertainment', 'meals', 'power']
      }
    ],
    totalDuration: 435,
    stops: 0
  },
  inbound: {
    date: '2024-12-22',
    segments: [
      {
        departure: {
          airport: 'CDG',
          airportName: 'Charles de Gaulle Airport',
          city: 'Paris',
          terminal: '2E',
          time: '10:15',
          date: '2024-12-22'
        },
        arrival: {
          airport: 'JFK',
          airportName: 'John F. Kennedy International',
          city: 'New York',
          terminal: '1',
          time: '13:30',
          date: '2024-12-22'
        },
        airline: { code: 'AF', name: 'Air France', flightNumber: 'AF008' },
        duration: 495, // 8h 15m
        aircraft: 'Airbus A350-900',
        cabinClass: 'Economy',
        amenities: ['wifi', 'entertainment', 'meals', 'power']
      }
    ],
    totalDuration: 495,
    stops: 0
  },
  cabinClass: 'Economy',
  fareFamily: 'Economy Standard',
  seatsAvailable: 7,
  baggage: {
    cabin: {
      included: true,
      pieces: 1,
      weight: '12 kg',
      dimensions: '55 x 35 x 25 cm'
    },
    checked: {
      included: true,
      pieces: 1,
      weight: '23 kg',
      extraBagPrice: 75
    }
  },
  fareRules: {
    refundable: false,
    changeable: true,
    changeFeeBefore: 150,
    changeFeeAfter: 250,
    cancellationDeadline: '24 hours before departure',
    noShow: 'Full fare forfeited'
  },
  extras: [
    { id: 'seat', name: 'Seat Selection', price: 35, description: 'Choose your preferred seat' },
    { id: 'meal', name: 'Premium Meal', price: 25, description: 'Upgrade to gourmet dining' },
    { id: 'lounge', name: 'Lounge Access', price: 50, description: 'Relax before your flight' },
    { id: 'priority', name: 'Priority Boarding', price: 15, description: 'Board first' },
    { id: 'insurance', name: 'Travel Insurance', price: 39, description: 'Full coverage protection' }
  ],
  co2: {
    outbound: 456, // kg
    inbound: 478,
    offset: 12
  }
};

const FARE_FAMILIES = [
  {
    name: 'Light',
    price: 412,
    features: {
      cabin: true,
      checked: false,
      seatSelection: false,
      changes: false,
      refund: false,
      priority: false,
      lounge: false,
      miles: '50%'
    }
  },
  {
    name: 'Standard',
    price: 487,
    selected: true,
    features: {
      cabin: true,
      checked: true,
      seatSelection: true,
      changes: true,
      refund: false,
      priority: false,
      lounge: false,
      miles: '100%'
    }
  },
  {
    name: 'Flex',
    price: 698,
    features: {
      cabin: true,
      checked: true,
      seatSelection: true,
      changes: true,
      refund: true,
      priority: true,
      lounge: false,
      miles: '150%'
    }
  },
  {
    name: 'Business',
    price: 2450,
    features: {
      cabin: true,
      checked: true,
      seatSelection: true,
      changes: true,
      refund: true,
      priority: true,
      lounge: true,
      miles: '200%'
    }
  }
];

const AMENITY_ICONS: Record<string, any> = {
  wifi: Wifi,
  entertainment: Monitor,
  meals: Utensils,
  power: Plug
};

export default function FlightDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [flight, setFlight] = useState(DEMO_FLIGHT);
  const [loading, setLoading] = useState(false);
  const [selectedFare, setSelectedFare] = useState('Standard');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [showFareDetails, setShowFareDetails] = useState(false);
  const [saved, setSaved] = useState(false);

  const passengers = parseInt(searchParams.get('passengers') || '1');

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (time: string) => time;

  const selectedFareData = FARE_FAMILIES.find(f => f.name === selectedFare);
  const extrasTotal = selectedExtras.reduce((sum, extraId) => {
    const extra = flight.extras.find(e => e.id === extraId);
    return sum + (extra?.price || 0);
  }, 0);

  const totalPrice = (selectedFareData?.price || flight.price.amount) * passengers + extrasTotal;

  const handleBook = () => {
    router.push(`/booking/flight?flightId=${flight.id}&fare=${selectedFare}&passengers=${passengers}&extras=${selectedExtras.join(',')}`);
  };

  const toggleExtra = (extraId: string) => {
    setSelectedExtras(prev =>
      prev.includes(extraId)
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/flights/search" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
              Back to results
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSaved(!saved)}
                className={`p-2 rounded-lg transition-colors ${saved ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-gray-400 hover:text-white'}`}
              >
                <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flight Summary */}
            <div className="bg-gray-800/50 rounded-2xl border border-white/10 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2">
                  <img src={flight.airline.logo} alt={flight.airline.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{flight.airline.name}</h1>
                  <p className="text-gray-400">{flight.fareFamily} • {flight.airline.alliance} Member</p>
                </div>
                {flight.seatsAvailable <= 5 && (
                  <span className="ml-auto px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">
                    Only {flight.seatsAvailable} seats left
                  </span>
                )}
              </div>

              {/* Outbound Flight */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Plane className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Outbound</h2>
                  <span className="text-gray-400">• {new Date(flight.outbound.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>

                {flight.outbound.segments.map((segment, index) => (
                  <div key={index} className="bg-gray-700/30 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                      {/* Departure */}
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">{formatTime(segment.departure.time)}</p>
                        <p className="text-lg text-white">{segment.departure.airport}</p>
                        <p className="text-sm text-gray-400">{segment.departure.city}</p>
                        <p className="text-xs text-gray-500">Terminal {segment.departure.terminal}</p>
                      </div>

                      {/* Flight Path */}
                      <div className="flex-1 px-8">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">{formatDuration(segment.duration)}</span>
                        </div>
                        <div className="relative">
                          <div className="h-0.5 bg-gray-600 w-full" />
                          <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 rotate-90" />
                        </div>
                        <div className="text-center mt-2">
                          <span className="text-green-400 text-sm">Direct</span>
                        </div>
                      </div>

                      {/* Arrival */}
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">{formatTime(segment.arrival.time)}</p>
                        <p className="text-lg text-white">{segment.arrival.airport}</p>
                        <p className="text-sm text-gray-400">{segment.arrival.city}</p>
                        <p className="text-xs text-gray-500">Terminal {segment.arrival.terminal}</p>
                        {segment.departure.date !== segment.arrival.date && (
                          <span className="text-orange-400 text-xs">+1 day</span>
                        )}
                      </div>
                    </div>

                    {/* Flight Details */}
                    <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <span>{segment.airline.flightNumber}</span>
                      <span>•</span>
                      <span>{segment.aircraft}</span>
                      <span>•</span>
                      <span>{segment.cabinClass}</span>
                      <div className="flex items-center gap-3 ml-auto">
                        {segment.amenities.map((amenity) => {
                          const Icon = AMENITY_ICONS[amenity];
                          return Icon ? <Icon key={amenity} className="w-4 h-4" title={amenity} /> : null;
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inbound Flight */}
              {flight.inbound && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Plane className="w-5 h-5 text-purple-400 rotate-180" />
                    <h2 className="text-lg font-semibold text-white">Return</h2>
                    <span className="text-gray-400">• {new Date(flight.inbound.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                  </div>

                  {flight.inbound.segments.map((segment, index) => (
                    <div key={index} className="bg-gray-700/30 rounded-xl p-5">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-white">{formatTime(segment.departure.time)}</p>
                          <p className="text-lg text-white">{segment.departure.airport}</p>
                          <p className="text-sm text-gray-400">{segment.departure.city}</p>
                          <p className="text-xs text-gray-500">Terminal {segment.departure.terminal}</p>
                        </div>

                        <div className="flex-1 px-8">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">{formatDuration(segment.duration)}</span>
                          </div>
                          <div className="relative">
                            <div className="h-0.5 bg-gray-600 w-full" />
                            <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 -rotate-90" />
                          </div>
                          <div className="text-center mt-2">
                            <span className="text-green-400 text-sm">Direct</span>
                          </div>
                        </div>

                        <div className="text-center">
                          <p className="text-3xl font-bold text-white">{formatTime(segment.arrival.time)}</p>
                          <p className="text-lg text-white">{segment.arrival.airport}</p>
                          <p className="text-sm text-gray-400">{segment.arrival.city}</p>
                          <p className="text-xs text-gray-500">Terminal {segment.arrival.terminal}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <span>{segment.airline.flightNumber}</span>
                        <span>•</span>
                        <span>{segment.aircraft}</span>
                        <span>•</span>
                        <span>{segment.cabinClass}</span>
                        <div className="flex items-center gap-3 ml-auto">
                          {segment.amenities.map((amenity) => {
                            const Icon = AMENITY_ICONS[amenity];
                            return Icon ? <Icon key={amenity} className="w-4 h-4" title={amenity} /> : null;
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fare Families */}
            <div className="bg-gray-800/50 rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Choose Your Fare</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {FARE_FAMILIES.map((fare) => (
                  <div
                    key={fare.name}
                    onClick={() => setSelectedFare(fare.name)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedFare === fare.name
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <h3 className="text-lg font-semibold text-white mb-1">{fare.name}</h3>
                    <p className="text-2xl font-bold text-white mb-3">${fare.price}</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        {fare.features.cabin ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-gray-600" />}
                        <span className={fare.features.cabin ? 'text-gray-300' : 'text-gray-600'}>Cabin bag</span>
                      </li>
                      <li className="flex items-center gap-2">
                        {fare.features.checked ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-gray-600" />}
                        <span className={fare.features.checked ? 'text-gray-300' : 'text-gray-600'}>Checked bag</span>
                      </li>
                      <li className="flex items-center gap-2">
                        {fare.features.seatSelection ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-gray-600" />}
                        <span className={fare.features.seatSelection ? 'text-gray-300' : 'text-gray-600'}>Seat selection</span>
                      </li>
                      <li className="flex items-center gap-2">
                        {fare.features.changes ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-gray-600" />}
                        <span className={fare.features.changes ? 'text-gray-300' : 'text-gray-600'}>Changes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        {fare.features.refund ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-gray-600" />}
                        <span className={fare.features.refund ? 'text-gray-300' : 'text-gray-600'}>Refundable</span>
                      </li>
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Baggage Info */}
            <div className="bg-gray-800/50 rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Baggage Allowance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Briefcase className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-medium text-white">Cabin Baggage</h3>
                  </div>
                  <div className="space-y-2 text-gray-300">
                    <p>{flight.baggage.cabin.pieces} piece(s) included</p>
                    <p>Max weight: {flight.baggage.cabin.weight}</p>
                    <p>Max size: {flight.baggage.cabin.dimensions}</p>
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Luggage className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-medium text-white">Checked Baggage</h3>
                  </div>
                  <div className="space-y-2 text-gray-300">
                    <p>{flight.baggage.checked.pieces} piece(s) included</p>
                    <p>Max weight: {flight.baggage.checked.weight}</p>
                    <p>Extra bag: ${flight.baggage.checked.extraBagPrice}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fare Rules */}
            <div className="bg-gray-800/50 rounded-2xl border border-white/10 p-6">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowFareDetails(!showFareDetails)}
              >
                <h2 className="text-xl font-semibold text-white">Fare Rules & Conditions</h2>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showFareDetails ? 'rotate-180' : ''}`} />
              </div>

              {showFareDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${flight.fareRules.changeable ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        <RefreshCw className={`w-5 h-5 ${flight.fareRules.changeable ? 'text-green-400' : 'text-red-400'}`} />
                      </div>
                      <div>
                        <p className="text-white font-medium">Changes</p>
                        <p className="text-gray-400 text-sm">
                          {flight.fareRules.changeable
                            ? `Allowed with ${flight.fareRules.changeFeeBefore} fee before departure`
                            : 'Not allowed'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${flight.fareRules.refundable ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        <CreditCard className={`w-5 h-5 ${flight.fareRules.refundable ? 'text-green-400' : 'text-red-400'}`} />
                      </div>
                      <div>
                        <p className="text-white font-medium">Refunds</p>
                        <p className="text-gray-400 text-sm">
                          {flight.fareRules.refundable ? 'Fully refundable' : 'Non-refundable'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-yellow-400 font-medium">Important</p>
                        <p className="text-gray-300 text-sm">
                          Free cancellation within 24 hours of booking. After that, cancellation will result in {flight.fareRules.noShow.toLowerCase()}.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Extras */}
            <div className="bg-gray-800/50 rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Enhance Your Trip</h2>
              <div className="space-y-3">
                {flight.extras.map((extra) => (
                  <div
                    key={extra.id}
                    onClick={() => toggleExtra(extra.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedExtras.includes(extra.id)
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        selectedExtras.includes(extra.id) ? 'border-blue-500 bg-blue-500' : 'border-gray-500'
                      }`}>
                        {selectedExtras.includes(extra.id) && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className="text-white font-medium">{extra.name}</p>
                        <p className="text-gray-400 text-sm">{extra.description}</p>
                      </div>
                    </div>
                    <p className="text-white font-semibold">+${extra.price}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CO2 Emissions */}
            <div className="bg-gray-800/50 rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Environmental Impact</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">Total CO2 emissions for this trip</p>
                  <p className="text-2xl font-bold text-white">{flight.co2.outbound + flight.co2.inbound} kg</p>
                </div>
                <button className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                  Offset for ${flight.co2.offset}
                </button>
              </div>
            </div>
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-gray-800/50 rounded-2xl border border-white/10 p-6">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    {flight.originalPrice && (
                      <span className="text-gray-500 line-through">${flight.originalPrice}</span>
                    )}
                    <span className="text-3xl font-bold text-white">${selectedFareData?.price || flight.price.amount}</span>
                  </div>
                  <p className="text-gray-400">per person</p>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                  <div className="flex justify-between text-gray-400">
                    <span>Base fare ({passengers} traveler{passengers > 1 ? 's' : ''})</span>
                    <span>${(selectedFareData?.price || flight.price.amount) * passengers}</span>
                  </div>
                  {selectedExtras.length > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>Extras ({selectedExtras.length})</span>
                      <span>${extrasTotal}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-semibold text-lg">
                    <span>Total</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>

                {/* Trip Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{new Date(flight.outbound.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(flight.inbound?.date || flight.outbound.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{passengers} traveler{passengers > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Plane className="w-4 h-4 text-gray-500" />
                    <span>{selectedFare} fare</span>
                  </div>
                </div>

                <button
                  onClick={handleBook}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  Continue to Booking
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Secure payment</span>
                </div>

                <p className="text-center text-gray-500 text-xs mt-4">
                  Prices include all taxes and fees. No hidden charges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
