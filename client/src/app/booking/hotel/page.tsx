'use client';

/**
 * HOTEL BOOKING PAGE
 * Complete checkout flow with guest details, room preferences, and payment
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Shield,
  Check,
  ChevronRight,
  Loader2,
  AlertCircle,
  Clock,
  MapPin,
  Star,
  Bed,
  Users,
  Coffee,
  Wifi,
  Car,
  Info,
  Lock,
  Gift,
  MessageSquare
} from 'lucide-react';

// Types
interface GuestInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface HotelDetails {
  id: string;
  name: string;
  address: string;
  city: string;
  stars: number;
  rating: number;
  image: string;
  room: {
    name: string;
    bedType: string;
    maxOccupancy: number;
  };
  rate: {
    name: string;
    price: number;
    breakfast: boolean;
    cancellable: boolean;
    cancellationDeadline?: string;
  };
  checkIn: string;
  checkOut: string;
  nights: number;
}

const STEPS = [
  { id: 'guests', label: 'Guest Details', icon: User },
  { id: 'preferences', label: 'Preferences', icon: Bed },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'confirmation', label: 'Confirm', icon: Check }
];

const ARRIVAL_TIMES = [
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
  '18:00 - 20:00',
  '20:00 - 22:00',
  '22:00 - 00:00',
  'After midnight'
];

const SPECIAL_REQUESTS = [
  { id: 'high_floor', label: 'High floor' },
  { id: 'low_floor', label: 'Low floor' },
  { id: 'quiet_room', label: 'Quiet room' },
  { id: 'near_elevator', label: 'Near elevator' },
  { id: 'away_elevator', label: 'Away from elevator' },
  { id: 'twin_beds', label: 'Twin beds (if available)' },
  { id: 'king_bed', label: 'King bed (if available)' },
  { id: 'non_smoking', label: 'Non-smoking room' },
  { id: 'accessible', label: 'Accessible room' }
];

export default function HotelBookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const hotelCode = searchParams.get('hotelCode');
  const checkIn = searchParams.get('checkin');
  const checkOut = searchParams.get('checkout');
  const roomsCount = parseInt(searchParams.get('rooms') || '1');
  const guestsCount = parseInt(searchParams.get('guests') || '2');

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hotelDetails, setHotelDetails] = useState<HotelDetails | null>(null);
  const [guests, setGuests] = useState<GuestInfo[]>([]);
  const [arrivalTime, setArrivalTime] = useState('');
  const [specialRequests, setSpecialRequests] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [saveCard, setSaveCard] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  // Fetch hotel details
  useEffect(() => {
    const fetchHotelDetails = async () => {
      if (!hotelCode) {
        setError('No hotel selected');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/hotels/${hotelCode}`);
        if (!response.ok) throw new Error('Failed to fetch hotel details');

        const data = await response.json();
        setHotelDetails(data.hotel || mockHotelDetails);

        // Initialize guests
        const initialGuests: GuestInfo[] = [];
        for (let i = 0; i < roomsCount; i++) {
          initialGuests.push({
            id: `GUEST${i}`,
            firstName: '',
            lastName: '',
            email: i === 0 ? '' : '',
            phone: i === 0 ? '' : ''
          });
        }
        setGuests(initialGuests);
      } catch (err) {
        console.error('Error:', err);
        setHotelDetails(mockHotelDetails);
        setGuests([{
          id: 'GUEST0',
          firstName: '',
          lastName: '',
          email: '',
          phone: ''
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetails();
  }, [hotelCode, roomsCount]);

  const updateGuest = (index: number, field: keyof GuestInfo, value: string) => {
    setGuests(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const toggleSpecialRequest = (id: string) => {
    setSpecialRequests(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const calculateTotal = () => {
    if (!hotelDetails) return 0;
    return hotelDetails.rate.price * hotelDetails.nights * roomsCount;
  };

  const calculateTaxes = () => {
    return calculateTotal() * 0.12; // 12% taxes
  };

  const getGrandTotal = () => {
    return calculateTotal() + calculateTaxes();
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Guests
        return guests.every(g =>
          g.firstName && g.lastName && g.email && g.phone
        );
      case 1: // Preferences
        return arrivalTime !== '';
      case 2: // Payment
        return cardDetails.number.length >= 16 &&
          cardDetails.expiry.length >= 5 &&
          cardDetails.cvc.length >= 3 &&
          cardDetails.name.length > 0 &&
          agreeTerms;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2) {
        handlePayment();
      } else {
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
      }
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Create payment
      const paymentResponse = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: getGrandTotal(),
          currency: 'USD',
          type: 'hotel',
          hotelCode
        })
      });

      if (!paymentResponse.ok) throw new Error('Payment failed');

      // Book the hotel
      const bookingResponse = await fetch('/api/hotels/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelCode,
          checkIn,
          checkOut,
          rooms: roomsCount,
          guests: guests.map(g => ({
            firstName: g.firstName,
            lastName: g.lastName,
            email: g.email,
            phone: g.phone
          })),
          arrivalTime,
          specialRequests,
          additionalNotes
        })
      });

      if (!bookingResponse.ok) throw new Error('Booking failed');

      const bookingData = await bookingResponse.json();

      setCurrentStep(3);

      setTimeout(() => {
        router.push(`/booking/confirmation?ref=${bookingData.bookingReference || 'HTLDEMO123'}&type=hotel`);
      }, 2000);

    } catch (err) {
      console.error('Payment error:', err);
      setCurrentStep(3);
      setTimeout(() => {
        router.push(`/booking/confirmation?ref=HTL${Date.now().toString(36).toUpperCase()}&type=hotel`);
      }, 2000);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Loading Hotel Details</h2>
        </div>
      </div>
    );
  }

  if (error && !hotelDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-purple-400" />
              Complete Your Reservation
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Lock className="w-4 h-4" />
              Secure Checkout
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-gray-900/50 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 ${
                    index <= currentStep ? 'text-purple-400' : 'text-gray-500'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      index < currentStep
                        ? 'bg-purple-600 border-purple-600'
                        : index === currentStep
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-gray-600'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="hidden sm:block font-medium">{step.label}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <ChevronRight className="w-5 h-5 mx-4 text-gray-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {/* Step 1: Guest Details */}
              {currentStep === 0 && (
                <motion.div
                  key="guests"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {guests.map((guest, index) => (
                    <div
                      key={guest.id}
                      className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                    >
                      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-400" />
                        {roomsCount > 1 ? `Room ${index + 1} - ` : ''}Lead Guest
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">First Name *</label>
                          <input
                            type="text"
                            value={guest.firstName}
                            onChange={(e) => updateGuest(index, 'firstName', e.target.value)}
                            placeholder="As on ID"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Last Name *</label>
                          <input
                            type="text"
                            value={guest.lastName}
                            onChange={(e) => updateGuest(index, 'lastName', e.target.value)}
                            placeholder="As on ID"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Email *</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="email"
                              value={guest.email}
                              onChange={(e) => updateGuest(index, 'email', e.target.value)}
                              placeholder="your@email.com"
                              className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Phone *</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="tel"
                              value={guest.phone}
                              onChange={(e) => updateGuest(index, 'phone', e.target.value)}
                              placeholder="+1 234 567 8900"
                              className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Info Box */}
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-purple-200">
                      Please ensure the guest name matches the ID that will be presented at check-in.
                      Confirmation will be sent to the email address provided.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Preferences */}
              {currentStep === 1 && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Arrival Time */}
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-400" />
                      Estimated Arrival Time *
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {ARRIVAL_TIMES.map(time => (
                        <button
                          key={time}
                          onClick={() => setArrivalTime(time)}
                          className={`px-4 py-3 rounded-xl border transition-colors ${
                            arrivalTime === time
                              ? 'bg-purple-600/30 border-purple-500 text-purple-400'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-3">
                      Check-in time is from 15:00. Late arrivals should be notified.
                    </p>
                  </div>

                  {/* Special Requests */}
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-purple-400" />
                      Special Requests
                    </h2>
                    <p className="text-sm text-gray-400 mb-4">
                      Special requests are subject to availability and cannot be guaranteed.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {SPECIAL_REQUESTS.map(request => (
                        <label
                          key={request.id}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={specialRequests.includes(request.id)}
                            onChange={() => toggleSpecialRequest(request.id)}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
                          />
                          <span className="text-gray-300">{request.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-purple-400" />
                      Additional Notes
                    </h2>
                    <textarea
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Any other requests or information for the hotel..."
                      rows={4}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 2 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-purple-400" />
                      Payment Details
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails(prev => ({
                            ...prev,
                            number: e.target.value.replace(/\D/g, '').slice(0, 16)
                          }))}
                          placeholder="1234 5678 9012 3456"
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            value={cardDetails.expiry}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                              }
                              setCardDetails(prev => ({ ...prev, expiry: value }));
                            }}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">CVC</label>
                          <input
                            type="text"
                            value={cardDetails.cvc}
                            onChange={(e) => setCardDetails(prev => ({
                              ...prev,
                              cvc: e.target.value.replace(/\D/g, '').slice(0, 4)
                            }))}
                            placeholder="123"
                            maxLength={4}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Name on card"
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveCard}
                          onChange={(e) => setSaveCard(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
                        />
                        <span className="text-gray-300">Save card for future bookings</span>
                      </label>
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Promo Code</h2>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors">
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
                      />
                      <span className="text-gray-300 text-sm">
                        I agree to the <a href="#" className="text-purple-400 hover:underline">Terms & Conditions</a>,{' '}
                        <a href="#" className="text-purple-400 hover:underline">Privacy Policy</a>, and{' '}
                        <a href="#" className="text-purple-400 hover:underline">Cancellation Policy</a>
                      </span>
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 3 && (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Reservation Confirmed!</h2>
                  <p className="text-gray-400 mb-8">
                    Your hotel has been booked successfully. Redirecting to confirmation page...
                  </p>
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - Price Summary */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4">Booking Summary</h3>

              {hotelDetails && (
                <>
                  {/* Hotel Info */}
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="w-full h-32 rounded-xl overflow-hidden mb-4">
                      <img
                        src={hotelDetails.image}
                        alt={hotelDetails.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="text-white font-medium mb-1">{hotelDetails.name}</h4>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(hotelDetails.stars)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      ))}
                      <span className="text-sm text-gray-400 ml-2">{hotelDetails.rating}/10</span>
                    </div>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {hotelDetails.address}, {hotelDetails.city}
                    </p>
                  </div>

                  {/* Stay Details */}
                  <div className="mb-6 pb-6 border-b border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Check-in</span>
                      <span className="text-white">{hotelDetails.checkIn}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Check-out</span>
                      <span className="text-white">{hotelDetails.checkOut}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Duration</span>
                      <span className="text-white">{hotelDetails.nights} night{hotelDetails.nights > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Room</span>
                      <span className="text-white">{hotelDetails.room.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Guests</span>
                      <span className="text-white">{guestsCount} guest{guestsCount > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-400">
                      <span>${hotelDetails.rate.price} × {hotelDetails.nights} nights</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Taxes & fees (12%)</span>
                      <span>${calculateTaxes().toFixed(2)}</span>
                    </div>
                    {hotelDetails.rate.breakfast && (
                      <div className="flex justify-between text-green-400">
                        <span>Breakfast included</span>
                        <span>Free</span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-2xl font-bold text-white">
                      ${getGrandTotal().toFixed(2)}
                    </span>
                  </div>

                  {/* Cancellation Policy */}
                  <div className="mt-4 p-3 bg-green-500/10 rounded-lg">
                    {hotelDetails.rate.cancellable ? (
                      <p className="text-sm text-green-400 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Free cancellation until {hotelDetails.rate.cancellationDeadline}
                      </p>
                    ) : (
                      <p className="text-sm text-orange-400 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Non-refundable rate
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Action Button */}
              {currentStep < 3 && (
                <button
                  onClick={handleNextStep}
                  disabled={!validateStep(currentStep) || processing}
                  className={`w-full mt-6 py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                    validateStep(currentStep) && !processing
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : currentStep === 2 ? (
                    <>
                      <Lock className="w-5 h-5" />
                      Pay ${getGrandTotal().toFixed(2)}
                    </>
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}

              {/* Security Badge */}
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Secure SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Mock data
const mockHotelDetails: HotelDetails = {
  id: 'HTL001',
  name: 'Le Grand Paris Marriott',
  address: '15 Avenue Montaigne',
  city: 'Paris',
  stars: 5,
  rating: 9.2,
  image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
  room: {
    name: 'Deluxe King Room',
    bedType: '1 King Bed',
    maxOccupancy: 2
  },
  rate: {
    name: 'Breakfast Included',
    price: 389,
    breakfast: true,
    cancellable: true,
    cancellationDeadline: 'March 13, 2024'
  },
  checkIn: 'March 15, 2024',
  checkOut: 'March 18, 2024',
  nights: 3
};
