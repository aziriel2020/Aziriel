'use client';

/**
 * BOOKING CONFIRMATION PAGE
 * Universal confirmation page for flights and hotels
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Check,
  Plane,
  Building2,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Download,
  Share2,
  Printer,
  QrCode,
  ArrowRight,
  Star,
  Gift,
  CreditCard,
  Shield,
  Phone,
  Home,
  Plus,
  Sparkles
} from 'lucide-react';

interface BookingDetails {
  reference: string;
  type: 'flight' | 'hotel';
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
  // Flight specific
  flight?: {
    airline: string;
    flightNumber: string;
    departure: {
      airport: string;
      city: string;
      date: string;
      time: string;
    };
    arrival: {
      airport: string;
      city: string;
      date: string;
      time: string;
    };
    passengers: Array<{
      name: string;
      type: string;
      seat?: string;
    }>;
    cabinClass: string;
    duration: string;
  };
  // Hotel specific
  hotel?: {
    name: string;
    address: string;
    city: string;
    stars: number;
    checkIn: string;
    checkOut: string;
    room: string;
    guests: Array<{
      name: string;
    }>;
    nights: number;
  };
  // Common
  contact: {
    email: string;
    phone: string;
  };
  payment: {
    method: string;
    last4: string;
    amount: number;
    currency: string;
  };
  loyaltyPoints?: number;
}

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookingRef = searchParams.get('ref') || '';
  const bookingType = searchParams.get('type') as 'flight' | 'hotel' || 'flight';

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, fetch from API
    // For demo, use mock data
    setTimeout(() => {
      setBooking(bookingType === 'flight' ? mockFlightBooking : mockHotelBooking);
      setLoading(false);
    }, 500);
  }, [bookingRef, bookingType]);

  const handleDownloadItinerary = () => {
    // In production, generate PDF
    alert('Downloading itinerary...');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Booking ${bookingRef}`,
          text: `Check out my ${bookingType} booking!`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white">Loading Confirmation</h2>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Booking Not Found</h2>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
      {/* Success Header */}
      <header className="bg-green-600/20 border-b border-green-500/30">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Check className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Booking Confirmed!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-300"
          >
            Confirmation email sent to {booking.contact.email}
          </motion.p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Booking Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Booking Reference</p>
              <p className="text-3xl font-bold text-white font-mono tracking-wider">
                {booking.reference}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadItinerary}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>

          {/* QR Code */}
          <div className="mt-6 flex items-center gap-6 pt-6 border-t border-white/10">
            <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center">
              <QrCode className="w-16 h-16 text-gray-900" />
            </div>
            <div>
              <p className="text-white font-medium mb-1">Mobile Check-in</p>
              <p className="text-gray-400 text-sm">
                Scan this QR code at the {booking.type === 'flight' ? 'airport' : 'hotel'} for quick check-in
              </p>
            </div>
          </div>
        </motion.div>

        {/* Booking Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            {booking.type === 'flight' ? (
              <><Plane className="w-5 h-5 text-blue-400" /> Flight Details</>
            ) : (
              <><Building2 className="w-5 h-5 text-purple-400" /> Hotel Details</>
            )}
          </h2>

          {booking.type === 'flight' && booking.flight && (
            <>
              {/* Flight Route */}
              <div className="flex items-center justify-between mb-8">
                <div className="text-center">
                  <p className="text-4xl font-bold text-white mb-1">
                    {booking.flight.departure.time}
                  </p>
                  <p className="text-xl text-white">{booking.flight.departure.airport}</p>
                  <p className="text-gray-400">{booking.flight.departure.city}</p>
                  <p className="text-sm text-gray-500 mt-1">{booking.flight.departure.date}</p>
                </div>

                <div className="flex-1 mx-8">
                  <div className="relative">
                    <div className="h-0.5 bg-gray-600"></div>
                    <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-400 transform rotate-90" />
                  </div>
                  <p className="text-center text-gray-400 mt-2">{booking.flight.duration}</p>
                  <p className="text-center text-sm text-gray-500">
                    {booking.flight.airline} • {booking.flight.flightNumber}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-4xl font-bold text-white mb-1">
                    {booking.flight.arrival.time}
                  </p>
                  <p className="text-xl text-white">{booking.flight.arrival.airport}</p>
                  <p className="text-gray-400">{booking.flight.arrival.city}</p>
                  <p className="text-sm text-gray-500 mt-1">{booking.flight.arrival.date}</p>
                </div>
              </div>

              {/* Passengers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booking.flight.passengers.map((pax, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{pax.name}</p>
                        <p className="text-sm text-gray-400">{pax.type}</p>
                      </div>
                    </div>
                    {pax.seat && (
                      <div className="text-right">
                        <p className="text-white font-medium">Seat {pax.seat}</p>
                        <p className="text-sm text-gray-400">{booking.flight.cabinClass}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {booking.type === 'hotel' && booking.hotel && (
            <>
              {/* Hotel Info */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{booking.hotel.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(booking.hotel.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {booking.hotel.address}, {booking.hotel.city}
                </p>
              </div>

              {/* Stay Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Check-in</p>
                  <p className="text-white font-medium">{booking.hotel.checkIn}</p>
                  <p className="text-sm text-gray-500">After 3:00 PM</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Check-out</p>
                  <p className="text-white font-medium">{booking.hotel.checkOut}</p>
                  <p className="text-sm text-gray-500">Before 11:00 AM</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Duration</p>
                  <p className="text-white font-medium">{booking.hotel.nights} nights</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Room</p>
                  <p className="text-white font-medium">{booking.hotel.room}</p>
                </div>
              </div>

              {/* Guests */}
              <div>
                <h4 className="text-white font-medium mb-3">Guests</h4>
                <div className="flex flex-wrap gap-3">
                  {booking.hotel.guests.map((guest, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-xl px-4 py-2 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-purple-400" />
                      <span className="text-white">{guest.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Payment Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-400" />
            Payment Details
          </h2>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white">{booking.payment.method}</p>
                <p className="text-sm text-gray-400">•••• {booking.payment.last4}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                ${booking.payment.amount.toFixed(2)}
              </p>
              <p className="text-sm text-green-400 flex items-center justify-end gap-1">
                <Check className="w-4 h-4" /> Paid
              </p>
            </div>
          </div>

          {/* Loyalty Points */}
          {booking.loyaltyPoints && (
            <div className="mt-4 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="text-white font-medium">Points Earned</p>
                    <p className="text-sm text-gray-400">Added to your loyalty account</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-yellow-400">
                  +{booking.loyaltyPoints.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Contact Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white">{booking.contact.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white">{booking.contact.phone}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Important Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Important Information
          </h2>
          <ul className="space-y-2 text-gray-300 text-sm">
            {booking.type === 'flight' ? (
              <>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Please arrive at the airport at least 2 hours before departure (3 hours for international)
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Bring a valid ID/passport matching the name on your booking
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Online check-in opens 24 hours before departure
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Check-in time is from 3:00 PM. Early check-in subject to availability
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  Please bring a valid ID matching the guest name on the reservation
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  A credit card may be required at check-in for incidentals
                </li>
              </>
            )}
          </ul>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => router.push('/')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
          <button
            onClick={() => router.push(booking.type === 'flight' ? '/flights/search' : '/hotels/search')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Book Another {booking.type === 'flight' ? 'Flight' : 'Hotel'}
          </button>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8 text-gray-500 text-sm"
        >
          Need help? Contact our 24/7 support at{' '}
          <a href="tel:+1-800-SKY-WARD" className="text-blue-400 hover:underline">
            +1-800-SKY-WARD
          </a>{' '}
          or{' '}
          <a href="mailto:support@skyward.com" className="text-blue-400 hover:underline">
            support@skyward.com
          </a>
        </motion.div>
      </main>
    </div>
  );
}

// Mock data
const mockFlightBooking: BookingDetails = {
  reference: 'SKY7X9M2K',
  type: 'flight',
  status: 'confirmed',
  createdAt: new Date().toISOString(),
  flight: {
    airline: 'Air France',
    flightNumber: 'AF007',
    departure: {
      airport: 'JFK',
      city: 'New York',
      date: 'March 15, 2024',
      time: '09:00'
    },
    arrival: {
      airport: 'CDG',
      city: 'Paris',
      date: 'March 15, 2024',
      time: '22:30'
    },
    passengers: [
      { name: 'John Doe', type: 'Adult', seat: '14A' },
      { name: 'Jane Doe', type: 'Adult', seat: '14B' }
    ],
    cabinClass: 'Economy',
    duration: '7h 30m'
  },
  contact: {
    email: 'john.doe@email.com',
    phone: '+1 234 567 8900'
  },
  payment: {
    method: 'Visa',
    last4: '4242',
    amount: 1289.00,
    currency: 'USD'
  },
  loyaltyPoints: 2578
};

const mockHotelBooking: BookingDetails = {
  reference: 'HTL4K8N3P',
  type: 'hotel',
  status: 'confirmed',
  createdAt: new Date().toISOString(),
  hotel: {
    name: 'Le Grand Paris Marriott',
    address: '15 Avenue Montaigne',
    city: 'Paris, France',
    stars: 5,
    checkIn: 'March 15, 2024',
    checkOut: 'March 18, 2024',
    room: 'Deluxe King Room',
    guests: [
      { name: 'John Doe' },
      { name: 'Jane Doe' }
    ],
    nights: 3
  },
  contact: {
    email: 'john.doe@email.com',
    phone: '+1 234 567 8900'
  },
  payment: {
    method: 'Mastercard',
    last4: '5555',
    amount: 1456.80,
    currency: 'USD'
  },
  loyaltyPoints: 1457
};
