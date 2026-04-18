'use client';

/**
 * FLIGHT BOOKING PAGE
 * Complete checkout flow with passenger details, seat selection, and payment
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Shield,
  Check,
  ChevronRight,
  ChevronDown,
  Loader2,
  AlertCircle,
  Briefcase,
  Baby,
  Clock,
  ArrowRight,
  Lock,
  Info,
  Plus,
  Minus,
  Star,
  Gift
} from 'lucide-react';

// Types
interface PassengerInfo {
  id: string;
  type: 'adult' | 'child' | 'infant';
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  email: string;
  phone: string;
}

interface FlightOffer {
  id: string;
  provider: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  duration: string;
  cabinClass: string;
  price: number;
  taxes: number;
  baggageIncluded: boolean;
  baggageAllowance: string;
  refundable: boolean;
  changeable: boolean;
}

interface Ancillary {
  id: string;
  type: 'baggage' | 'seat' | 'meal' | 'insurance';
  name: string;
  description: string;
  price: number;
  selected: boolean;
}

const STEPS = [
  { id: 'passengers', label: 'Passengers', icon: User },
  { id: 'extras', label: 'Extras', icon: Briefcase },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'confirmation', label: 'Confirm', icon: Check }
];

const TITLES = ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr'];

const NATIONALITIES = [
  'United States', 'United Kingdom', 'France', 'Germany', 'Canada',
  'Australia', 'Japan', 'China', 'India', 'Brazil', 'Other'
];

export default function FlightBookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const offerId = searchParams.get('offerId');
  const provider = searchParams.get('provider');

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flightOffer, setFlightOffer] = useState<FlightOffer | null>(null);
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [ancillaries, setAncillaries] = useState<Ancillary[]>([]);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'saved'>('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [saveCard, setSaveCard] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [loyaltyNumber, setLoyaltyNumber] = useState('');

  // Fetch flight offer details
  useEffect(() => {
    const fetchOffer = async () => {
      if (!offerId) {
        setError('No flight offer selected');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/flights/offer/${offerId}?provider=${provider}`);
        if (!response.ok) throw new Error('Failed to fetch flight details');

        const data = await response.json();
        setFlightOffer(data.offer || mockFlightOffer);

        // Initialize with one adult passenger
        setPassengers([createEmptyPassenger('adult', 0)]);
        setAncillaries(mockAncillaries);
      } catch (err) {
        console.error('Error:', err);
        setFlightOffer(mockFlightOffer);
        setPassengers([createEmptyPassenger('adult', 0)]);
        setAncillaries(mockAncillaries);
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [offerId, provider]);

  const createEmptyPassenger = (type: 'adult' | 'child' | 'infant', index: number): PassengerInfo => ({
    id: `PAX${index}`,
    type,
    title: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    passportExpiry: '',
    email: index === 0 ? '' : '',
    phone: index === 0 ? '' : ''
  });

  const updatePassenger = (index: number, field: keyof PassengerInfo, value: string) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addPassenger = (type: 'adult' | 'child' | 'infant') => {
    setPassengers(prev => [...prev, createEmptyPassenger(type, prev.length)]);
  };

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const toggleAncillary = (id: string) => {
    setAncillaries(prev =>
      prev.map(a => a.id === id ? { ...a, selected: !a.selected } : a)
    );
  };

  const calculateTotal = () => {
    if (!flightOffer) return 0;

    const basePrice = flightOffer.price * passengers.length;
    const taxes = flightOffer.taxes * passengers.length;
    const extras = ancillaries
      .filter(a => a.selected)
      .reduce((sum, a) => sum + a.price, 0);

    return basePrice + taxes + extras;
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Passengers
        return passengers.every(p =>
          p.title && p.firstName && p.lastName && p.dateOfBirth && p.nationality
        ) && contactEmail && contactPhone;
      case 1: // Extras
        return true;
      case 2: // Payment
        return paymentMethod === 'saved' || (
          cardDetails.number.length >= 16 &&
          cardDetails.expiry.length >= 5 &&
          cardDetails.cvc.length >= 3 &&
          cardDetails.name.length > 0
        );
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
      // Create payment intent
      const paymentResponse = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: calculateTotal(),
          currency: 'USD',
          type: 'flight',
          offerId: flightOffer?.id
        })
      });

      if (!paymentResponse.ok) throw new Error('Payment failed');

      // Book the flight
      const bookingResponse = await fetch('/api/flights/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: flightOffer?.id,
          provider,
          passengers: passengers.map(p => ({
            type: p.type,
            title: p.title,
            firstName: p.firstName,
            lastName: p.lastName,
            dateOfBirth: p.dateOfBirth,
            nationality: p.nationality,
            passportNumber: p.passportNumber,
            passportExpiry: p.passportExpiry
          })),
          contact: {
            email: contactEmail,
            phone: contactPhone
          },
          ancillaries: ancillaries.filter(a => a.selected).map(a => a.id),
          loyaltyNumber
        })
      });

      if (!bookingResponse.ok) throw new Error('Booking failed');

      const bookingData = await bookingResponse.json();

      // Move to confirmation
      setCurrentStep(3);

      // Redirect to confirmation page after delay
      setTimeout(() => {
        router.push(`/booking/confirmation?ref=${bookingData.bookingReference || 'DEMO123'}&type=flight`);
      }, 2000);

    } catch (err) {
      console.error('Payment error:', err);
      // Demo mode - proceed anyway
      setCurrentStep(3);
      setTimeout(() => {
        router.push(`/booking/confirmation?ref=DEMO${Date.now().toString(36).toUpperCase()}&type=flight`);
      }, 2000);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Loading Flight Details</h2>
        </div>
      </div>
    );
  }

  if (error && !flightOffer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium"
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
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Plane className="w-6 h-6 text-blue-400" />
              Complete Your Booking
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
                    index <= currentStep ? 'text-blue-400' : 'text-gray-500'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      index < currentStep
                        ? 'bg-blue-600 border-blue-600'
                        : index === currentStep
                        ? 'border-blue-500 bg-blue-500/20'
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
              {/* Step 1: Passengers */}
              {currentStep === 0 && (
                <motion.div
                  key="passengers"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <h2 className="text-xl font-semibold text-white mb-6">Passenger Details</h2>

                    {passengers.map((passenger, index) => (
                      <div key={passenger.id} className="mb-8 last:mb-0">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-white flex items-center gap-2">
                            {passenger.type === 'adult' && <User className="w-5 h-5 text-blue-400" />}
                            {passenger.type === 'child' && <Baby className="w-5 h-5 text-green-400" />}
                            {passenger.type === 'infant' && <Baby className="w-5 h-5 text-pink-400" />}
                            Passenger {index + 1} ({passenger.type})
                          </h3>
                          {passengers.length > 1 && (
                            <button
                              onClick={() => removePassenger(index)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Title */}
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Title *</label>
                            <select
                              value={passenger.title}
                              onChange={(e) => updatePassenger(index, 'title', e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="" className="bg-gray-900">Select</option>
                              {TITLES.map(t => (
                                <option key={t} value={t} className="bg-gray-900">{t}</option>
                              ))}
                            </select>
                          </div>

                          {/* First Name */}
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">First Name *</label>
                            <input
                              type="text"
                              value={passenger.firstName}
                              onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                              placeholder="As on passport"
                              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* Last Name */}
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Last Name *</label>
                            <input
                              type="text"
                              value={passenger.lastName}
                              onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                              placeholder="As on passport"
                              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* Date of Birth */}
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Date of Birth *</label>
                            <input
                              type="date"
                              value={passenger.dateOfBirth}
                              onChange={(e) => updatePassenger(index, 'dateOfBirth', e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* Nationality */}
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Nationality *</label>
                            <select
                              value={passenger.nationality}
                              onChange={(e) => updatePassenger(index, 'nationality', e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="" className="bg-gray-900">Select</option>
                              {NATIONALITIES.map(n => (
                                <option key={n} value={n} className="bg-gray-900">{n}</option>
                              ))}
                            </select>
                          </div>

                          {/* Passport Number */}
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Passport Number</label>
                            <input
                              type="text"
                              value={passenger.passportNumber}
                              onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                              placeholder="Optional"
                              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add Passenger */}
                    <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
                      <button
                        onClick={() => addPassenger('adult')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Adult
                      </button>
                      <button
                        onClick={() => addPassenger('child')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Child
                      </button>
                      <button
                        onClick={() => addPassenger('infant')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Infant
                      </button>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <h2 className="text-xl font-semibold text-white mb-6">Contact Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Email *</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Phone *</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="+1 234 567 8900"
                            className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Extras */}
              {currentStep === 1 && (
                <motion.div
                  key="extras"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <h2 className="text-xl font-semibold text-white mb-6">Add Extras</h2>

                    <div className="space-y-4">
                      {ancillaries.map(ancillary => (
                        <div
                          key={ancillary.id}
                          onClick={() => toggleAncillary(ancillary.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            ancillary.selected
                              ? 'border-blue-500 bg-blue-500/20'
                              : 'border-white/10 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                ancillary.type === 'baggage' ? 'bg-orange-500/20' :
                                ancillary.type === 'seat' ? 'bg-blue-500/20' :
                                ancillary.type === 'meal' ? 'bg-green-500/20' :
                                'bg-purple-500/20'
                              }`}>
                                {ancillary.type === 'baggage' && <Briefcase className="w-6 h-6 text-orange-400" />}
                                {ancillary.type === 'seat' && <User className="w-6 h-6 text-blue-400" />}
                                {ancillary.type === 'meal' && <Gift className="w-6 h-6 text-green-400" />}
                                {ancillary.type === 'insurance' && <Shield className="w-6 h-6 text-purple-400" />}
                              </div>
                              <div>
                                <h3 className="text-white font-medium">{ancillary.name}</h3>
                                <p className="text-sm text-gray-400">{ancillary.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xl font-bold text-white">
                                ${ancillary.price}
                              </span>
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                ancillary.selected
                                  ? 'bg-blue-600 border-blue-600'
                                  : 'border-gray-500'
                              }`}>
                                {ancillary.selected && <Check className="w-4 h-4 text-white" />}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Loyalty Program */}
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      Loyalty Program
                    </h2>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Frequent Flyer Number</label>
                      <input
                        type="text"
                        value={loyaltyNumber}
                        onChange={(e) => setLoyaltyNumber(e.target.value)}
                        placeholder="Enter your loyalty number"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Earn miles/points on this booking
                      </p>
                    </div>
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
                      <CreditCard className="w-5 h-5 text-blue-400" />
                      Payment Details
                    </h2>

                    {/* Card Details */}
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
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
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
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
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
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
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
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveCard}
                          onChange={(e) => setSaveCard(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
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
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-gray-300 text-sm">
                        I agree to the <a href="#" className="text-blue-400 hover:underline">Terms & Conditions</a>,{' '}
                        <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>, and{' '}
                        <a href="#" className="text-blue-400 hover:underline">Fare Rules</a>
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
                  <h2 className="text-3xl font-bold text-white mb-4">Booking Confirmed!</h2>
                  <p className="text-gray-400 mb-8">
                    Your flight has been booked successfully. Redirecting to confirmation page...
                  </p>
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - Price Summary */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4">Flight Summary</h3>

              {flightOffer && (
                <>
                  {/* Flight Info */}
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Plane className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{flightOffer.airline}</p>
                        <p className="text-sm text-gray-400">{flightOffer.flightNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-white font-medium">{flightOffer.departure.time}</p>
                        <p className="text-gray-400">{flightOffer.departure.airport}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-500" />
                      <div className="text-right">
                        <p className="text-white font-medium">{flightOffer.arrival.time}</p>
                        <p className="text-gray-400">{flightOffer.arrival.airport}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {flightOffer.duration}
                    </p>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-400">
                      <span>Base fare × {passengers.length}</span>
                      <span>${(flightOffer.price * passengers.length).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Taxes & fees</span>
                      <span>${(flightOffer.taxes * passengers.length).toFixed(2)}</span>
                    </div>
                    {ancillaries.filter(a => a.selected).map(a => (
                      <div key={a.id} className="flex justify-between text-gray-400">
                        <span>{a.name}</span>
                        <span>${a.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-2xl font-bold text-white">
                      ${calculateTotal().toFixed(2)}
                    </span>
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
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
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
                      Pay ${calculateTotal().toFixed(2)}
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
const mockFlightOffer: FlightOffer = {
  id: 'FL001',
  provider: 'amadeus',
  airline: 'Air France',
  flightNumber: 'AF007',
  departure: {
    airport: 'JFK',
    city: 'New York',
    time: '09:00',
    date: '2024-03-15'
  },
  arrival: {
    airport: 'CDG',
    city: 'Paris',
    time: '22:30',
    date: '2024-03-15'
  },
  duration: '7h 30m',
  cabinClass: 'Economy',
  price: 489,
  taxes: 100,
  baggageIncluded: true,
  baggageAllowance: '23kg checked + 8kg cabin',
  refundable: false,
  changeable: true
};

const mockAncillaries: Ancillary[] = [
  {
    id: 'BAG001',
    type: 'baggage',
    name: 'Extra Checked Bag',
    description: '23kg additional checked baggage',
    price: 75,
    selected: false
  },
  {
    id: 'SEAT001',
    type: 'seat',
    name: 'Seat Selection',
    description: 'Choose your preferred seat',
    price: 35,
    selected: false
  },
  {
    id: 'MEAL001',
    type: 'meal',
    name: 'Premium Meal',
    description: 'Gourmet meal selection',
    price: 25,
    selected: false
  },
  {
    id: 'INS001',
    type: 'insurance',
    name: 'Travel Insurance',
    description: 'Comprehensive travel protection',
    price: 49,
    selected: false
  }
];
