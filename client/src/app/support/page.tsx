'use client';

/**
 * SUPPORT / HELP CENTER PAGE
 * FAQs, contact form, live chat
 */

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  Search,
  ChevronDown,
  ChevronRight,
  Plane,
  Hotel,
  CreditCard,
  User,
  Shield,
  Clock,
  Send,
  Bot,
  Check,
  ExternalLink,
  Headphones
} from 'lucide-react';

const FAQ_CATEGORIES = [
  {
    id: 'booking',
    name: 'Booking & Reservations',
    icon: Plane,
    faqs: [
      {
        question: 'How do I make a booking?',
        answer: 'Simply search for your desired flight or hotel on our homepage, select your preferred option, enter passenger/guest details, and complete payment. You\'ll receive a confirmation email immediately.'
      },
      {
        question: 'Can I book for someone else?',
        answer: 'Yes, you can book for other travelers. Just ensure you enter the correct passenger details as they appear on their travel documents. The booking confirmation can be sent to any email address.'
      },
      {
        question: 'How do I add special requests to my booking?',
        answer: 'During the booking process, you\'ll find a "Special Requests" field where you can add dietary requirements, accessibility needs, or other preferences. You can also contact our support team after booking.'
      }
    ]
  },
  {
    id: 'changes',
    name: 'Changes & Cancellations',
    icon: Clock,
    faqs: [
      {
        question: 'How do I cancel my booking?',
        answer: 'Go to "My Trips" in your dashboard, select the booking you wish to cancel, and click "Cancel Booking". Refund policies vary based on fare type and time until departure.'
      },
      {
        question: 'Can I change my travel dates?',
        answer: 'Date changes are possible for most bookings, subject to fare rules and availability. Visit "My Trips", select your booking, and click "Modify". Additional fees may apply.'
      },
      {
        question: 'What is your refund policy?',
        answer: 'Refund eligibility depends on your fare type. Flexible fares are fully refundable, standard fares may have fees, and light fares are typically non-refundable. Check your booking details for specific terms.'
      }
    ]
  },
  {
    id: 'payment',
    name: 'Payment & Pricing',
    icon: CreditCard,
    faqs: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers for select markets.'
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Absolutely. We use 256-bit SSL encryption and are PCI DSS compliant. Your payment data is never stored on our servers and all transactions are processed through secure payment gateways.'
      },
      {
        question: 'Why was my card declined?',
        answer: 'Card declines can occur due to insufficient funds, incorrect details, security holds, or international transaction blocks. Contact your bank or try an alternative payment method.'
      }
    ]
  },
  {
    id: 'account',
    name: 'Account & Loyalty',
    icon: User,
    faqs: [
      {
        question: 'How do I create an account?',
        answer: 'Click "Sign Up" on the homepage, enter your email and create a password, or sign up using Google, Apple, or Facebook. Verify your email to activate your account.'
      },
      {
        question: 'How does the loyalty program work?',
        answer: 'Earn points on every booking: 1 point per $1 spent. Points can be redeemed for discounts, upgrades, or free bookings. Progress through tiers (Bronze, Silver, Gold, Platinum, Ambassador) for exclusive benefits.'
      },
      {
        question: 'I forgot my password. What should I do?',
        answer: 'Click "Forgot Password" on the login page, enter your email, and follow the reset link sent to your inbox. The link expires in 24 hours for security.'
      }
    ]
  }
];

const CONTACT_OPTIONS = [
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Chat with our support team',
    availability: 'Available 24/7',
    action: 'Start Chat',
    color: 'blue'
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: '+1 (800) 123-4567',
    availability: 'Mon-Fri 8AM-10PM EST',
    action: 'Call Now',
    color: 'green'
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'support@skywardtravels.com',
    availability: 'Response within 24 hours',
    action: 'Send Email',
    color: 'purple'
  }
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('booking');
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    bookingRef: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setTimeout(() => {
      setFormSubmitted(true);
    }, 1000);
  };

  const filteredFaqs = searchQuery
    ? FAQ_CATEGORIES.flatMap(cat =>
        cat.faqs.filter(faq =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(faq => ({ ...faq, category: cat.name }))
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">How can we help?</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Find answers to common questions or contact our 24/7 support team
            </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help..."
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="max-w-2xl mx-auto mt-4 text-left">
                {filteredFaqs.length > 0 ? (
                  <div className="bg-gray-800/90 backdrop-blur-md rounded-xl border border-white/10 divide-y divide-white/10">
                    {filteredFaqs.slice(0, 5).map((faq, index) => (
                      <div key={index} className="p-4 hover:bg-white/5 cursor-pointer">
                        <p className="text-white font-medium">{faq.question}</p>
                        <p className="text-gray-400 text-sm mt-1">{faq.category}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-800/90 backdrop-blur-md rounded-xl border border-white/10 p-4 text-center">
                    <p className="text-gray-400">No results found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Contact Options */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CONTACT_OPTIONS.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gray-800/50 rounded-2xl p-6 border border-white/10 hover:border-${option.color}-500/50 transition-all text-center`}
              >
                <div className={`w-14 h-14 bg-${option.color}-500/20 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <option.icon className={`w-7 h-7 text-${option.color}-400`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{option.title}</h3>
                <p className="text-white mb-1">{option.description}</p>
                <p className="text-gray-500 text-sm mb-4">{option.availability}</p>
                <button className={`w-full py-3 bg-${option.color}-600 hover:bg-${option.color}-700 rounded-xl text-white font-semibold transition-colors`}>
                  {option.action}
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Category Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 rounded-xl border border-white/10 p-2 space-y-1">
                {FAQ_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <category.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ List */}
            <div className="lg:col-span-3 space-y-4">
              {FAQ_CATEGORIES.find(c => c.id === activeCategory)?.faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 rounded-xl border border-white/10 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === `${activeCategory}-${index}` ? null : `${activeCategory}-${index}`)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="text-white font-medium pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                        expandedFaq === `${activeCategory}-${index}` ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedFaq === `${activeCategory}-${index}` && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 text-gray-400">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="mb-16">
          <div className="bg-gray-800/50 rounded-2xl border border-white/10 p-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Still need help?</h2>
                <p className="text-gray-400">Send us a message and we'll get back to you within 24 hours</p>
              </div>

              {formSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-400 mb-6">We'll get back to you as soon as possible</p>
                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({ name: '', email: '', subject: '', bookingRef: '', message: '' });
                    }}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Your Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Subject</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="" className="bg-gray-800">Select a topic</option>
                        <option value="booking" className="bg-gray-800">Booking Issue</option>
                        <option value="refund" className="bg-gray-800">Refund Request</option>
                        <option value="change" className="bg-gray-800">Change Booking</option>
                        <option value="complaint" className="bg-gray-800">Complaint</option>
                        <option value="feedback" className="bg-gray-800">Feedback</option>
                        <option value="other" className="bg-gray-800">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Booking Reference (Optional)</label>
                      <input
                        type="text"
                        value={formData.bookingRef}
                        onChange={(e) => setFormData({ ...formData, bookingRef: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="SKY123456"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Message</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={5}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Describe your issue in detail..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'My Bookings', href: '/dashboard', icon: Plane },
              { title: 'AI Assistant', href: '/assistant', icon: Bot },
              { title: 'Terms of Service', href: '/terms', icon: Shield },
              { title: 'Privacy Policy', href: '/privacy', icon: Shield }
            ].map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-4 border border-white/10 hover:border-blue-500/50 transition-all"
              >
                <link.icon className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">{link.title}</span>
                <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
