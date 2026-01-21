'use client';

/**
 * AI TRAVEL ASSISTANT PAGE
 * Full-featured AI chat for travel planning
 * Powered by OpenAI GPT-4 & Anthropic Claude
 */

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  User,
  Send,
  Plane,
  Hotel,
  MapPin,
  Calendar,
  Sparkles,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Mic,
  MicOff,
  Image,
  Paperclip,
  ChevronDown,
  Globe,
  Sun,
  Moon,
  DollarSign,
  Users,
  ArrowRight,
  X,
  Menu,
  History,
  Trash2,
  Plus
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: TravelSuggestion[];
  feedback?: 'positive' | 'negative';
}

interface TravelSuggestion {
  type: 'flight' | 'hotel' | 'destination' | 'itinerary';
  title: string;
  description: string;
  price?: number;
  image?: string;
  link?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const QUICK_PROMPTS = [
  { icon: Plane, text: "Find me flights to Paris next month" },
  { icon: Hotel, text: "Best hotels in Tokyo under $200/night" },
  { icon: MapPin, text: "Plan a 7-day trip to Italy" },
  { icon: Sun, text: "Beach destinations for December" },
  { icon: Globe, text: "Hidden gems in Southeast Asia" },
  { icon: Users, text: "Family-friendly resorts in Caribbean" }
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.response || generateDemoResponse(messageText),
        timestamp: new Date(),
        suggestions: data.suggestions || generateDemoSuggestions(messageText)
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      // Demo mode - generate local response
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: generateDemoResponse(messageText),
        timestamp: new Date(),
        suggestions: generateDemoSuggestions(messageText)
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generateDemoResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('paris') || lowerQuery.includes('france')) {
      return `Paris is a wonderful choice! Here's what I recommend:\n\n**Best Time to Visit:** April-June or September-October for mild weather and fewer crowds.\n\n**Must-See Attractions:**\n- Eiffel Tower (book tickets in advance!)\n- Louvre Museum (allow 3-4 hours)\n- Notre-Dame Cathedral\n- Montmartre & Sacré-Cœur\n\n**Budget Tips:**\n- Get a Paris Museum Pass for skip-the-line access\n- Stay in the 11th or 18th arrondissement for better hotel rates\n- Use the Metro - it's efficient and affordable\n\nWould you like me to search for flights or hotels?`;
    }

    if (lowerQuery.includes('tokyo') || lowerQuery.includes('japan')) {
      return `Tokyo is an incredible destination! Here's your guide:\n\n**Best Time to Visit:** March-April (cherry blossoms) or October-November (fall colors).\n\n**Neighborhoods to Explore:**\n- Shibuya - Famous crossing, shopping\n- Shinjuku - Nightlife, Golden Gai\n- Asakusa - Traditional temples\n- Harajuku - Youth culture, fashion\n\n**Pro Tips:**\n- Get a JR Pass if traveling outside Tokyo\n- Try convenience store food - it's amazing!\n- Download Google Translate for the camera feature\n\nShall I find flights or accommodations for you?`;
    }

    if (lowerQuery.includes('beach') || lowerQuery.includes('tropical')) {
      return `Here are my top beach destination picks:\n\n**Caribbean (December-April):**\n- Turks & Caicos - Crystal clear water\n- St. Lucia - Romantic getaway\n- Aruba - Consistent weather\n\n**Southeast Asia (November-March):**\n- Thailand (Phuket, Krabi)\n- Bali, Indonesia\n- Philippines (Palawan)\n\n**Mediterranean (May-September):**\n- Greek Islands\n- Amalfi Coast, Italy\n- Croatia\n\nWhat's your budget and travel dates? I can narrow down the perfect spot!`;
    }

    if (lowerQuery.includes('flight') || lowerQuery.includes('fly')) {
      return `I'd be happy to help you find flights! To get the best deals, I need a few details:\n\n**Please share:**\n1. Departure city\n2. Destination\n3. Travel dates (or flexible dates)\n4. Number of passengers\n5. Preferred class (Economy/Business/First)\n\n**Pro Tips for Cheaper Flights:**\n- Book 6-8 weeks in advance for domestic\n- Book 2-3 months ahead for international\n- Tuesday/Wednesday are often cheapest\n- Use incognito mode when searching\n\nOnce you provide the details, I'll search across 500+ airlines!`;
    }

    if (lowerQuery.includes('hotel') || lowerQuery.includes('stay') || lowerQuery.includes('accommodation')) {
      return `I can help you find the perfect accommodation! Here's what I need:\n\n**Details needed:**\n1. Destination city\n2. Check-in/Check-out dates\n3. Number of guests\n4. Budget range\n5. Any preferences (pool, breakfast, location)\n\n**Accommodation Types:**\n- **Luxury Hotels** - Full service, amenities\n- **Boutique Hotels** - Unique, personalized\n- **Apartments** - Kitchen, more space\n- **Resorts** - All-inclusive options\n\nI have access to 2M+ properties worldwide with exclusive rates!`;
    }

    return `I'd love to help you plan your perfect trip! Here are some ways I can assist:\n\n**What I Can Do:**\n- Search flights across 500+ airlines\n- Find hotels from 2M+ properties\n- Create custom itineraries\n- Provide destination guides\n- Give budget recommendations\n- Share local tips & hidden gems\n\n**Popular Requests:**\n- "Find flights to [destination] in [month]"\n- "Best hotels in [city] under $[budget]"\n- "Plan a [X]-day trip to [destination]"\n- "What's the best time to visit [place]?"\n\nWhat adventure are you dreaming of?`;
  };

  const generateDemoSuggestions = (query: string): TravelSuggestion[] => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('paris') || lowerQuery.includes('france')) {
      return [
        { type: 'flight', title: 'NYC → Paris', description: 'Round-trip, Nov 15-22', price: 487, link: '/flights/search?to=CDG' },
        { type: 'hotel', title: 'Hotel Le Marais', description: '4-star, Central Paris', price: 189, link: '/hotels/search?city=paris' },
        { type: 'destination', title: 'Paris City Guide', description: 'Complete travel guide', link: '/destinations/paris' }
      ];
    }

    if (lowerQuery.includes('tokyo') || lowerQuery.includes('japan')) {
      return [
        { type: 'flight', title: 'LAX → Tokyo', description: 'Round-trip, Direct', price: 892, link: '/flights/search?to=NRT' },
        { type: 'hotel', title: 'Shinjuku Granbell', description: '4-star, Near station', price: 156, link: '/hotels/search?city=tokyo' },
        { type: 'itinerary', title: '7-Day Japan', description: 'Tokyo, Kyoto, Osaka', link: '/itineraries/japan-7day' }
      ];
    }

    if (lowerQuery.includes('beach') || lowerQuery.includes('tropical')) {
      return [
        { type: 'destination', title: 'Maldives', description: 'Ultimate luxury beach', link: '/destinations/maldives' },
        { type: 'destination', title: 'Bali, Indonesia', description: 'Culture meets beach', link: '/destinations/bali' },
        { type: 'destination', title: 'Cancun, Mexico', description: 'All-inclusive paradise', link: '/destinations/cancun' }
      ];
    }

    return [];
  };

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev =>
      prev.map(m =>
        m.id === messageId ? { ...m, feedback } : m
      )
    );
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const startNewConversation = () => {
    if (messages.length > 0) {
      const conversation: Conversation = {
        id: generateId(),
        title: messages[0].content.substring(0, 30) + '...',
        messages: messages,
        createdAt: new Date()
      };
      setConversations(prev => [conversation, ...prev]);
    }
    setMessages([]);
    setCurrentConversationId(null);
  };

  const loadConversation = (conv: Conversation) => {
    setMessages(conv.messages);
    setCurrentConversationId(conv.id);
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      setMessages([]);
      setCurrentConversationId(null);
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-gray-800 border-r border-white/10 flex flex-col overflow-hidden"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-white/10">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                Skyward AI
              </Link>

              <button
                onClick={startNewConversation}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
            </div>

            {/* Conversation History */}
            <div className="flex-1 overflow-y-auto p-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase px-2 mb-2">History</h3>
              {conversations.length === 0 ? (
                <p className="text-gray-500 text-sm px-2">No conversations yet</p>
              ) : (
                <div className="space-y-1">
                  {conversations.map(conv => (
                    <div
                      key={conv.id}
                      className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        currentConversationId === conv.id
                          ? 'bg-blue-600/20 text-blue-400'
                          : 'hover:bg-white/5 text-gray-400'
                      }`}
                      onClick={() => loadConversation(conv)}
                    >
                      <History className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 truncate text-sm">{conv.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-white/10">
              <Link
                href="/dashboard"
                className="block text-center text-sm text-gray-400 hover:text-white transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800/50 border-b border-white/10 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-white">AI Travel Assistant</h1>
              <p className="text-xs text-gray-400">Powered by GPT-4 & Claude</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Online
            </span>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            // Welcome Screen
            <div className="h-full flex flex-col items-center justify-center p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-2">How can I help you today?</h2>
              <p className="text-gray-400 text-center max-w-md mb-8">
                I can help you find flights, hotels, plan trips, and answer any travel questions.
              </p>

              {/* Quick Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl">
                {QUICK_PROMPTS.map((prompt, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleSend(prompt.text)}
                    className="flex items-center gap-3 p-4 bg-gray-800/50 hover:bg-gray-800 border border-white/10 hover:border-blue-500/50 rounded-xl text-left transition-all group"
                  >
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                      <prompt.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-sm text-gray-300">{prompt.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            // Messages
            <div className="max-w-4xl mx-auto p-4 space-y-6">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div className={`flex-1 max-w-2xl ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div
                      className={`inline-block p-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-100'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>

                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <Link
                            key={idx}
                            href={suggestion.link || '#'}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-white/10 rounded-lg transition-colors"
                          >
                            {suggestion.type === 'flight' && <Plane className="w-4 h-4 text-blue-400" />}
                            {suggestion.type === 'hotel' && <Hotel className="w-4 h-4 text-purple-400" />}
                            {suggestion.type === 'destination' && <MapPin className="w-4 h-4 text-green-400" />}
                            {suggestion.type === 'itinerary' && <Calendar className="w-4 h-4 text-orange-400" />}
                            <div className="text-left">
                              <p className="text-sm text-white font-medium">{suggestion.title}</p>
                              <p className="text-xs text-gray-400">{suggestion.description}</p>
                            </div>
                            {suggestion.price && (
                              <span className="text-sm text-green-400 font-semibold ml-2">
                                ${suggestion.price}
                              </span>
                            )}
                            <ArrowRight className="w-4 h-4 text-gray-500" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Actions for assistant messages */}
                    {message.role === 'assistant' && (
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(message.content, message.id)}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                          title="Copy"
                        >
                          {copied === message.id ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                        <button
                          onClick={() => handleFeedback(message.id, 'positive')}
                          className={`p-1.5 hover:bg-white/10 rounded-lg transition-colors ${
                            message.feedback === 'positive' ? 'text-green-400' : 'text-gray-500'
                          }`}
                          title="Helpful"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleFeedback(message.id, 'negative')}
                          className={`p-1.5 hover:bg-white/10 rounded-lg transition-colors ${
                            message.feedback === 'negative' ? 'text-red-400' : 'text-gray-500'
                          }`}
                          title="Not helpful"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-300" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Loading */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-800 rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                      <span className="text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3 bg-gray-800 rounded-2xl p-2">
              <button
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                title="Attach file"
              >
                <Paperclip className="w-5 h-5 text-gray-400" />
              </button>

              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask me anything about travel..."
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none py-2 max-h-[200px]"
              />

              <button
                onClick={() => setIsListening(!isListening)}
                className={`p-2 rounded-xl transition-colors ${
                  isListening ? 'bg-red-500 text-white' : 'hover:bg-white/10'
                }`}
                title="Voice input"
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5 text-gray-400" />
                )}
              </button>

              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>

            <p className="text-center text-xs text-gray-500 mt-2">
              AI can make mistakes. Verify important travel information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
