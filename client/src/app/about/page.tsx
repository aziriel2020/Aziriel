'use client';

/**
 * ABOUT PAGE
 * Company information
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Plane,
  Globe,
  Users,
  Award,
  Shield,
  Heart,
  Target,
  TrendingUp,
  MapPin,
  Building2,
  Mail,
  Linkedin,
  Twitter
} from 'lucide-react';

const STATS = [
  { value: '10M+', label: 'Travelers Served' },
  { value: '195', label: 'Countries' },
  { value: '500+', label: 'Airline Partners' },
  { value: '2M+', label: 'Hotels' }
];

const VALUES = [
  {
    icon: Heart,
    title: 'Customer First',
    description: 'Your journey is our priority. We\'re dedicated to making travel accessible, enjoyable, and hassle-free.'
  },
  {
    icon: Shield,
    title: 'Trust & Transparency',
    description: 'No hidden fees, no surprises. We believe in honest pricing and clear communication.'
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'From local getaways to international adventures, we connect you to every corner of the world.'
  },
  {
    icon: TrendingUp,
    title: 'Innovation',
    description: 'Leveraging AI and cutting-edge technology to deliver personalized travel experiences.'
  }
];

const TEAM = [
  { name: 'Sarah Chen', role: 'CEO & Co-Founder', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Marcus Johnson', role: 'CTO & Co-Founder', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Elena Rodriguez', role: 'Head of Product', image: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { name: 'David Kim', role: 'Head of Partnerships', image: 'https://randomuser.me/api/portraits/men/75.jpg' }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920"
            alt="Travel"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/80 to-gray-900" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full text-blue-400 mb-6">
              <Plane className="w-5 h-5" />
              <span className="font-medium">Our Story</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Making Travel<br />Dreams Reality
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Founded in 2020, Skyward Travels was born from a simple idea: travel booking should be easy,
              affordable, and enjoyable. Today, we help millions of travelers explore the world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">{stat.value}</p>
                <p className="text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-gray-300 text-lg mb-6">
                We're on a mission to democratize travel. By combining the best technology with deep
                industry partnerships, we make it possible for everyone to explore the world at the
                best prices.
              </p>
              <p className="text-gray-300 text-lg mb-6">
                Our AI-powered platform searches across hundreds of airlines and millions of hotels
                to find you the perfect trip, while our loyalty program rewards you every step of the way.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">Our Goal</p>
                  <p className="text-gray-400">Help 100 million people travel by 2030</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"
                alt="Travel"
                className="rounded-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-blue-600 rounded-2xl p-6 text-white">
                <p className="text-3xl font-bold">98%</p>
                <p className="text-blue-200">Customer Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              These principles guide everything we do, from product development to customer service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-2xl p-6 border border-white/10"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Leadership Team</h2>
            <p className="text-gray-400">Meet the people driving our mission forward</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-blue-500/30">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-white font-semibold">{member.name}</h3>
                <p className="text-gray-400 text-sm">{member.role}</p>
                <div className="flex justify-center gap-3 mt-3">
                  <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href="#" className="text-gray-500 hover:text-blue-400 transition-colors">
                    <Twitter className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Offices */}
      <section className="py-20 bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Offices</h2>
            <p className="text-gray-400">Find us around the world</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { city: 'San Francisco', country: 'USA', type: 'Headquarters' },
              { city: 'London', country: 'UK', type: 'European HQ' },
              { city: 'Singapore', country: 'Singapore', type: 'Asia Pacific HQ' }
            ].map((office) => (
              <div key={office.city} className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 text-sm">{office.type}</span>
                </div>
                <h3 className="text-xl font-semibold text-white">{office.city}</h3>
                <p className="text-gray-400">{office.country}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Journey</h2>
          <p className="text-gray-400 mb-8">
            Whether you're looking to travel or join our team, we'd love to hear from you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-colors"
            >
              Start Exploring
            </Link>
            <Link
              href="/support"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
