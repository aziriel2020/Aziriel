'use client';

/**
 * PRIVACY POLICY PAGE
 */

import Link from 'next/link';
import { Shield, ChevronLeft, Lock, Eye, Database, Globe, Mail } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8">
          <ChevronLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <Lock className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
            <p className="text-gray-400">Last updated: January 2025</p>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
            <Database className="w-6 h-6 text-blue-400 mb-2" />
            <h3 className="text-white font-medium">Data Collection</h3>
            <p className="text-gray-400 text-sm">We collect only what's necessary</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
            <Eye className="w-6 h-6 text-green-400 mb-2" />
            <h3 className="text-white font-medium">Transparency</h3>
            <p className="text-gray-400 text-sm">Full visibility into data use</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
            <Shield className="w-6 h-6 text-purple-400 mb-2" />
            <h3 className="text-white font-medium">Security</h3>
            <p className="text-gray-400 text-sm">Your data is encrypted & protected</p>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-2xl border border-white/10 p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
            <p className="text-gray-300">
              Skyward Travels ("we," "our," or "us") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Information We Collect</h2>
            <p className="text-gray-300 mb-4">We collect information you provide directly:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
              <li><strong>Account Information:</strong> Name, email, password, phone number</li>
              <li><strong>Booking Information:</strong> Traveler names, passport details, travel dates</li>
              <li><strong>Payment Information:</strong> Credit card details (processed securely via Stripe)</li>
              <li><strong>Communication:</strong> Messages, support tickets, feedback</li>
            </ul>
            <p className="text-gray-300 mb-4">We automatically collect:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
              <li><strong>Usage Data:</strong> Pages visited, search queries, booking history</li>
              <li><strong>Location Data:</strong> Approximate location based on IP address</li>
              <li><strong>Cookies:</strong> Session and preference data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-300 mb-4">We use your information to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Process and manage your bookings</li>
              <li>Send booking confirmations and travel updates</li>
              <li>Provide customer support</li>
              <li>Personalize your experience and recommendations</li>
              <li>Process payments securely</li>
              <li>Improve our services and develop new features</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Information Sharing</h2>
            <p className="text-gray-300 mb-4">We share your information with:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>Travel Providers:</strong> Airlines, hotels, and other service providers to fulfill your bookings</li>
              <li><strong>Payment Processors:</strong> To process transactions securely</li>
              <li><strong>Service Providers:</strong> Third parties who assist our operations</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
            <p className="text-gray-300 mt-4">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. Data Security</h2>
            <p className="text-gray-300">
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mt-4">
              <li>256-bit SSL encryption for all data transmission</li>
              <li>PCI DSS compliance for payment processing</li>
              <li>Regular security audits and penetration testing</li>
              <li>Access controls and employee training</li>
              <li>Secure data centers with physical security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. Your Rights</h2>
            <p className="text-gray-300 mb-4">Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your data</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Withdraw Consent:</strong> Where processing is based on consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. Cookies</h2>
            <p className="text-gray-300 mb-4">We use cookies for:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for site functionality</li>
              <li><strong>Performance Cookies:</strong> Help us improve our services</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences</li>
              <li><strong>Marketing Cookies:</strong> Personalize advertisements (with consent)</li>
            </ul>
            <p className="text-gray-300 mt-4">
              You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">8. Data Retention</h2>
            <p className="text-gray-300">
              We retain your data for as long as necessary to provide services and comply with legal obligations.
              Booking records are kept for 7 years for tax and regulatory purposes.
              You can request deletion of your account data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">9. International Transfers</h2>
            <p className="text-gray-300">
              Your information may be transferred to and processed in countries other than your own.
              We ensure appropriate safeguards are in place, including Standard Contractual Clauses
              approved by relevant authorities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">10. Children's Privacy</h2>
            <p className="text-gray-300">
              Our services are not intended for children under 16. We do not knowingly collect
              personal information from children. If we become aware that we have collected data
              from a child, we will take steps to delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">11. Changes to This Policy</h2>
            <p className="text-gray-300">
              We may update this Privacy Policy periodically. We will notify you of material changes
              via email or prominent notice on our website. Continued use of our services after
              changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">12. Contact Us</h2>
            <p className="text-gray-300 mb-4">
              For privacy-related questions or to exercise your rights, contact us:
            </p>
            <div className="bg-gray-700/50 rounded-xl p-4 space-y-2">
              <p className="text-gray-300">
                <strong className="text-white">Email:</strong> privacy@skywardtravels.com
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Address:</strong> 123 Travel Street, San Francisco, CA 94102, USA
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Data Protection Officer:</strong> dpo@skywardtravels.com
              </p>
            </div>
          </section>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">Have questions about your privacy?</p>
          <Link
            href="/support"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-colors"
          >
            <Mail className="w-5 h-5" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
