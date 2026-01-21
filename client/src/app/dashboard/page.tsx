'use client';

/**
 * USER DASHBOARD
 * Complete travel dashboard with bookings, profile, loyalty, and more
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane,
  Building2,
  Calendar,
  MapPin,
  Star,
  Gift,
  CreditCard,
  User,
  Settings,
  Bell,
  Heart,
  Clock,
  TrendingUp,
  Award,
  Crown,
  ChevronRight,
  Download,
  Share2,
  MoreHorizontal,
  Search,
  Plus,
  ArrowRight,
  ArrowUpRight,
  Check,
  AlertCircle,
  Sparkles,
  Ticket,
  Wallet,
  Shield,
  LogOut
} from 'lucide-react';

// Types
interface Booking {
  id: string;
  type: 'flight' | 'hotel' | 'package';
  status: 'upcoming' | 'completed' | 'cancelled';
  reference: string;
  title: string;
  subtitle: string;
  date: string;
  image?: string;
  price: number;
}

interface LoyaltyInfo {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'ambassador';
  points: number;
  pointsToNextTier: number;
  nextTier: string;
  memberSince: string;
  lifetimePoints: number;
}

interface Notification {
  id: string;
  type: 'info' | 'promo' | 'booking' | 'alert';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'bookings', label: 'My Trips', icon: Ticket },
  { id: 'loyalty', label: 'Rewards', icon: Gift },
  { id: 'saved', label: 'Saved', icon: Heart },
  { id: 'settings', label: 'Settings', icon: Settings }
];

const TIER_COLORS = {
  bronze: 'from-amber-700 to-amber-500',
  silver: 'from-gray-400 to-gray-300',
  gold: 'from-yellow-500 to-yellow-300',
  platinum: 'from-purple-500 to-purple-300',
  ambassador: 'from-black to-gray-700'
};

const TIER_ICONS = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
  ambassador: '👑'
};

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@email.com',
    avatar: '',
    memberSince: 'January 2023'
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyInfo | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [savedItems, setSavedItems] = useState<any[]>([]);

  useEffect(() => {
    // Simulate data fetch
    setTimeout(() => {
      setBookings(mockBookings);
      setLoyalty(mockLoyalty);
      setNotifications(mockNotifications);
      setSavedItems(mockSavedItems);
      setLoading(false);
    }, 500);
  }, []);

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                Skyward
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <p className="text-white font-medium text-sm">{user.name}</p>
                  <p className="text-gray-400 text-xs">{loyalty?.tier.toUpperCase()} Member</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-2">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}

              <hr className="my-2 border-white/10" />

              <button
                onClick={() => router.push('/')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </nav>

            {/* Quick Book */}
            <div className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4">
              <h3 className="text-white font-semibold mb-2">Ready to travel?</h3>
              <p className="text-blue-100 text-sm mb-4">Book your next adventure now!</p>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full py-2 bg-white rounded-xl text-blue-600 font-semibold hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Booking
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Welcome Banner */}
                  <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl border border-blue-500/30 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                          Welcome back, {user.name.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-gray-300">
                          You have {upcomingBookings.length} upcoming trip{upcomingBookings.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${TIER_COLORS[loyalty?.tier || 'bronze']}`}>
                        <span className="text-white font-semibold flex items-center gap-2">
                          {TIER_ICONS[loyalty?.tier || 'bronze']} {loyalty?.tier.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      icon={<Sparkles className="w-5 h-5" />}
                      label="Points Balance"
                      value={loyalty?.points.toLocaleString() || '0'}
                      color="from-yellow-500 to-orange-500"
                    />
                    <StatCard
                      icon={<Ticket className="w-5 h-5" />}
                      label="Total Trips"
                      value={bookings.length.toString()}
                      color="from-blue-500 to-cyan-500"
                    />
                    <StatCard
                      icon={<Heart className="w-5 h-5" />}
                      label="Saved Items"
                      value={savedItems.length.toString()}
                      color="from-pink-500 to-rose-500"
                    />
                    <StatCard
                      icon={<Award className="w-5 h-5" />}
                      label="Member Since"
                      value={user.memberSince.split(' ')[1]}
                      color="from-purple-500 to-indigo-500"
                    />
                  </div>

                  {/* Upcoming Trips */}
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        Upcoming Trips
                      </h2>
                      <button
                        onClick={() => setActiveTab('bookings')}
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                      >
                        View All <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {upcomingBookings.length === 0 ? (
                      <div className="text-center py-8">
                        <Plane className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 mb-4">No upcoming trips</p>
                        <Link
                          href="/"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-sm"
                        >
                          <Plus className="w-4 h-4" /> Book a Trip
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {upcomingBookings.slice(0, 3).map(booking => (
                          <BookingCard key={booking.id} booking={booking} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Loyalty Progress */}
                  {loyalty && (
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                          <Crown className="w-5 h-5 text-yellow-400" />
                          Rewards Progress
                        </h2>
                        <button
                          onClick={() => setActiveTab('loyalty')}
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                        >
                          View Benefits <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${TIER_COLORS[loyalty.tier]} flex items-center justify-center text-4xl`}>
                          {TIER_ICONS[loyalty.tier]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{loyalty.tier.toUpperCase()}</span>
                            <span className="text-gray-400 text-sm">
                              {loyalty.pointsToNextTier.toLocaleString()} pts to {loyalty.nextTier}
                            </span>
                          </div>
                          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${TIER_COLORS[loyalty.tier]} transition-all`}
                              style={{ width: `${Math.min(100, (loyalty.points / (loyalty.points + loyalty.pointsToNextTier)) * 100)}%` }}
                            />
                          </div>
                          <p className="text-gray-400 text-sm mt-2">
                            {loyalty.points.toLocaleString()} points earned
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Notifications */}
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-400" />
                      Recent Activity
                    </h2>
                    <div className="space-y-3">
                      {notifications.slice(0, 4).map(notification => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-xl ${notification.read ? 'bg-white/5' : 'bg-blue-500/10 border border-blue-500/30'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-white font-medium">{notification.title}</p>
                              <p className="text-gray-400 text-sm">{notification.message}</p>
                            </div>
                            <span className="text-gray-500 text-xs">{notification.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Bookings Tab */}
              {activeTab === 'bookings' && (
                <motion.div
                  key="bookings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">My Trips</h1>
                    <Link
                      href="/"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-sm"
                    >
                      <Plus className="w-4 h-4" /> Book New Trip
                    </Link>
                  </div>

                  {/* Upcoming */}
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Upcoming ({upcomingBookings.length})</h2>
                    {upcomingBookings.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">No upcoming trips</p>
                    ) : (
                      <div className="space-y-4">
                        {upcomingBookings.map(booking => (
                          <BookingCard key={booking.id} booking={booking} detailed />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Past */}
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Past Trips ({pastBookings.length})</h2>
                    {pastBookings.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">No past trips</p>
                    ) : (
                      <div className="space-y-4">
                        {pastBookings.map(booking => (
                          <BookingCard key={booking.id} booking={booking} detailed />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Loyalty Tab */}
              {activeTab === 'loyalty' && loyalty && (
                <motion.div
                  key="loyalty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h1 className="text-2xl font-bold text-white">Skyward Rewards</h1>

                  {/* Membership Card */}
                  <div className={`bg-gradient-to-r ${TIER_COLORS[loyalty.tier]} rounded-2xl p-6 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                          <Plane className="w-8 h-8" />
                          <span className="text-xl font-bold">Skyward</span>
                        </div>
                        <span className="text-4xl">{TIER_ICONS[loyalty.tier]}</span>
                      </div>
                      <div className="mb-6">
                        <p className="text-white/80 text-sm">Member</p>
                        <p className="text-2xl font-bold">{user.name}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/80 text-sm">Points Balance</p>
                          <p className="text-3xl font-bold">{loyalty.points.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/80 text-sm">Status</p>
                          <p className="text-xl font-bold">{loyalty.tier.toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress to Next Tier */}
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Progress to {loyalty.nextTier}</h2>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">{loyalty.points.toLocaleString()} points</span>
                        <span className="text-gray-400">{(loyalty.points + loyalty.pointsToNextTier).toLocaleString()} points</span>
                      </div>
                      <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${TIER_COLORS[loyalty.tier]}`}
                          style={{ width: `${(loyalty.points / (loyalty.points + loyalty.pointsToNextTier)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-gray-400">
                      Earn {loyalty.pointsToNextTier.toLocaleString()} more points to reach {loyalty.nextTier} status
                    </p>
                  </div>

                  {/* Tier Benefits */}
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Your Benefits</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getTierBenefits(loyalty.tier).map((benefit, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                          <Check className="w-5 h-5 text-green-400" />
                          <span className="text-gray-300">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Points History */}
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Recent Points Activity</h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <Plus className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="text-white">Flight to Paris</p>
                            <p className="text-gray-400 text-sm">March 15, 2024</p>
                          </div>
                        </div>
                        <span className="text-green-400 font-semibold">+2,578 pts</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <Plus className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="text-white">Hotel Booking - Tokyo</p>
                            <p className="text-gray-400 text-sm">February 28, 2024</p>
                          </div>
                        </div>
                        <span className="text-green-400 font-semibold">+1,890 pts</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Gift className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-white">Welcome Bonus</p>
                            <p className="text-gray-400 text-sm">January 15, 2024</p>
                          </div>
                        </div>
                        <span className="text-green-400 font-semibold">+5,000 pts</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Saved Tab */}
              {activeTab === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h1 className="text-2xl font-bold text-white">Saved Items</h1>

                  {savedItems.length === 0 ? (
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
                      <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No saved items yet</h3>
                      <p className="text-gray-400 mb-6">Save flights and hotels you like to compare later</p>
                      <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white"
                      >
                        Start Exploring <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedItems.map(item => (
                        <div key={item.id} className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                            <button className="absolute top-3 right-3 p-2 bg-white/20 rounded-full text-white hover:bg-white/30">
                              <Heart className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                          <div className="p-4">
                            <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                            <p className="text-gray-400 text-sm mb-3">{item.subtitle}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-white">${item.price}</span>
                              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm">
                                Book Now
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h1 className="text-2xl font-bold text-white">Settings</h1>

                  {/* Profile */}
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-400" />
                      Profile Information
                    </h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">First Name</label>
                          <input
                            type="text"
                            defaultValue="John"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                          <input
                            type="text"
                            defaultValue="Doe"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input
                          type="email"
                          defaultValue="john.doe@email.com"
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Phone</label>
                        <input
                          type="tel"
                          defaultValue="+1 234 567 8900"
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                        />
                      </div>
                      <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium">
                        Save Changes
                      </button>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                      Payment Methods
                    </h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">VISA</span>
                          </div>
                          <div>
                            <p className="text-white">•••• •••• •••• 4242</p>
                            <p className="text-gray-400 text-sm">Expires 12/26</p>
                          </div>
                        </div>
                        <button className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                      </div>
                      <button className="w-full flex items-center justify-center gap-2 p-4 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:border-white/40 transition-colors">
                        <Plus className="w-4 h-4" />
                        Add Payment Method
                      </button>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      Security
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                          <p className="text-white font-medium">Password</p>
                          <p className="text-gray-400 text-sm">Last changed 30 days ago</p>
                        </div>
                        <button className="text-blue-400 hover:text-blue-300">Change</button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                          <p className="text-white font-medium">Two-Factor Authentication</p>
                          <p className="text-gray-400 text-sm">Add extra security to your account</p>
                        </div>
                        <button className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm flex items-center gap-1">
                          <Check className="w-4 h-4" /> Enabled
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-400" />
                      Notification Preferences
                    </h2>
                    <div className="space-y-3">
                      {[
                        'Email notifications for bookings',
                        'Price drop alerts',
                        'Promotional offers',
                        'Trip reminders',
                        'Loyalty updates'
                      ].map((label, index) => (
                        <label key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer">
                          <span className="text-gray-300">{label}</span>
                          <input
                            type="checkbox"
                            defaultChecked={index < 3}
                            className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

// Components
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center text-white mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}

function BookingCard({ booking, detailed = false }: { booking: Booking; detailed?: boolean }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
        booking.type === 'flight' ? 'bg-blue-500/20 text-blue-400' :
        booking.type === 'hotel' ? 'bg-purple-500/20 text-purple-400' :
        'bg-green-500/20 text-green-400'
      }`}>
        {booking.type === 'flight' && <Plane className="w-6 h-6" />}
        {booking.type === 'hotel' && <Building2 className="w-6 h-6" />}
        {booking.type === 'package' && <Gift className="w-6 h-6" />}
      </div>
      <div className="flex-1">
        <p className="text-white font-medium">{booking.title}</p>
        <p className="text-gray-400 text-sm">{booking.subtitle}</p>
        {detailed && (
          <p className="text-gray-500 text-xs mt-1">Ref: {booking.reference}</p>
        )}
      </div>
      <div className="text-right">
        <p className="text-white font-medium">{booking.date}</p>
        <span className={`text-xs px-2 py-1 rounded-full ${
          booking.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
          booking.status === 'completed' ? 'bg-green-500/20 text-green-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>
    </div>
  );
}

function getTierBenefits(tier: string): string[] {
  const benefits: Record<string, string[]> = {
    bronze: [
      'Earn 1 point per $1 spent',
      'Member-exclusive rates',
      'Birthday bonus points',
      'Free cancellation on select bookings'
    ],
    silver: [
      'Earn 1.5 points per $1 spent',
      'Priority customer support',
      'Free room upgrades (when available)',
      'Early check-in / Late check-out',
      'All Bronze benefits'
    ],
    gold: [
      'Earn 2 points per $1 spent',
      'Complimentary airport lounge access',
      'Guaranteed room upgrades',
      'Free breakfast at partner hotels',
      'Priority boarding',
      'All Silver benefits'
    ],
    platinum: [
      'Earn 3 points per $1 spent',
      'Unlimited lounge access + guests',
      'Suite upgrades (when available)',
      'Personal concierge service',
      'Exclusive platinum-only deals',
      'All Gold benefits'
    ],
    ambassador: [
      'Earn 5 points per $1 spent',
      'Dedicated account manager',
      'First-class upgrades (when available)',
      'VIP experiences and events',
      'Unlimited free cancellations',
      'All Platinum benefits'
    ]
  };
  return benefits[tier] || benefits.bronze;
}

// Mock Data
const mockBookings: Booking[] = [
  {
    id: 'B001',
    type: 'flight',
    status: 'upcoming',
    reference: 'SKY7X9M2K',
    title: 'New York → Paris',
    subtitle: 'Air France AF007 • Economy',
    date: 'Mar 15, 2024',
    price: 589
  },
  {
    id: 'B002',
    type: 'hotel',
    status: 'upcoming',
    reference: 'HTL4K8N3P',
    title: 'Le Grand Paris Marriott',
    subtitle: 'Deluxe King Room • 3 nights',
    date: 'Mar 15-18, 2024',
    price: 1167
  },
  {
    id: 'B003',
    type: 'flight',
    status: 'completed',
    reference: 'SKY2A5F7G',
    title: 'Los Angeles → Tokyo',
    subtitle: 'ANA NH105 • Business',
    date: 'Feb 28, 2024',
    price: 3450
  },
  {
    id: 'B004',
    type: 'hotel',
    status: 'completed',
    reference: 'HTL9R3M1K',
    title: 'Park Hyatt Tokyo',
    subtitle: 'Park Suite • 5 nights',
    date: 'Feb 28 - Mar 5, 2024',
    price: 4500
  },
  {
    id: 'B005',
    type: 'package',
    status: 'cancelled',
    reference: 'PKG7H2N4L',
    title: 'London Adventure Package',
    subtitle: 'Flight + Hotel + Activities',
    date: 'Jan 15, 2024',
    price: 2100
  }
];

const mockLoyalty: LoyaltyInfo = {
  tier: 'gold',
  points: 45678,
  pointsToNextTier: 54322,
  nextTier: 'Platinum',
  memberSince: 'January 2023',
  lifetimePoints: 125000
};

const mockNotifications: Notification[] = [
  {
    id: 'N001',
    type: 'booking',
    title: 'Booking Confirmed',
    message: 'Your flight to Paris has been confirmed',
    date: '2 hours ago',
    read: false
  },
  {
    id: 'N002',
    type: 'promo',
    title: 'Flash Sale: 30% Off Hotels',
    message: 'Book by midnight to save big on your next stay',
    date: '1 day ago',
    read: false
  },
  {
    id: 'N003',
    type: 'alert',
    title: 'Flight Reminder',
    message: 'Your trip to Paris is in 5 days',
    date: '2 days ago',
    read: true
  },
  {
    id: 'N004',
    type: 'info',
    title: 'Points Earned',
    message: 'You earned 2,578 points from your last booking',
    date: '1 week ago',
    read: true
  }
];

const mockSavedItems = [
  {
    id: 'S001',
    type: 'flight',
    title: 'New York → London',
    subtitle: 'British Airways • Round trip',
    price: 699
  },
  {
    id: 'S002',
    type: 'hotel',
    title: 'The Ritz London',
    subtitle: '5-star luxury • Piccadilly',
    price: 850
  },
  {
    id: 'S003',
    type: 'hotel',
    title: 'Aman Tokyo',
    subtitle: '5-star • Otemachi Tower',
    price: 1200
  }
];
