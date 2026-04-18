'use client';

/**
 * PRICE ALERTS PAGE
 * Manage flight and hotel price alerts
 */

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bell,
  BellOff,
  Plane,
  Hotel,
  Plus,
  Trash2,
  Edit2,
  TrendingDown,
  TrendingUp,
  Calendar,
  MapPin,
  DollarSign,
  Check,
  X,
  ArrowRight,
  ArrowDown,
  ChevronDown,
  Mail,
  Smartphone,
  Settings
} from 'lucide-react';

interface PriceAlert {
  id: string;
  type: 'flight' | 'hotel';
  origin?: string;
  destination: string;
  dateRange: string;
  targetPrice: number;
  currentPrice: number;
  lowestPrice: number;
  priceHistory: number[];
  active: boolean;
  notifications: ('email' | 'push' | 'sms')[];
  createdAt: string;
  lastUpdated: string;
}

const DEMO_ALERTS: PriceAlert[] = [
  {
    id: 'alert-1',
    type: 'flight',
    origin: 'New York (JFK)',
    destination: 'Paris (CDG)',
    dateRange: 'Mar 15 - Mar 22, 2025',
    targetPrice: 500,
    currentPrice: 487,
    lowestPrice: 449,
    priceHistory: [612, 589, 545, 520, 498, 487],
    active: true,
    notifications: ['email', 'push'],
    createdAt: '2024-12-01',
    lastUpdated: '2 hours ago'
  },
  {
    id: 'alert-2',
    type: 'hotel',
    destination: 'Tokyo, Japan',
    dateRange: 'Apr 1 - Apr 7, 2025',
    targetPrice: 150,
    currentPrice: 189,
    lowestPrice: 156,
    priceHistory: [220, 210, 198, 189, 189],
    active: true,
    notifications: ['email'],
    createdAt: '2024-12-05',
    lastUpdated: '5 hours ago'
  },
  {
    id: 'alert-3',
    type: 'flight',
    origin: 'Los Angeles (LAX)',
    destination: 'London (LHR)',
    dateRange: 'Feb 10 - Feb 20, 2025',
    targetPrice: 600,
    currentPrice: 745,
    lowestPrice: 698,
    priceHistory: [820, 790, 765, 745],
    active: false,
    notifications: ['email', 'push', 'sms'],
    createdAt: '2024-11-20',
    lastUpdated: '1 day ago'
  }
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>(DEMO_ALERTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlertType, setNewAlertType] = useState<'flight' | 'hotel'>('flight');
  const [filter, setFilter] = useState<'all' | 'flight' | 'hotel'>('all');

  const toggleAlert = (id: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id ? { ...alert, active: !alert.active } : alert
      )
    );
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const filteredAlerts = alerts.filter(alert =>
    filter === 'all' || alert.type === filter
  );

  const getPriceStatus = (alert: PriceAlert) => {
    if (alert.currentPrice <= alert.targetPrice) return 'target-reached';
    if (alert.currentPrice < alert.priceHistory[0]) return 'dropping';
    return 'stable';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Price Alerts</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Track prices and get notified when they drop to your target
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Active Alerts</span>
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{alerts.filter(a => a.active).length}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Target Reached</span>
              <TrendingDown className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">
              {alerts.filter(a => a.currentPrice <= a.targetPrice).length}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Avg Savings</span>
              <DollarSign className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">$127</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex gap-2">
            {['all', 'flight', 'hotel'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All Alerts' : f === 'flight' ? 'Flights' : 'Hotels'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Alert
          </button>
        </div>

        {/* Alerts List */}
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-16">
            <BellOff className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No alerts yet</h3>
            <p className="text-gray-400 mb-6">Create your first price alert to start tracking</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Alert
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const status = getPriceStatus(alert);

              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-gray-800/50 rounded-2xl border transition-all ${
                    !alert.active
                      ? 'border-white/5 opacity-60'
                      : status === 'target-reached'
                      ? 'border-green-500/50'
                      : 'border-white/10'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${alert.type === 'flight' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                          {alert.type === 'flight' ? (
                            <Plane className="w-6 h-6 text-blue-400" />
                          ) : (
                            <Hotel className="w-6 h-6 text-purple-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">
                              {alert.type === 'flight' ? `${alert.origin} → ${alert.destination}` : alert.destination}
                            </h3>
                            {status === 'target-reached' && (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                                Target Reached!
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {alert.dateRange}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAlert(alert.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            alert.active
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-700 text-gray-500'
                          }`}
                          title={alert.active ? 'Active' : 'Paused'}
                        >
                          {alert.active ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="p-2 bg-gray-700 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Price Info */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-700/30 rounded-xl p-4">
                        <p className="text-gray-400 text-sm mb-1">Current Price</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-white">${alert.currentPrice}</span>
                          {alert.currentPrice < alert.priceHistory[0] && (
                            <ArrowDown className="w-5 h-5 text-green-400" />
                          )}
                        </div>
                      </div>
                      <div className="bg-gray-700/30 rounded-xl p-4">
                        <p className="text-gray-400 text-sm mb-1">Target Price</p>
                        <span className="text-2xl font-bold text-blue-400">${alert.targetPrice}</span>
                      </div>
                      <div className="bg-gray-700/30 rounded-xl p-4">
                        <p className="text-gray-400 text-sm mb-1">Lowest Seen</p>
                        <span className="text-2xl font-bold text-green-400">${alert.lowestPrice}</span>
                      </div>
                    </div>

                    {/* Price History Chart (simplified) */}
                    <div className="bg-gray-700/30 rounded-xl p-4 mb-4">
                      <p className="text-gray-400 text-sm mb-3">Price History</p>
                      <div className="flex items-end gap-2 h-16">
                        {alert.priceHistory.map((price, index) => {
                          const maxPrice = Math.max(...alert.priceHistory);
                          const height = (price / maxPrice) * 100;
                          const isLatest = index === alert.priceHistory.length - 1;

                          return (
                            <div
                              key={index}
                              className="flex-1 flex flex-col items-center"
                            >
                              <div
                                className={`w-full rounded-t transition-all ${
                                  isLatest ? 'bg-blue-500' : 'bg-gray-600'
                                }`}
                                style={{ height: `${height}%` }}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>6 weeks ago</span>
                        <span>Now</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Notifications:</span>
                        <div className="flex items-center gap-2">
                          {alert.notifications.includes('email') && (
                            <Mail className="w-4 h-4 text-blue-400" title="Email" />
                          )}
                          {alert.notifications.includes('push') && (
                            <Bell className="w-4 h-4 text-blue-400" title="Push" />
                          )}
                          {alert.notifications.includes('sms') && (
                            <Smartphone className="w-4 h-4 text-blue-400" title="SMS" />
                          )}
                        </div>
                        <span className="text-gray-500">•</span>
                        <span>Updated {alert.lastUpdated}</span>
                      </div>

                      {status === 'target-reached' && (
                        <Link
                          href={alert.type === 'flight' ? '/flights/search' : '/hotels/search'}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold text-sm transition-colors flex items-center gap-2"
                        >
                          Book Now
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Create Alert Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-2xl w-full max-w-lg border border-white/10"
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Create Price Alert</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Alert Type */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Alert Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setNewAlertType('flight')}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        newAlertType === 'flight'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Plane className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">Flight</span>
                    </button>
                    <button
                      onClick={() => setNewAlertType('hotel')}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        newAlertType === 'hotel'
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Hotel className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">Hotel</span>
                    </button>
                  </div>
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    {newAlertType === 'flight' ? 'Route' : 'Destination'}
                  </label>
                  {newAlertType === 'flight' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="From (e.g., NYC)"
                        className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="To (e.g., Paris)"
                        className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="City or hotel name"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>

                {/* Dates */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Travel Dates</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Target Price */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Target Price (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      placeholder="500"
                      className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Notify me via</label>
                  <div className="flex gap-3">
                    {[
                      { id: 'email', icon: Mail, label: 'Email' },
                      { id: 'push', icon: Bell, label: 'Push' },
                      { id: 'sms', icon: Smartphone, label: 'SMS' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        className="flex-1 p-3 bg-blue-500/20 border border-blue-500/50 rounded-xl flex items-center justify-center gap-2 text-blue-400"
                      >
                        <opt.icon className="w-4 h-4" />
                        <span className="text-sm">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-colors"
                >
                  Create Alert
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
