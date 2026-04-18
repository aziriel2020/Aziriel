'use client';

/**
 * TRIP DETAIL PAGE
 * View and manage individual booking/trip
 */

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Plane,
  Hotel,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Download,
  Share2,
  Printer,
  QrCode,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
  X,
  Edit2,
  CreditCard,
  FileText,
  MessageSquare,
  Shield,
  Luggage,
  Wifi,
  Utensils,
  Coffee
} from 'lucide-react';

// Demo booking data
const DEMO_BOOKING = {
  id: 'BK-2024-789456',
  type: 'flight',
  status: 'confirmed',
  confirmationNumber: 'SKY789456',
  createdAt: '2024-12-10T14:30:00Z',
  totalPrice: {
    amount: 1461,
    currency: 'USD',
    breakdown: {
      baseFare: 1340,
      taxes: 89,
      fees: 32
    }
  },
  payment: {
    method: 'card',
    last4: '4242',
    brand: 'Visa'
  },
  contact: {
    email: 'john.doe@email.com',
    phone: '+1 555-123-4567'
  },
  passengers: [
    {
      type: 'adult',
      title: 'Mr',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1985-06-15',
      passportNumber: 'US123456789',
      passportExpiry: '2028-06-15',
      seatNumber: '14A',
      meal: 'Standard',
      frequentFlyer: 'AF123456789'
    },
    {
      type: 'adult',
      title: 'Mrs',
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: '1987-09-22',
      passportNumber: 'US987654321',
      passportExpiry: '2027-09-22',
      seatNumber: '14B',
      meal: 'Vegetarian',
      frequentFlyer: null
    }
  ],
  flight: {
    airline: {
      name: 'Air France',
      code: 'AF',
      logo: 'https://logos-world.net/wp-content/uploads/2023/01/Air-France-Logo.png'
    },
    outbound: {
      flightNumber: 'AF007',
      date: '2024-12-15',
      departure: {
        airport: 'JFK',
        city: 'New York',
        terminal: '1',
        time: '18:30'
      },
      arrival: {
        airport: 'CDG',
        city: 'Paris',
        terminal: '2E',
        time: '07:45',
        nextDay: true
      },
      duration: '7h 15m',
      aircraft: 'Boeing 777-300ER',
      class: 'Economy'
    },
    inbound: {
      flightNumber: 'AF008',
      date: '2024-12-22',
      departure: {
        airport: 'CDG',
        city: 'Paris',
        terminal: '2E',
        time: '10:15'
      },
      arrival: {
        airport: 'JFK',
        city: 'New York',
        terminal: '1',
        time: '13:30'
      },
      duration: '8h 15m',
      aircraft: 'Airbus A350-900',
      class: 'Economy'
    },
    baggage: {
      cabin: '1 x 12kg',
      checked: '1 x 23kg per person'
    },
    extras: ['Seat Selection', 'Priority Boarding']
  },
  loyaltyPoints: {
    earned: 2922,
    status: 'pending'
  },
  cancellation: {
    allowed: true,
    deadline: '2024-12-14T18:30:00Z',
    refundAmount: 1200,
    fee: 261
  },
  documents: [
    { type: 'E-Ticket', status: 'ready', downloadUrl: '#' },
    { type: 'Boarding Pass', status: 'available_24h_before', downloadUrl: null },
    { type: 'Receipt', status: 'ready', downloadUrl: '#' }
  ]
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
};

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking] = useState(DEMO_BOOKING);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'passengers' | 'documents'>('details');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => time;

  const daysUntilDeparture = () => {
    const departure = new Date(booking.flight.outbound.date);
    const today = new Date();
    const diff = Math.ceil((departure.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
              Back to My Trips
            </Link>
            <div className="flex items-center gap-3">
              <button className="p-2 bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Print">
                <Printer className="w-5 h-5" />
              </button>
              <button className="p-2 bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Share">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Booking Header */}
        <div className="bg-gray-800/50 rounded-2xl border border-white/10 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border capitalize ${STATUS_COLORS[booking.status]}`}>
                  {booking.status}
                </span>
                {daysUntilDeparture() <= 7 && daysUntilDeparture() > 0 && (
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium">
                    {daysUntilDeparture()} days until departure
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white">
                {booking.flight.outbound.departure.city} → {booking.flight.outbound.arrival.city}
              </h1>
              <p className="text-gray-400">
                Confirmation: <span className="text-white font-mono">{booking.confirmationNumber}</span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-2">
                <img src={booking.flight.airline.logo} alt={booking.flight.airline.name} className="w-full h-full object-contain" />
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Total Paid</p>
                <p className="text-2xl font-bold text-white">${booking.totalPrice.amount}</p>
              </div>
            </div>
          </div>

          {/* QR Code & Actions */}
          <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-800" />
              </div>
              <div>
                <p className="text-white font-medium">Mobile Boarding Pass</p>
                <p className="text-gray-400 text-sm">Scan at airport check-in</p>
              </div>
            </div>

            <div className="flex-1 flex flex-wrap gap-3 md:justify-end">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download E-Ticket
              </button>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Manage Booking
              </button>
              {booking.cancellation.allowed && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 font-medium transition-colors"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10 mb-8">
          <div className="flex gap-6">
            {['details', 'passengers', 'documents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 px-1 font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Outbound Flight */}
              <div className="bg-gray-800/50 rounded-2xl border border-white/10 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Plane className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Outbound Flight</h2>
                  <span className="text-gray-400">• {formatDate(booking.flight.outbound.date)}</span>
                </div>

                <div className="bg-gray-700/30 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{formatTime(booking.flight.outbound.departure.time)}</p>
                      <p className="text-lg text-white">{booking.flight.outbound.departure.airport}</p>
                      <p className="text-gray-400 text-sm">{booking.flight.outbound.departure.city}</p>
                      <p className="text-gray-500 text-xs">Terminal {booking.flight.outbound.departure.terminal}</p>
                    </div>

                    <div className="flex-1 px-8 text-center">
                      <p className="text-gray-400 text-sm mb-2">{booking.flight.outbound.duration}</p>
                      <div className="relative">
                        <div className="h-0.5 bg-gray-600 w-full" />
                        <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 rotate-90" />
                      </div>
                      <p className="text-gray-500 text-xs mt-2">{booking.flight.outbound.flightNumber}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{formatTime(booking.flight.outbound.arrival.time)}</p>
                      {booking.flight.outbound.arrival.nextDay && (
                        <span className="text-orange-400 text-xs">+1</span>
                      )}
                      <p className="text-lg text-white">{booking.flight.outbound.arrival.airport}</p>
                      <p className="text-gray-400 text-sm">{booking.flight.outbound.arrival.city}</p>
                      <p className="text-gray-500 text-xs">Terminal {booking.flight.outbound.arrival.terminal}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10 text-sm text-gray-400">
                    <span>{booking.flight.outbound.aircraft}</span>
                    <span>•</span>
                    <span>{booking.flight.outbound.class}</span>
                    <span>•</span>
                    <span>{booking.flight.airline.name}</span>
                  </div>
                </div>
              </div>

              {/* Return Flight */}
              <div className="bg-gray-800/50 rounded-2xl border border-white/10 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Plane className="w-5 h-5 text-purple-400 rotate-180" />
                  <h2 className="text-lg font-semibold text-white">Return Flight</h2>
                  <span className="text-gray-400">• {formatDate(booking.flight.inbound.date)}</span>
                </div>

                <div className="bg-gray-700/30 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{formatTime(booking.flight.inbound.departure.time)}</p>
                      <p className="text-lg text-white">{booking.flight.inbound.departure.airport}</p>
                      <p className="text-gray-400 text-sm">{booking.flight.inbound.departure.city}</p>
                      <p className="text-gray-500 text-xs">Terminal {booking.flight.inbound.departure.terminal}</p>
                    </div>

                    <div className="flex-1 px-8 text-center">
                      <p className="text-gray-400 text-sm mb-2">{booking.flight.inbound.duration}</p>
                      <div className="relative">
                        <div className="h-0.5 bg-gray-600 w-full" />
                        <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 -rotate-90" />
                      </div>
                      <p className="text-gray-500 text-xs mt-2">{booking.flight.inbound.flightNumber}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{formatTime(booking.flight.inbound.arrival.time)}</p>
                      <p className="text-lg text-white">{booking.flight.inbound.arrival.airport}</p>
                      <p className="text-gray-400 text-sm">{booking.flight.inbound.arrival.city}</p>
                      <p className="text-gray-500 text-xs">Terminal {booking.flight.inbound.arrival.terminal}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10 text-sm text-gray-400">
                    <span>{booking.flight.inbound.aircraft}</span>
                    <span>•</span>
                    <span>{booking.flight.inbound.class}</span>
                    <span>•</span>
                    <span>{booking.flight.airline.name}</span>
                  </div>
                </div>
              </div>

              {/* Baggage & Extras */}
              <div className="bg-gray-800/50 rounded-2xl border border-white/10 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Baggage & Extras</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <Luggage className="w-6 h-6 text-blue-400 mb-2" />
                    <p className="text-white font-medium">Cabin Baggage</p>
                    <p className="text-gray-400 text-sm">{booking.flight.baggage.cabin}</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <Luggage className="w-6 h-6 text-purple-400 mb-2" />
                    <p className="text-white font-medium">Checked Baggage</p>
                    <p className="text-gray-400 text-sm">{booking.flight.baggage.checked}</p>
                  </div>
                </div>

                {booking.flight.extras.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-gray-400 text-sm mb-2">Included Extras:</p>
                    <div className="flex flex-wrap gap-2">
                      {booking.flight.extras.map((extra, index) => (
                        <span key={index} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          {extra}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="bg-gray-800/50 rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Payment Summary</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-400">
                    <span>Base fare (2 passengers)</span>
                    <span>${booking.totalPrice.breakdown.baseFare}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Taxes & fees</span>
                    <span>${booking.totalPrice.breakdown.taxes + booking.totalPrice.breakdown.fees}</span>
                  </div>
                  <div className="flex justify-between text-white font-semibold pt-3 border-t border-white/10">
                    <span>Total Paid</span>
                    <span>${booking.totalPrice.amount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-700/30 rounded-xl p-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-white text-sm">{booking.payment.brand} •••• {booking.payment.last4}</p>
                    <p className="text-gray-500 text-xs">Payment completed</p>
                  </div>
                </div>
              </div>

              {/* Loyalty Points */}
              <div className="bg-gray-800/50 rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Loyalty Points</h3>
                <div className="text-center py-4">
                  <p className="text-4xl font-bold text-blue-400">{booking.loyaltyPoints.earned}</p>
                  <p className="text-gray-400">points earned</p>
                </div>
                <p className="text-gray-500 text-sm text-center">
                  Points will be credited after your trip
                </p>
              </div>

              {/* Contact */}
              <div className="bg-gray-800/50 rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span>{booking.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span>{booking.contact.phone}</span>
                  </div>
                </div>
              </div>

              {/* Need Help */}
              <div className="bg-blue-500/10 rounded-2xl border border-blue-500/30 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
                <p className="text-gray-400 text-sm mb-4">Our support team is available 24/7</p>
                <Link
                  href="/support"
                  className="block w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold text-center transition-colors"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'passengers' && (
          <div className="space-y-4">
            {booking.passengers.map((passenger, index) => (
              <div key={index} className="bg-gray-800/50 rounded-2xl border border-white/10 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {passenger.title} {passenger.firstName} {passenger.lastName}
                      </h3>
                      <p className="text-gray-400 capitalize">{passenger.type}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    Seat {passenger.seatNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Date of Birth</p>
                    <p className="text-white">{passenger.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Passport</p>
                    <p className="text-white">{passenger.passportNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Passport Expiry</p>
                    <p className="text-white">{passenger.passportExpiry}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Meal Preference</p>
                    <p className="text-white">{passenger.meal}</p>
                  </div>
                </div>

                {passenger.frequentFlyer && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-gray-500 text-sm">Frequent Flyer</p>
                    <p className="text-white">{passenger.frequentFlyer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {booking.documents.map((doc, index) => (
              <div key={index} className="bg-gray-800/50 rounded-2xl border border-white/10 p-6">
                <FileText className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1">{doc.type}</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {doc.status === 'ready' ? 'Available for download' :
                   doc.status === 'available_24h_before' ? 'Available 24h before departure' :
                   'Processing'}
                </p>
                {doc.status === 'ready' ? (
                  <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                ) : (
                  <button disabled className="w-full py-2 bg-gray-700 rounded-xl text-gray-500 font-medium cursor-not-allowed">
                    Not Available Yet
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-2xl w-full max-w-md border border-white/10"
            >
              <div className="p-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-white text-center mb-2">Cancel Booking?</h2>
                <p className="text-gray-400 text-center mb-6">
                  Are you sure you want to cancel this booking? This action cannot be undone.
                </p>

                <div className="bg-gray-700/50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Refund Amount</span>
                    <span className="text-white">${booking.cancellation.refundAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cancellation Fee</span>
                    <span className="text-red-400">-${booking.cancellation.fee}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-semibold transition-colors"
                  >
                    Keep Booking
                  </button>
                  <button className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-white font-semibold transition-colors">
                    Cancel Booking
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
