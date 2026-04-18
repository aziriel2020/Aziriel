'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Crown, Check, X, Star, Plane, Bell, Shield, Zap, Gift,
  CreditCard, Users, Globe, Lock, Unlock, ArrowRight,
  Sparkles, Award, TrendingUp, Mail, MessageCircle
} from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Get started with basic flight deals',
    features: [
      { text: 'Limited flight deals', included: true },
      { text: '3 deals per week', included: true },
      { text: 'Email newsletter', included: true },
      { text: 'Basic search', included: true },
      { text: 'Community access', included: true },
      { text: 'All destinations', included: false },
      { text: 'Price alerts', included: false },
      { text: 'Premium deals', included: false },
      { text: 'Mistake fares', included: false },
      { text: 'Priority support', included: false }
    ],
    cta: 'Current Plan',
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 1,
    trialPrice: true,
    regularPrice: 48,
    period: 'year',
    description: 'Unlock all deals and save hundreds',
    features: [
      { text: 'Unlimited flight deals', included: true },
      { text: 'All destinations worldwide', included: true },
      { text: 'Instant deal notifications', included: true },
      { text: 'Advanced search & filters', included: true },
      { text: 'Community access', included: true },
      { text: 'Price drop alerts', included: true },
      { text: 'Premium-only deals', included: true },
      { text: 'Mistake fares access', included: true },
      { text: 'Departure airport selection', included: true },
      { text: 'Priority email support', included: true }
    ],
    cta: 'Start 7-Day Trial',
    popular: true
  },
  {
    id: 'premium-plus',
    name: 'Premium+',
    price: 99,
    period: 'year',
    description: 'For the ultimate deal hunter',
    features: [
      { text: 'Everything in Premium', included: true },
      { text: 'VIP concierge service', included: true },
      { text: 'Exclusive flash sales', included: true },
      { text: 'Personal deal finder', included: true },
      { text: 'Business class deals', included: true },
      { text: 'Hotel deal bundles', included: true },
      { text: 'Family plan (up to 5)', included: true },
      { text: 'Phone support', included: true },
      { text: 'Early access to all deals', included: true },
      { text: 'Annual travel credit $50', included: true }
    ],
    cta: 'Get Premium+',
    popular: false
  }
];

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    location: 'London, UK',
    saved: '$1,240',
    text: 'Found flights to Tokyo for £380 return when the normal price was £900. Skyward paid for itself 100x over!',
    rating: 5
  },
  {
    name: 'James K.',
    location: 'New York, USA',
    saved: '$890',
    text: 'The mistake fare alerts alone are worth it. Caught a $200 flight to Paris that was normally $700.',
    rating: 5
  },
  {
    name: 'Maria G.',
    location: 'Madrid, Spain',
    saved: '$650',
    text: 'I travel 4-5 times a year and Skyward helps me save on every single trip. Best investment ever.',
    rating: 5
  }
];

const STATS = [
  { value: '5.2M+', label: 'Happy Members' },
  { value: '$47M+', label: 'Saved by Members' },
  { value: '150+', label: 'Deals per Month' },
  { value: '4.9/5', label: 'App Store Rating' }
];

export default function PremiumPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPlan, setSelectedPlan] = useState('premium');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Skyward</span>
          </Link>

          <Link href="/login" className="text-white/80 hover:text-white">
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-full text-amber-400 mb-6">
            <Crown className="w-5 h-5" />
            <span className="font-medium">Premium Membership</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Incredible</span> Flight Deals
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join 5.2 million travelers saving an average of $500 per trip with our exclusive flight deals, mistake fares, and price alerts.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                  {stat.value}
                </p>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pricing Toggle */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-12">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-gray-900'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full font-medium transition flex items-center gap-2 ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-gray-900'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                Save 40%
              </span>
            </button>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PLANS.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-3xl p-8 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-semibold rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

                  <div className="flex items-baseline justify-center gap-2">
                    {plan.trialPrice ? (
                      <>
                        <span className="text-5xl font-bold text-white">€{plan.price}</span>
                        <span className="text-gray-400">for 7 days</span>
                      </>
                    ) : (
                      <>
                        <span className="text-5xl font-bold text-white">
                          {plan.price === 0 ? 'Free' : `€${plan.price}`}
                        </span>
                        {plan.price > 0 && <span className="text-gray-400">/{plan.period}</span>}
                      </>
                    )}
                  </div>

                  {plan.trialPrice && (
                    <p className="text-sm text-gray-400 mt-2">
                      Then €{plan.regularPrice}/year. Cancel anytime.
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-gray-300' : 'text-gray-600'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full py-4 rounded-xl font-semibold transition ${
                    plan.popular
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90'
                      : plan.id === 'free'
                      ? 'bg-white/10 text-gray-400 cursor-default'
                      : 'bg-white text-gray-900 hover:bg-gray-100'
                  }`}
                  disabled={plan.id === 'free'}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Travelers Love Skyward Premium
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Instant Alerts',
                description: 'Get notified the moment we find a great deal - before prices go up.'
              },
              {
                icon: TrendingUp,
                title: 'Mistake Fares',
                description: 'Access airline pricing errors that save you 50-90% on flights.'
              },
              {
                icon: Globe,
                title: '500+ Destinations',
                description: 'Deals to every corner of the world from your departure city.'
              },
              {
                icon: Bell,
                title: 'Price Drop Alerts',
                description: "Set alerts for routes you want and we'll notify you when prices drop."
              },
              {
                icon: Shield,
                title: 'Booking Guarantee',
                description: 'Every deal is verified to ensure you can actually book it.'
              },
              {
                icon: Gift,
                title: 'Member Perks',
                description: 'Exclusive discounts on hotels, car rentals, and travel gear.'
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Real Savings from Real Members
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-white/10 rounded-2xl"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"{testimonial.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Saved</p>
                    <p className="text-xl font-bold text-green-400">{testimonial.saved}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'What happens after my trial ends?',
                a: "After your 7-day trial, you'll be charged €48/year for Premium. You can cancel anytime during your trial and won't be charged."
              },
              {
                q: 'How much can I really save?',
                a: 'Our members save an average of $500 per trip. Some mistake fares can save you 50-90% compared to regular prices!'
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes! You can cancel your membership at any time. If you cancel during your trial, you won\'t be charged at all.'
              },
              {
                q: 'What airports do you cover?',
                a: 'We cover major airports worldwide. You can select your departure airports and get deals specifically from those locations.'
              },
              {
                q: 'How do you find these deals?',
                a: 'Our team of expert deal hunters use advanced tools and relationships with airlines to find the best deals before anyone else.'
              }
            ].map((faq, i) => (
              <details
                key={i}
                className="group p-6 bg-white/5 rounded-2xl border border-white/10"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-semibold text-white">{faq.q}</span>
                  <span className="text-cyan-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="mt-4 text-gray-400">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl border border-cyan-500/30">
            <Crown className="w-16 h-16 text-amber-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Saving?
            </h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              Join 5.2 million members and start your free 7-day trial today. No risk, cancel anytime.
            </p>
            <Link
              href="/checkout?plan=premium"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-sm text-gray-400 mt-4">
              €1 for 7 days, then €48/year. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Skyward Travels. All rights reserved.</p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/support" className="hover:text-white">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
