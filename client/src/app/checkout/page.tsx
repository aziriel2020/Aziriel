'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Plane, CreditCard, Lock, Check, ChevronLeft, Shield,
  User, Mail, Phone, Calendar, Users, Briefcase, AlertCircle,
  Clock, MapPin, ArrowRight, Loader2, Sparkles, Gift
} from 'lucide-react';

interface PassengerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  passportNumber: string;
  passportExpiry: string;
  nationality: string;
}

interface PaymentInfo {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  saveCard: boolean;
}

const DEMO_BOOKING = {
  type: 'flight',
  flight: {
    outbound: {
      airline: 'Delta Air Lines',
      flightNumber: 'DL 401',
      departure: { code: 'JFK', city: 'New York', time: '08:00', date: '2024-04-20' },
      arrival: { code: 'LAX', city: 'Los Angeles', time: '11:30', date: '2024-04-20' },
      duration: '6h 30m',
      class: 'Economy'
    },
    return: {
      airline: 'Delta Air Lines',
      flightNumber: 'DL 1847',
      departure: { code: 'LAX', city: 'Los Angeles', time: '19:30', date: '2024-04-27' },
      arrival: { code: 'JFK', city: 'New York', time: '03:15', date: '2024-04-28' },
      duration: '5h 45m',
      class: 'Economy'
    }
  },
  pricing: {
    baseFare: 329,
    taxes: 45,
    fees: 12,
    baggage: 35,
    insurance: 0,
    total: 421,
    currency: 'USD',
    passengers: 1
  },
  loyaltyPoints: 421
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [passengers, setPassengers] = useState<PassengerInfo[]>([{
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    passportNumber: '',
    passportExpiry: '',
    nationality: ''
  }]);

  const [payment, setPayment] = useState<PaymentInfo>({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  });

  const [extras, setExtras] = useState({
    baggage: false,
    insurance: false,
    seatSelection: false,
    priorityBoarding: false
  });

  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [applyPromoCode, setApplyPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const booking = DEMO_BOOKING;

  const calculateTotal = () => {
    let total = booking.pricing.baseFare + booking.pricing.taxes + booking.pricing.fees;
    if (extras.baggage) total += 35;
    if (extras.insurance) total += 29;
    if (extras.seatSelection) total += 15;
    if (extras.priorityBoarding) total += 12;
    if (promoApplied) total -= 20;
    if (useLoyaltyPoints) total -= 50;
    return Math.max(0, total);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirect to confirmation
      router.push('/booking/confirmation?id=SKY' + Date.now().toString(36).toUpperCase());
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updatePassenger = (index: number, field: keyof PassengerInfo, value: string) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => step > 1 ? setStep(step - 1) : router.back()}
                className="p-2 hover:bg-slate-800 rounded-lg transition"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Skyward</span>
              </Link>
            </div>

            {/* Progress Steps */}
            <div className="hidden md:flex items-center gap-4">
              {['Passengers', 'Extras', 'Payment'].map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step > i + 1
                      ? 'bg-green-500 text-white'
                      : step === i + 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-gray-400'
                  }`}>
                    {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={step === i + 1 ? 'text-white' : 'text-gray-400'}>
                    {label}
                  </span>
                  {i < 2 && <div className="w-8 h-px bg-slate-700" />}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <Lock className="w-4 h-4" />
              <span className="text-sm">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Passengers */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-6">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" />
                    Passenger Details
                  </h2>

                  {passengers.map((passenger, index) => (
                    <div key={index} className="space-y-4 mb-6">
                      {passengers.length > 1 && (
                        <h3 className="text-lg font-semibold text-white">
                          Passenger {index + 1}
                        </h3>
                      )}

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">First Name *</label>
                          <input
                            type="text"
                            value={passenger.firstName}
                            onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="As on passport"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Last Name *</label>
                          <input
                            type="text"
                            value={passenger.lastName}
                            onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="As on passport"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Email *</label>
                          <input
                            type="email"
                            value={passenger.email}
                            onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="your@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Phone *</label>
                          <input
                            type="tel"
                            value={passenger.phone}
                            onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Date of Birth *</label>
                          <input
                            type="date"
                            value={passenger.dateOfBirth}
                            onChange={(e) => updatePassenger(index, 'dateOfBirth', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Gender *</label>
                          <select
                            value={passenger.gender}
                            onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Nationality *</label>
                          <input
                            type="text"
                            value={passenger.nationality}
                            onChange={(e) => updatePassenger(index, 'nationality', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="United States"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Passport Number</label>
                          <input
                            type="text"
                            value={passenger.passportNumber}
                            onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Optional for domestic"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Passport Expiry</label>
                          <input
                            type="date"
                            value={passenger.passportExpiry}
                            onChange={(e) => updatePassenger(index, 'passportExpiry', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition"
                  >
                    Continue to Extras
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Extras */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-6">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-blue-400" />
                    Enhance Your Trip
                  </h2>

                  <div className="space-y-4">
                    {[
                      { key: 'baggage', title: 'Checked Baggage', desc: '23kg checked bag', price: 35, icon: Briefcase },
                      { key: 'insurance', title: 'Travel Insurance', desc: 'Comprehensive coverage', price: 29, icon: Shield },
                      { key: 'seatSelection', title: 'Seat Selection', desc: 'Choose your preferred seat', price: 15, icon: Users },
                      { key: 'priorityBoarding', title: 'Priority Boarding', desc: 'Board first', price: 12, icon: Sparkles }
                    ].map(extra => (
                      <label
                        key={extra.key}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                          extras[extra.key as keyof typeof extras]
                            ? 'bg-blue-500/20 border-blue-500'
                            : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            extras[extra.key as keyof typeof extras]
                              ? 'bg-blue-500'
                              : 'bg-slate-600'
                          }`}>
                            <extra.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{extra.title}</p>
                            <p className="text-sm text-gray-400">{extra.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-white">+${extra.price}</span>
                          <input
                            type="checkbox"
                            checked={extras[extra.key as keyof typeof extras]}
                            onChange={(e) => setExtras(prev => ({ ...prev, [extra.key]: e.target.checked }))}
                            className="w-5 h-5 rounded border-slate-500 bg-slate-700 text-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep(3)}
                    className="w-full mt-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition"
                  >
                    Continue to Payment
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-6">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    Payment Details
                  </h2>

                  {/* Promo Code */}
                  <div className="mb-6 p-4 bg-slate-700/50 rounded-xl">
                    <label className="block text-sm text-gray-400 mb-2">Promo Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={applyPromoCode}
                        onChange={(e) => setApplyPromoCode(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1 px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => applyPromoCode && setPromoApplied(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      >
                        Apply
                      </button>
                    </div>
                    {promoApplied && (
                      <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Promo code applied! -$20
                      </p>
                    )}
                  </div>

                  {/* Loyalty Points */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-xl">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="font-semibold text-white">Use Loyalty Points</p>
                          <p className="text-sm text-gray-400">You have 5,000 points ($50 value)</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={useLoyaltyPoints}
                        onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                        className="w-5 h-5 rounded border-amber-500 bg-slate-700 text-amber-500 focus:ring-amber-500"
                      />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={payment.cardNumber}
                        onChange={(e) => setPayment(prev => ({ ...prev, cardNumber: e.target.value }))}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={payment.cardName}
                        onChange={(e) => setPayment(prev => ({ ...prev, cardName: e.target.value }))}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={payment.expiryDate}
                          onChange={(e) => setPayment(prev => ({ ...prev, expiryDate: e.target.value }))}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">CVV</label>
                        <input
                          type="text"
                          value={payment.cvv}
                          onChange={(e) => setPayment(prev => ({ ...prev, cvv: e.target.value }))}
                          placeholder="123"
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={payment.saveCard}
                        onChange={(e) => setPayment(prev => ({ ...prev, saveCard: e.target.checked }))}
                        className="w-4 h-4 rounded border-slate-500 bg-slate-700 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-gray-400 text-sm">Save card for future purchases</span>
                    </label>
                  </div>

                  {error && (
                    <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400">
                      <AlertCircle className="w-5 h-5" />
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full mt-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Pay ${calculateTotal()}
                      </>
                    )}
                  </button>

                  <p className="text-center text-gray-500 text-sm mt-4 flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4" />
                    Secured by Stripe. Your payment info is encrypted.
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-6 sticky top-28">
              <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>

              {/* Flight Info */}
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-slate-700/50 rounded-xl">
                  <p className="text-sm text-gray-400 mb-2">Outbound Flight</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">
                        {booking.flight.outbound.departure.code} → {booking.flight.outbound.arrival.code}
                      </p>
                      <p className="text-sm text-gray-400">
                        {booking.flight.outbound.date} · {booking.flight.outbound.departure.time}
                      </p>
                    </div>
                    <Plane className="w-5 h-5 text-blue-400" />
                  </div>
                </div>

                {booking.flight.return && (
                  <div className="p-4 bg-slate-700/50 rounded-xl">
                    <p className="text-sm text-gray-400 mb-2">Return Flight</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">
                          {booking.flight.return.departure.code} → {booking.flight.return.arrival.code}
                        </p>
                        <p className="text-sm text-gray-400">
                          {booking.flight.return.date} · {booking.flight.return.departure.time}
                        </p>
                      </div>
                      <Plane className="w-5 h-5 text-blue-400 rotate-180" />
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Base Fare</span>
                  <span>${booking.pricing.baseFare}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Taxes & Fees</span>
                  <span>${booking.pricing.taxes + booking.pricing.fees}</span>
                </div>
                {extras.baggage && (
                  <div className="flex justify-between text-gray-400">
                    <span>Checked Baggage</span>
                    <span>$35</span>
                  </div>
                )}
                {extras.insurance && (
                  <div className="flex justify-between text-gray-400">
                    <span>Travel Insurance</span>
                    <span>$29</span>
                  </div>
                )}
                {extras.seatSelection && (
                  <div className="flex justify-between text-gray-400">
                    <span>Seat Selection</span>
                    <span>$15</span>
                  </div>
                )}
                {extras.priorityBoarding && (
                  <div className="flex justify-between text-gray-400">
                    <span>Priority Boarding</span>
                    <span>$12</span>
                  </div>
                )}
                {promoApplied && (
                  <div className="flex justify-between text-green-400">
                    <span>Promo Discount</span>
                    <span>-$20</span>
                  </div>
                )}
                {useLoyaltyPoints && (
                  <div className="flex justify-between text-amber-400">
                    <span>Loyalty Points</span>
                    <span>-$50</span>
                  </div>
                )}
                <div className="h-px bg-slate-700" />
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span>${calculateTotal()}</span>
                </div>
              </div>

              {/* Loyalty Points Earned */}
              <div className="p-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 font-semibold">Earn Points</span>
                </div>
                <p className="text-white">
                  You'll earn <span className="font-bold">{calculateTotal()}</span> Skyward Points
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
