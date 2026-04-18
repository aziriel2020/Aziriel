'use client';

/**
 * TERMS OF SERVICE PAGE
 */

import Link from 'next/link';
import { Shield, ChevronLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8">
          <ChevronLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
            <p className="text-gray-400">Last updated: January 2025</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="bg-gray-800/50 rounded-2xl border border-white/10 p-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-300">
                By accessing or using Skyward Travels services, you agree to be bound by these Terms of Service.
                If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. Services Description</h2>
              <p className="text-gray-300 mb-4">
                Skyward Travels provides an online platform for searching, comparing, and booking travel services including:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Flight reservations</li>
                <li>Hotel accommodations</li>
                <li>Travel packages and bundles</li>
                <li>Travel-related ancillary services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. Booking and Payment</h2>
              <p className="text-gray-300 mb-4">
                When you make a booking through our platform:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for reviewing all booking details before confirmation</li>
                <li>Payment is required at the time of booking unless otherwise specified</li>
                <li>Prices are subject to availability and may change until booking is confirmed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Cancellations and Refunds</h2>
              <p className="text-gray-300">
                Cancellation and refund policies vary depending on the fare type, airline, or hotel selected.
                Please review the specific terms associated with your booking before purchase.
                Skyward Travels will process refunds in accordance with the provider's policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. User Accounts</h2>
              <p className="text-gray-300 mb-4">
                To access certain features, you may need to create an account:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>You are responsible for maintaining account confidentiality</li>
                <li>You must notify us immediately of any unauthorized use</li>
                <li>We reserve the right to suspend or terminate accounts for violations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Intellectual Property</h2>
              <p className="text-gray-300">
                All content on Skyward Travels, including text, graphics, logos, and software,
                is owned by or licensed to us and is protected by intellectual property laws.
                You may not reproduce, distribute, or create derivative works without permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-300">
                Skyward Travels acts as an intermediary between you and travel service providers.
                We are not liable for services provided by airlines, hotels, or other third parties.
                Our liability is limited to the extent permitted by applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. Governing Law</h2>
              <p className="text-gray-300">
                These terms are governed by and construed in accordance with the laws of the State of California,
                United States, without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">9. Changes to Terms</h2>
              <p className="text-gray-300">
                We reserve the right to modify these terms at any time. Continued use of our services
                after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">10. Contact Information</h2>
              <p className="text-gray-300">
                For questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-blue-400 mt-2">legal@skywardtravels.com</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
