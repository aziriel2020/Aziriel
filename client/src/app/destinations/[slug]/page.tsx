'use client';

/**
 * DESTINATION GUIDE PAGE
 * Comprehensive city guide with attractions, tips, and booking options
 */

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin,
  Plane,
  Hotel,
  Star,
  Calendar,
  Sun,
  Cloud,
  Thermometer,
  Clock,
  DollarSign,
  Globe,
  Heart,
  Share2,
  ChevronRight,
  Camera,
  Utensils,
  ShoppingBag,
  Music,
  Landmark,
  Info,
  AlertCircle,
  Check,
  Users,
  MessageSquare
} from 'lucide-react';

// Demo destination data
const DESTINATIONS: Record<string, any> = {
  paris: {
    name: 'Paris',
    country: 'France',
    continent: 'Europe',
    tagline: 'The City of Light',
    heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920',
    description: `Paris, the capital of France, is one of the most iconic cities in the world. Known as the "City of Light," Paris captivates visitors with its stunning architecture, world-class museums, romantic atmosphere, and exquisite cuisine. From the iconic Eiffel Tower to the magnificent Louvre Museum, every corner of Paris tells a story of art, history, and culture.`,
    highlights: [
      'Eiffel Tower - Iconic iron lattice tower',
      'Louvre Museum - World\'s largest art museum',
      'Notre-Dame Cathedral - Gothic masterpiece',
      'Champs-Élysées - Famous avenue',
      'Montmartre - Artistic neighborhood',
      'Seine River cruises'
    ],
    rating: 4.8,
    reviews: 12453,
    flightFrom: 487,
    hotelFrom: 189,
    weather: {
      spring: { temp: '12-18°C', condition: 'Mild & pleasant' },
      summer: { temp: '20-26°C', condition: 'Warm & sunny' },
      autumn: { temp: '10-16°C', condition: 'Cool & colorful' },
      winter: { temp: '3-8°C', condition: 'Cold & festive' }
    },
    bestTime: 'April to June & September to October',
    language: 'French',
    currency: 'Euro (€)',
    timezone: 'CET (UTC+1)',
    budget: {
      budget: '$100-150/day',
      midRange: '$200-350/day',
      luxury: '$500+/day'
    },
    attractions: [
      {
        name: 'Eiffel Tower',
        category: 'Landmark',
        image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4?w=600',
        description: 'Iconic iron tower with panoramic city views',
        duration: '2-3 hours',
        price: '€26-42',
        rating: 4.7
      },
      {
        name: 'Louvre Museum',
        category: 'Museum',
        image: 'https://images.unsplash.com/photo-1499426600726-ac36af60e83e?w=600',
        description: 'World\'s largest art museum, home to Mona Lisa',
        duration: '3-4 hours',
        price: '€17',
        rating: 4.8
      },
      {
        name: 'Montmartre',
        category: 'Neighborhood',
        image: 'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=600',
        description: 'Historic artistic neighborhood with Sacré-Cœur',
        duration: '3-4 hours',
        price: 'Free',
        rating: 4.6
      },
      {
        name: 'Palace of Versailles',
        category: 'Palace',
        image: 'https://images.unsplash.com/photo-1597910037310-7dd77b61f1dc?w=600',
        description: 'Opulent royal palace with stunning gardens',
        duration: 'Full day',
        price: '€20-27',
        rating: 4.7
      }
    ],
    neighborhoods: [
      { name: 'Le Marais', type: 'Historic & trendy', description: 'Medieval streets, boutiques, LGBTQ+ friendly' },
      { name: 'Saint-Germain-des-Prés', type: 'Intellectual & chic', description: 'Cafés, galleries, literary history' },
      { name: 'Latin Quarter', type: 'Student & lively', description: 'University area, bookshops, nightlife' },
      { name: 'Montmartre', type: 'Artistic & romantic', description: 'Artists, cabarets, panoramic views' }
    ],
    food: [
      { name: 'Croissants', type: 'Breakfast', description: 'Buttery, flaky pastry' },
      { name: 'Baguette', type: 'Staple', description: 'Crusty French bread' },
      { name: 'Coq au Vin', type: 'Main', description: 'Chicken braised in wine' },
      { name: 'Crème Brûlée', type: 'Dessert', description: 'Caramelized custard' },
      { name: 'Macarons', type: 'Sweet', description: 'Colorful almond cookies' }
    ],
    tips: [
      'Book major attractions online in advance to skip lines',
      'Metro is the fastest way to get around - get a Navigo pass',
      'Most museums are free on first Sunday of the month',
      'Learn basic French phrases - locals appreciate the effort',
      'Tipping is not mandatory but 5-10% is appreciated',
      'Many shops close on Sundays'
    ],
    safety: 'Generally safe. Watch for pickpockets at tourist sites and on metro.',
    visa: 'Schengen visa required for non-EU citizens. Tourist stays up to 90 days.',
    gallery: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4?w=600',
      'https://images.unsplash.com/photo-1499426600726-ac36af60e83e?w=600',
      'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=600',
      'https://images.unsplash.com/photo-1597910037310-7dd77b61f1dc?w=600',
      'https://images.unsplash.com/photo-1549144511-f099e773c147?w=600'
    ]
  }
};

// Default fallback for other destinations
const DEFAULT_DESTINATION = {
  name: 'Destination',
  country: 'Country',
  continent: 'Continent',
  tagline: 'Explore this amazing destination',
  heroImage: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920',
  description: 'Discover the wonders of this incredible destination.',
  highlights: ['Amazing sights', 'Great food', 'Rich culture', 'Friendly locals'],
  rating: 4.5,
  reviews: 1000,
  flightFrom: 500,
  hotelFrom: 150,
  weather: {
    spring: { temp: '15-22°C', condition: 'Pleasant' },
    summer: { temp: '25-32°C', condition: 'Warm' },
    autumn: { temp: '12-20°C', condition: 'Cool' },
    winter: { temp: '5-12°C', condition: 'Cold' }
  },
  bestTime: 'Spring and Autumn',
  language: 'Local language',
  currency: 'Local currency',
  timezone: 'Local timezone',
  budget: { budget: '$80-120/day', midRange: '$150-250/day', luxury: '$400+/day' },
  attractions: [],
  neighborhoods: [],
  food: [],
  tips: ['Book in advance', 'Learn local customs', 'Stay safe'],
  safety: 'Check local advisories.',
  visa: 'Check visa requirements for your nationality.',
  gallery: []
};

export default function DestinationGuidePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const destination = DESTINATIONS[slug] || { ...DEFAULT_DESTINATION, name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ') };

  const [activeTab, setActiveTab] = useState<'overview' | 'attractions' | 'food' | 'tips'>('overview');
  const [saved, setSaved] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative h-[600px]">
        <div className="absolute inset-0">
          <img
            src={destination.heroImage}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-gray-900/30" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto px-4 pb-12 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 text-gray-300 mb-2">
                <Globe className="w-4 h-4" />
                <span>{destination.continent}</span>
                <ChevronRight className="w-4 h-4" />
                <span>{destination.country}</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-white mb-2">{destination.name}</h1>
              <p className="text-2xl text-blue-400 mb-4">{destination.tagline}</p>

              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-600 px-2 py-1 rounded flex items-center gap-1">
                    <Star className="w-4 h-4 text-white fill-current" />
                    <span className="text-white font-semibold">{destination.rating}</span>
                  </div>
                  <span className="text-gray-400">{destination.reviews.toLocaleString()} reviews</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Plane className="w-4 h-4" />
                  <span>Flights from ${destination.flightFrom}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Hotel className="w-4 h-4" />
                  <span>Hotels from ${destination.hotelFrom}/night</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Link
                  href={`/flights/search?to=${destination.name}`}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-colors flex items-center gap-2"
                >
                  <Plane className="w-5 h-5" />
                  Find Flights
                </Link>
                <Link
                  href={`/hotels/search?city=${destination.name}`}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-semibold transition-colors flex items-center gap-2"
                >
                  <Hotel className="w-5 h-5" />
                  Find Hotels
                </Link>
                <button
                  onClick={() => setSaved(!saved)}
                  className={`p-3 rounded-xl transition-colors ${saved ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                </button>
                <button className="p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 -mt-20 relative z-10">
          <div className="bg-gray-800/90 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <Calendar className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-gray-400 text-sm">Best Time</p>
            <p className="text-white font-medium">{destination.bestTime}</p>
          </div>
          <div className="bg-gray-800/90 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <Globe className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-gray-400 text-sm">Language</p>
            <p className="text-white font-medium">{destination.language}</p>
          </div>
          <div className="bg-gray-800/90 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <DollarSign className="w-5 h-5 text-yellow-400 mb-2" />
            <p className="text-gray-400 text-sm">Currency</p>
            <p className="text-white font-medium">{destination.currency}</p>
          </div>
          <div className="bg-gray-800/90 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <Clock className="w-5 h-5 text-purple-400 mb-2" />
            <p className="text-gray-400 text-sm">Timezone</p>
            <p className="text-white font-medium">{destination.timezone}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10 mb-8">
          <div className="flex gap-6">
            {['overview', 'attractions', 'food', 'tips'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 px-1 font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">About {destination.name}</h2>
                <p className="text-gray-300 leading-relaxed">{destination.description}</p>
              </div>

              {/* Highlights */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Highlights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {destination.highlights.map((highlight: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Neighborhoods */}
              {destination.neighborhoods?.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Neighborhoods</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {destination.neighborhoods.map((area: any, index: number) => (
                      <div key={index} className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
                        <h4 className="text-white font-semibold">{area.name}</h4>
                        <p className="text-blue-400 text-sm mb-2">{area.type}</p>
                        <p className="text-gray-400 text-sm">{area.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {destination.gallery?.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Gallery</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {destination.gallery.map((image: string, index: number) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img src={image} alt="" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Weather */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-400" />
                  Weather
                </h3>
                <div className="space-y-3">
                  {Object.entries(destination.weather).map(([season, data]: [string, any]) => (
                    <div key={season} className="flex items-center justify-between">
                      <span className="text-gray-400 capitalize">{season}</span>
                      <div className="text-right">
                        <span className="text-white">{data.temp}</span>
                        <p className="text-gray-500 text-sm">{data.condition}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  Daily Budget
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Budget</span>
                    <span className="text-white">{destination.budget.budget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mid-range</span>
                    <span className="text-white">{destination.budget.midRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Luxury</span>
                    <span className="text-white">{destination.budget.luxury}</span>
                  </div>
                </div>
              </div>

              {/* Safety */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                  Safety
                </h3>
                <p className="text-gray-300 text-sm">{destination.safety}</p>
              </div>

              {/* Visa */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-400" />
                  Visa Info
                </h3>
                <p className="text-gray-300 text-sm">{destination.visa}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attractions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {destination.attractions?.map((attraction: any, index: number) => (
              <div key={index} className="bg-gray-800/50 rounded-xl overflow-hidden border border-white/10">
                <div className="h-48 overflow-hidden">
                  <img src={attraction.image} alt={attraction.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-blue-400 text-sm">{attraction.category}</span>
                      <h3 className="text-xl font-semibold text-white">{attraction.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 bg-blue-500/20 px-2 py-1 rounded">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white">{attraction.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 mb-4">{attraction.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {attraction.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {attraction.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'food' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destination.food?.map((item: any, index: number) => (
              <div key={index} className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
                <Utensils className="w-8 h-8 text-orange-400 mb-3" />
                <span className="text-orange-400 text-sm">{item.type}</span>
                <h3 className="text-xl font-semibold text-white mb-2">{item.name}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="max-w-3xl">
            <div className="space-y-4">
              {destination.tips?.map((tip: string, index: number) => (
                <div key={index} className="flex items-start gap-4 bg-gray-800/50 rounded-xl p-5 border border-white/10">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-semibold">{index + 1}</span>
                  </div>
                  <p className="text-gray-300">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl p-12 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to explore {destination.name}?</h2>
            <p className="text-gray-400 mb-8">Start planning your trip today with the best deals on flights and hotels.</p>
            <div className="flex justify-center gap-4">
              <Link
                href={`/flights/search?to=${destination.name}`}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-colors"
              >
                Search Flights
              </Link>
              <Link
                href={`/hotels/search?city=${destination.name}`}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-semibold transition-colors"
              >
                Search Hotels
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
