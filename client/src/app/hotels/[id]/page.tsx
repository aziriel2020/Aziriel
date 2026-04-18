'use client';

/**
 * HOTEL DETAIL PAGE
 * Full hotel information with rooms, photos, reviews, amenities
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  MapPin,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Waves,
  Wind,
  Coffee,
  Tv,
  Shield,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Users,
  Bed,
  Calendar,
  ArrowRight,
  Phone,
  Mail,
  Clock,
  Info,
  ThumbsUp,
  MessageSquare,
  Plane,
  Building2,
  Sparkles
} from 'lucide-react';

// Demo hotel data
const DEMO_HOTEL = {
  id: 'hotel-1',
  code: 'PARMAR001',
  name: 'Le Grand Marais Hotel & Spa',
  tagline: 'Luxury in the Heart of Paris',
  starRating: 5,
  location: {
    address: '15 Rue de Turenne',
    city: 'Paris',
    country: 'France',
    neighborhood: 'Le Marais',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    nearbyAttractions: [
      { name: 'Place des Vosges', distance: '0.3 km' },
      { name: 'Musée Picasso', distance: '0.5 km' },
      { name: 'Notre-Dame Cathedral', distance: '1.2 km' },
      { name: 'Louvre Museum', distance: '1.5 km' }
    ]
  },
  images: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200'
  ],
  description: `Experience unparalleled luxury at Le Grand Marais Hotel & Spa, nestled in the historic heart of Paris's most charming neighborhood. Our meticulously restored 18th-century building combines timeless Parisian elegance with modern comfort.

Each of our 85 rooms and suites features bespoke furnishings, marble bathrooms, and views of either our tranquil courtyard garden or the vibrant streets of Le Marais. Our award-winning spa offers a sanctuary of relaxation with treatments inspired by French beauty traditions.

Savor exquisite French cuisine at our Michelin-starred restaurant, or enjoy cocktails at our rooftop bar with panoramic views of the Paris skyline including the Eiffel Tower.`,
  amenities: [
    { icon: 'wifi', name: 'Free High-Speed WiFi', category: 'connectivity' },
    { icon: 'spa', name: 'Full-Service Spa', category: 'wellness' },
    { icon: 'pool', name: 'Indoor Heated Pool', category: 'wellness' },
    { icon: 'gym', name: '24/7 Fitness Center', category: 'wellness' },
    { icon: 'restaurant', name: 'Michelin-Star Restaurant', category: 'dining' },
    { icon: 'bar', name: 'Rooftop Bar', category: 'dining' },
    { icon: 'breakfast', name: 'Gourmet Breakfast', category: 'dining' },
    { icon: 'roomservice', name: '24/7 Room Service', category: 'dining' },
    { icon: 'parking', name: 'Valet Parking', category: 'services' },
    { icon: 'concierge', name: '24/7 Concierge', category: 'services' },
    { icon: 'laundry', name: 'Laundry Service', category: 'services' },
    { icon: 'ac', name: 'Climate Control', category: 'room' },
    { icon: 'tv', name: 'Smart TV', category: 'room' },
    { icon: 'safe', name: 'In-Room Safe', category: 'room' },
    { icon: 'minibar', name: 'Premium Minibar', category: 'room' }
  ],
  rooms: [
    {
      id: 'room-1',
      name: 'Deluxe Room',
      description: 'Elegant 30m² room with city or courtyard views, king bed, marble bathroom with rain shower.',
      price: { amount: 450, currency: 'USD', perNight: 450 },
      originalPrice: 520,
      capacity: { adults: 2, children: 1 },
      beds: '1 King Bed',
      size: '30 m²',
      amenities: ['Free WiFi', 'Air Conditioning', 'Smart TV', 'Minibar', 'Safe', 'Rain Shower'],
      cancellation: { free: true, deadline: '2024-12-10' },
      breakfast: false,
      images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
      available: 5
    },
    {
      id: 'room-2',
      name: 'Premier Suite',
      description: 'Spacious 55m² suite with separate living area, panoramic views, soaking tub and walk-in shower.',
      price: { amount: 750, currency: 'USD', perNight: 750 },
      originalPrice: 890,
      capacity: { adults: 2, children: 2 },
      beds: '1 King Bed + Sofa Bed',
      size: '55 m²',
      amenities: ['Free WiFi', 'Air Conditioning', 'Smart TV', 'Minibar', 'Safe', 'Soaking Tub', 'Walk-in Shower', 'Nespresso Machine', 'Bathrobes'],
      cancellation: { free: true, deadline: '2024-12-10' },
      breakfast: true,
      images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800'],
      available: 3
    },
    {
      id: 'room-3',
      name: 'Grand Suite',
      description: 'Luxurious 85m² suite with private terrace, dining area, butler service, and Eiffel Tower views.',
      price: { amount: 1250, currency: 'USD', perNight: 1250 },
      originalPrice: 1450,
      capacity: { adults: 3, children: 2 },
      beds: '1 King Bed + 1 Queen Sofa',
      size: '85 m²',
      amenities: ['Free WiFi', 'Air Conditioning', 'Smart TV', 'Minibar', 'Safe', 'Private Terrace', 'Butler Service', 'Jacuzzi', 'Dining Area', 'Eiffel Tower View'],
      cancellation: { free: true, deadline: '2024-12-08' },
      breakfast: true,
      images: ['https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800'],
      available: 2
    },
    {
      id: 'room-4',
      name: 'Presidential Suite',
      description: 'The ultimate 150m² suite spanning the entire top floor with 360° views, private spa, and personal chef available.',
      price: { amount: 3500, currency: 'USD', perNight: 3500 },
      originalPrice: 4000,
      capacity: { adults: 4, children: 2 },
      beds: '2 King Beds',
      size: '150 m²',
      amenities: ['All Amenities', 'Private Spa', 'Personal Chef', '360° Views', 'Private Elevator', 'Grand Piano', 'Home Theater', 'Wine Cellar'],
      cancellation: { free: true, deadline: '2024-12-05' },
      breakfast: true,
      images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'],
      available: 1
    }
  ],
  reviewScore: 9.4,
  reviewCount: 2847,
  reviews: [
    {
      id: 'rev-1',
      author: 'Sarah M.',
      country: 'United States',
      date: '2024-11-15',
      rating: 10,
      title: 'Absolutely Perfect Stay',
      content: 'From the moment we arrived, the service was impeccable. The room was stunning with amazing views. The spa is world-class and the restaurant exceeded all expectations. Will definitely return!',
      helpful: 124,
      categories: { location: 10, cleanliness: 10, service: 10, comfort: 10 }
    },
    {
      id: 'rev-2',
      author: 'James L.',
      country: 'United Kingdom',
      date: '2024-11-10',
      rating: 9,
      title: 'Luxury at its finest',
      content: 'Beautiful historic building with modern amenities. Staff went above and beyond. Only minor issue was noise from the street at night, but earplugs were provided. Breakfast was phenomenal.',
      helpful: 89,
      categories: { location: 9, cleanliness: 10, service: 10, comfort: 9 }
    },
    {
      id: 'rev-3',
      author: 'Marie D.',
      country: 'France',
      date: '2024-11-05',
      rating: 9.5,
      title: 'Un séjour magique',
      content: 'Le Marais is the perfect location to explore Paris. The hotel combines old-world charm with every modern comfort. The rooftop bar at sunset is not to be missed!',
      helpful: 67,
      categories: { location: 10, cleanliness: 9, service: 10, comfort: 9 }
    }
  ],
  policies: {
    checkIn: '15:00',
    checkOut: '12:00',
    cancellation: 'Free cancellation up to 48 hours before check-in',
    children: 'Children of all ages welcome. Kids under 12 stay free.',
    pets: 'Pets allowed on request (charges may apply)',
    smoking: 'Non-smoking property'
  },
  contact: {
    phone: '+33 1 42 72 00 00',
    email: 'reservations@legrandmarais.com',
    website: 'www.legrandmarais.com'
  }
};

const AMENITY_ICONS: Record<string, any> = {
  wifi: Wifi,
  spa: Sparkles,
  pool: Waves,
  gym: Dumbbell,
  restaurant: Utensils,
  bar: Coffee,
  breakfast: Coffee,
  roomservice: Utensils,
  parking: Car,
  concierge: Phone,
  laundry: Wind,
  ac: Wind,
  tv: Tv,
  safe: Shield,
  minibar: Coffee
};

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [hotel, setHotel] = useState(DEMO_HOTEL);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'amenities' | 'reviews' | 'location'>('overview');
  const [saved, setSaved] = useState(false);

  const checkIn = searchParams.get('checkIn') || '2024-12-15';
  const checkOut = searchParams.get('checkOut') || '2024-12-18';
  const guests = parseInt(searchParams.get('guests') || '2');
  const rooms = parseInt(searchParams.get('rooms') || '1');

  const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));

  const handleBookRoom = (roomId: string) => {
    const room = hotel.rooms.find(r => r.id === roomId);
    if (room) {
      router.push(`/booking/hotel?hotelId=${hotel.id}&roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&rooms=${rooms}`);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + hotel.images.length) % hotel.images.length);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/hotels/search" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
              Back to results
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSaved(!saved)}
                className={`p-2 rounded-lg transition-colors ${saved ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-gray-400 hover:text-white'}`}
              >
                <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Image Gallery */}
      <section className="relative">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[500px] max-w-7xl mx-auto px-4 py-4">
          <div
            className="col-span-2 row-span-2 relative rounded-l-2xl overflow-hidden cursor-pointer group"
            onClick={() => setShowGallery(true)}
          >
            <img
              src={hotel.images[0]}
              alt={hotel.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
          </div>
          {hotel.images.slice(1, 5).map((image, index) => (
            <div
              key={index}
              className={`relative overflow-hidden cursor-pointer group ${index === 1 ? 'rounded-tr-2xl' : ''} ${index === 3 ? 'rounded-br-2xl' : ''}`}
              onClick={() => {
                setCurrentImageIndex(index + 1);
                setShowGallery(true);
              }}
            >
              <img
                src={image}
                alt={`${hotel.name} ${index + 2}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              {index === 3 && hotel.images.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-xl font-semibold">+{hotel.images.length - 5} photos</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hotel Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {[...Array(hotel.starRating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
                <span className="text-gray-400 text-sm ml-2">5-Star Luxury Hotel</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{hotel.name}</h1>
              <p className="text-xl text-blue-400 mb-4">{hotel.tagline}</p>
              <div className="flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{hotel.location.address}, {hotel.location.neighborhood}, {hotel.location.city}</span>
                </div>
              </div>

              {/* Review Summary */}
              <div className="flex items-center gap-4 mt-4">
                <div className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-lg">
                  {hotel.reviewScore}
                </div>
                <div>
                  <p className="text-white font-semibold">Exceptional</p>
                  <p className="text-gray-400 text-sm">{hotel.reviewCount.toLocaleString()} reviews</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10">
              <div className="flex gap-6 overflow-x-auto">
                {['overview', 'rooms', 'amenities', 'reviews', 'location'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-4 px-1 font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">About This Hotel</h2>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">{hotel.description}</p>
                  </div>

                  {/* Popular Amenities */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Popular Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {hotel.amenities.slice(0, 8).map((amenity, index) => {
                        const IconComponent = AMENITY_ICONS[amenity.icon] || Check;
                        return (
                          <div key={index} className="flex items-center gap-3 text-gray-300">
                            <IconComponent className="w-5 h-5 text-blue-400" />
                            <span>{amenity.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nearby Attractions */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Nearby Attractions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {hotel.location.nearbyAttractions.map((attraction, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                          <span className="text-gray-300">{attraction.name}</span>
                          <span className="text-gray-500 text-sm">{attraction.distance}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'rooms' && (
                <motion.div
                  key="rooms"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold text-white">Available Rooms</h2>
                  <div className="space-y-4">
                    {hotel.rooms.map((room) => (
                      <div
                        key={room.id}
                        className={`bg-gray-800/50 rounded-xl border transition-all ${
                          selectedRoom === room.id ? 'border-blue-500' : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Room Image */}
                            <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
                            </div>

                            {/* Room Details */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-lg font-semibold text-white">{room.name}</h3>
                                  <p className="text-gray-400 text-sm">{room.size} • {room.beds}</p>
                                </div>
                                {room.available <= 3 && (
                                  <span className="text-orange-400 text-sm">Only {room.available} left!</span>
                                )}
                              </div>

                              <p className="text-gray-400 text-sm mb-3">{room.description}</p>

                              <div className="flex flex-wrap gap-2 mb-4">
                                {room.amenities.slice(0, 5).map((amenity, index) => (
                                  <span key={index} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                                    {amenity}
                                  </span>
                                ))}
                                {room.amenities.length > 5 && (
                                  <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-400">
                                    +{room.amenities.length - 5} more
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-green-400">
                                  <Check className="w-4 h-4" />
                                  <span>Free cancellation</span>
                                </div>
                                {room.breakfast && (
                                  <div className="flex items-center gap-1 text-green-400">
                                    <Coffee className="w-4 h-4" />
                                    <span>Breakfast included</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1 text-gray-400">
                                  <Users className="w-4 h-4" />
                                  <span>Sleeps {room.capacity.adults + room.capacity.children}</span>
                                </div>
                              </div>
                            </div>

                            {/* Price & Book */}
                            <div className="flex flex-col items-end justify-between">
                              <div className="text-right">
                                {room.originalPrice && (
                                  <p className="text-gray-500 line-through text-sm">${room.originalPrice}</p>
                                )}
                                <p className="text-2xl font-bold text-white">${room.price.amount}</p>
                                <p className="text-gray-400 text-sm">per night</p>
                                <p className="text-gray-500 text-xs">${room.price.amount * nights} total for {nights} nights</p>
                              </div>
                              <button
                                onClick={() => handleBookRoom(room.id)}
                                className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-colors"
                              >
                                Reserve
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'amenities' && (
                <motion.div
                  key="amenities"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold text-white">All Amenities</h2>

                  {['wellness', 'dining', 'services', 'room'].map((category) => (
                    <div key={category}>
                      <h3 className="text-lg font-medium text-white mb-3 capitalize">{category}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {hotel.amenities
                          .filter(a => a.category === category)
                          .map((amenity, index) => {
                            const IconComponent = AMENITY_ICONS[amenity.icon] || Check;
                            return (
                              <div key={index} className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3">
                                <IconComponent className="w-5 h-5 text-blue-400" />
                                <span className="text-gray-300">{amenity.name}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Guest Reviews</h2>
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold">
                        {hotel.reviewScore}
                      </div>
                      <span className="text-gray-400">{hotel.reviewCount.toLocaleString()} reviews</span>
                    </div>
                  </div>

                  {/* Review Categories */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-800/50 rounded-xl p-4">
                    {['Location', 'Cleanliness', 'Service', 'Comfort'].map((cat) => (
                      <div key={cat} className="text-center">
                        <p className="text-2xl font-bold text-white">9.5</p>
                        <p className="text-gray-400 text-sm">{cat}</p>
                      </div>
                    ))}
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-4">
                    {hotel.reviews.map((review) => (
                      <div key={review.id} className="bg-gray-800/50 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                              <span className="text-blue-400 font-semibold">{review.author[0]}</span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{review.author}</p>
                              <p className="text-gray-500 text-sm">{review.country} • {review.date}</p>
                            </div>
                          </div>
                          <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold">
                            {review.rating}
                          </div>
                        </div>
                        <h4 className="text-white font-semibold mb-2">{review.title}</h4>
                        <p className="text-gray-300 mb-4">{review.content}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <button className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                            <span>Helpful ({review.helpful})</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-3 border border-white/20 rounded-xl text-white hover:bg-white/5 transition-colors">
                    Show all {hotel.reviewCount.toLocaleString()} reviews
                  </button>
                </motion.div>
              )}

              {activeTab === 'location' && (
                <motion.div
                  key="location"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-xl font-semibold text-white">Location</h2>

                  {/* Map Placeholder */}
                  <div className="h-64 bg-gray-800 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                      <p className="text-white">{hotel.location.address}</p>
                      <p className="text-gray-400">{hotel.location.neighborhood}, {hotel.location.city}</p>
                    </div>
                  </div>

                  {/* Nearby Attractions */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">What's Nearby</h3>
                    <div className="space-y-3">
                      {hotel.location.nearbyAttractions.map((attraction, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-blue-400" />
                            <span className="text-white">{attraction.name}</span>
                          </div>
                          <span className="text-gray-400">{attraction.distance}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hotel Policies */}
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Hotel Policies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white">Check-in</p>
                    <p className="text-gray-400 text-sm">From {hotel.policies.checkIn}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white">Check-out</p>
                    <p className="text-gray-400 text-sm">Until {hotel.policies.checkOut}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white">Cancellation</p>
                    <p className="text-gray-400 text-sm">{hotel.policies.cancellation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white">Children</p>
                    <p className="text-gray-400 text-sm">{hotel.policies.children}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-gray-800/50 rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">From</p>
                    <p className="text-3xl font-bold text-white">${hotel.rooms[0].price.amount}</p>
                    <p className="text-gray-400 text-sm">per night</p>
                  </div>
                  <div className="flex items-center gap-1 bg-blue-600 px-3 py-1 rounded-lg">
                    <Star className="w-4 h-4 text-white fill-current" />
                    <span className="text-white font-semibold">{hotel.reviewScore}</span>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="space-y-3 mb-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">Check-in</p>
                      <p className="text-white font-medium">{new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">Check-out</p>
                      <p className="text-white font-medium">{new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Guests</p>
                    <p className="text-white font-medium">{guests} guests, {rooms} room</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('rooms')}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  View Rooms
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-center text-gray-500 text-sm mt-4">
                  Free cancellation available
                </p>

                {/* Contact */}
                <div className="border-t border-white/10 mt-6 pt-6 space-y-3">
                  <p className="text-gray-400 text-sm">Need help? Contact the hotel:</p>
                  <a href={`tel:${hotel.contact.phone}`} className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors">
                    <Phone className="w-4 h-4" />
                    <span>{hotel.contact.phone}</span>
                  </a>
                  <a href={`mailto:${hotel.contact.email}`} className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors">
                    <Mail className="w-4 h-4" />
                    <span>{hotel.contact.email}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={() => setShowGallery(false)}
          >
            <button
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <img
              src={hotel.images[currentImageIndex]}
              alt={`${hotel.name} ${currentImageIndex + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {hotel.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
