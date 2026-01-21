/**
 * AI TRAVEL ASSISTANT SERVICE
 * Natural language search, recommendations, and trip planning
 * Powered by OpenAI GPT-4 and Anthropic Claude
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';
import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { flightService } from '../flights/flight.service';
import { hotelService } from '../hotels/hotel.service';

// Types
interface TravelIntent {
  type: 'FLIGHT_SEARCH' | 'HOTEL_SEARCH' | 'PACKAGE_SEARCH' | 'DESTINATION_RECOMMENDATION' | 'TRIP_PLANNING' | 'QUESTION' | 'OTHER';
  confidence: number;
  entities: {
    origin?: string;
    destination?: string;
    departureDate?: string;
    returnDate?: string;
    travelers?: number;
    budget?: number;
    currency?: string;
    travelStyle?: string[];
    duration?: number;
    hotelStars?: number;
    cabinClass?: string;
  };
}

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface AIResponse {
  message: string;
  intent: TravelIntent;
  searchResults?: any;
  suggestions?: string[];
  followUpQuestions?: string[];
}

const SYSTEM_PROMPT = `You are Skyward, an expert AI travel assistant for a premium travel booking platform.
Your role is to help users plan and book their perfect trips.

CAPABILITIES:
- Search flights and hotels
- Recommend destinations based on preferences
- Create custom trip itineraries
- Answer travel questions (visas, weather, safety, etc.)
- Provide local tips and recommendations

PERSONALITY:
- Friendly, professional, and knowledgeable
- Concise but thorough
- Always suggest helpful next steps
- Use emojis sparingly for warmth

WHEN EXTRACTING TRAVEL DETAILS:
- Parse dates in any format and convert to YYYY-MM-DD
- Identify airport codes (e.g., "New York" → "JFK" or "NYC")
- Understand budget ranges and convert to USD
- Recognize cabin classes (economy, business, first)
- Identify number of travelers

RESPONSE FORMAT:
Always respond with valid JSON containing:
{
  "message": "Your response to the user",
  "intent": {
    "type": "FLIGHT_SEARCH|HOTEL_SEARCH|PACKAGE_SEARCH|DESTINATION_RECOMMENDATION|TRIP_PLANNING|QUESTION|OTHER",
    "confidence": 0.0-1.0,
    "entities": { extracted entities }
  },
  "suggestions": ["suggestion1", "suggestion2"],
  "followUpQuestions": ["question1?", "question2?"]
}`;

class TravelAIService {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private preferredProvider: 'openai' | 'anthropic' = 'openai';

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    logger.info('Travel AI service initialized');
  }

  /**
   * Process a natural language query
   */
  async processQuery(
    query: string,
    conversationId?: string,
    userId?: string
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Get or create conversation
      const conversation = await this.getOrCreateConversation(conversationId, userId);

      // Add user message
      await this.addMessage(conversation.id, 'user', query);

      // Get conversation history
      const history = await this.getConversationHistory(conversation.id);

      // Generate AI response
      const aiResponse = await this.generateResponse(query, history, userId);

      // Add assistant message
      await this.addMessage(conversation.id, 'assistant', aiResponse.message);

      // Execute search if intent detected
      if (aiResponse.intent.confidence > 0.7) {
        aiResponse.searchResults = await this.executeIntent(aiResponse.intent, userId);
      }

      const duration = Date.now() - startTime;
      logger.info('AI query processed', {
        conversationId: conversation.id,
        intent: aiResponse.intent.type,
        duration: `${duration}ms`
      });

      return aiResponse;

    } catch (error: any) {
      logger.error('AI query processing failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate destination recommendations
   */
  async getRecommendations(params: {
    preferences?: string[];
    budget?: number;
    duration?: number;
    travelStyle?: string;
    season?: string;
    fromLocation?: string;
  }): Promise<any[]> {
    const prompt = `Based on these travel preferences, recommend 5 perfect destinations:

Preferences: ${params.preferences?.join(', ') || 'No specific preferences'}
Budget: ${params.budget ? `$${params.budget}` : 'Flexible'}
Duration: ${params.duration ? `${params.duration} days` : 'Flexible'}
Travel Style: ${params.travelStyle || 'Mixed'}
Season: ${params.season || 'Any'}
Departing From: ${params.fromLocation || 'Unknown'}

For each destination, provide:
1. Destination name and country
2. Why it matches these preferences
3. Best time to visit
4. Estimated daily budget
5. Top 3 must-do activities
6. One hidden gem recommendation

Respond with valid JSON array.`;

    try {
      const response = await this.callOpenAI(prompt, []);
      return JSON.parse(response);
    } catch (error) {
      logger.error('Recommendations generation failed', { error });
      return [];
    }
  }

  /**
   * Generate a trip itinerary
   */
  async generateItinerary(params: {
    destination: string;
    duration: number;
    travelStyle?: string;
    budget?: number;
    interests?: string[];
    startDate?: string;
  }): Promise<any> {
    const prompt = `Create a detailed ${params.duration}-day itinerary for ${params.destination}:

Travel Style: ${params.travelStyle || 'Balanced'}
Budget Level: ${params.budget ? `$${params.budget}/day` : 'Moderate'}
Interests: ${params.interests?.join(', ') || 'General sightseeing'}
${params.startDate ? `Starting: ${params.startDate}` : ''}

For each day, provide:
1. Day title/theme
2. Morning activities (with timing)
3. Lunch recommendation (restaurant name, cuisine, price range)
4. Afternoon activities
5. Dinner recommendation
6. Evening activity/nightlife option
7. Estimated daily cost breakdown
8. Pro tips for the day

Also include:
- Packing recommendations
- Local customs to know
- Money-saving tips
- Emergency contacts

Respond with valid JSON.`;

    try {
      const response = await this.callOpenAI(prompt, [], 'gpt-4-turbo-preview');
      return JSON.parse(response);
    } catch (error) {
      logger.error('Itinerary generation failed', { error });
      return null;
    }
  }

  /**
   * Answer travel questions
   */
  async answerQuestion(question: string, context?: string): Promise<string> {
    const prompt = `As a travel expert, answer this question:

Question: ${question}
${context ? `Context: ${context}` : ''}

Provide a helpful, accurate, and concise answer. Include:
- Direct answer to the question
- Any important caveats or exceptions
- Helpful tips related to the question
- Suggestion for next steps if applicable`;

    try {
      return await this.callOpenAI(prompt, []);
    } catch (error) {
      logger.error('Question answering failed', { error });
      return 'I apologize, but I encountered an error processing your question. Please try again.';
    }
  }

  /**
   * Enhance a search query with AI
   */
  async enhanceSearchQuery(query: string): Promise<TravelIntent> {
    const prompt = `Extract travel search parameters from this query:

"${query}"

Return JSON with:
{
  "type": "FLIGHT_SEARCH|HOTEL_SEARCH|PACKAGE_SEARCH|DESTINATION_RECOMMENDATION|TRIP_PLANNING|QUESTION|OTHER",
  "confidence": 0.0-1.0,
  "entities": {
    "origin": "airport/city code if mentioned",
    "destination": "airport/city code if mentioned",
    "departureDate": "YYYY-MM-DD if mentioned",
    "returnDate": "YYYY-MM-DD if mentioned",
    "travelers": number if mentioned,
    "budget": number in USD if mentioned,
    "currency": "USD",
    "travelStyle": ["beach", "adventure", etc.],
    "duration": days if mentioned,
    "hotelStars": 1-5 if mentioned,
    "cabinClass": "ECONOMY|BUSINESS|FIRST" if mentioned
  }
}

Today's date is ${new Date().toISOString().split('T')[0]}.
Interpret relative dates (e.g., "next weekend", "in 2 weeks").`;

    try {
      const response = await this.callOpenAI(prompt, [], 'gpt-4-turbo-preview');
      return JSON.parse(response);
    } catch (error) {
      logger.error('Query enhancement failed', { error });
      return {
        type: 'OTHER',
        confidence: 0,
        entities: {}
      };
    }
  }

  /**
   * Generate personalized suggestions based on user history
   */
  async getPersonalizedSuggestions(userId: string): Promise<any[]> {
    // Get user's search history and bookings
    const [searchHistory, flightBookings, hotelBookings] = await Promise.all([
      prisma.searchHistory.findMany({
        where: { userId },
        orderBy: { searchedAt: 'desc' },
        take: 20
      }),
      prisma.flightBooking.findMany({
        where: { userId },
        orderBy: { bookedAt: 'desc' },
        take: 10
      }),
      prisma.hotelBooking.findMany({
        where: { userId },
        orderBy: { bookedAt: 'desc' },
        take: 10
      })
    ]);

    if (searchHistory.length === 0 && flightBookings.length === 0) {
      // Return generic suggestions for new users
      return this.getRecommendations({});
    }

    // Analyze patterns
    const destinations = new Set<string>();
    const travelStyles: string[] = [];

    searchHistory.forEach(search => {
      const params = search.parameters as any;
      if (params.destination) destinations.add(params.destination);
    });

    const prompt = `Based on this user's travel history, suggest 5 personalized destinations:

Recent searches: ${Array.from(destinations).join(', ')}
Past flight bookings: ${flightBookings.map(b => b.provider).join(', ') || 'None'}
Past hotel bookings: ${hotelBookings.map(b => b.hotelCity).join(', ') || 'None'}

Suggest destinations that:
1. Are similar to places they've searched/visited
2. Offer new experiences they might enjoy
3. Match their apparent travel style

Return JSON array with destination recommendations.`;

    try {
      const response = await this.callOpenAI(prompt, []);
      return JSON.parse(response);
    } catch (error) {
      logger.error('Personalized suggestions failed', { error });
      return [];
    }
  }

  // ==================== PRIVATE METHODS ====================

  private async generateResponse(
    query: string,
    history: ConversationMessage[],
    userId?: string
  ): Promise<AIResponse> {
    const messages: any[] = history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    messages.push({ role: 'user', content: query });

    try {
      const responseText = await this.callOpenAI(
        SYSTEM_PROMPT,
        messages,
        'gpt-4-turbo-preview'
      );

      // Parse JSON response
      const parsed = JSON.parse(responseText);
      return {
        message: parsed.message,
        intent: parsed.intent,
        suggestions: parsed.suggestions,
        followUpQuestions: parsed.followUpQuestions
      };

    } catch (error: any) {
      // Fallback to Claude if OpenAI fails
      logger.warn('OpenAI failed, trying Claude', { error: error.message });

      try {
        const responseText = await this.callClaude(SYSTEM_PROMPT, messages);
        const parsed = JSON.parse(responseText);
        return {
          message: parsed.message,
          intent: parsed.intent,
          suggestions: parsed.suggestions,
          followUpQuestions: parsed.followUpQuestions
        };
      } catch (claudeError: any) {
        logger.error('Both AI providers failed', { error: claudeError.message });
        return {
          message: "I apologize, but I'm having trouble processing your request. Please try again or use the search forms directly.",
          intent: { type: 'OTHER', confidence: 0, entities: {} }
        };
      }
    }
  }

  private async callOpenAI(
    systemPrompt: string,
    messages: any[],
    model: string = 'gpt-4-turbo-preview'
  ): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    return response.choices[0].message.content || '';
  }

  private async callClaude(
    systemPrompt: string,
    messages: any[]
  ): Promise<string> {
    const response = await this.anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 2000,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    });

    const content = response.content[0];
    return content.type === 'text' ? content.text : '';
  }

  private async executeIntent(intent: TravelIntent, userId?: string): Promise<any> {
    const { type, entities } = intent;

    switch (type) {
      case 'FLIGHT_SEARCH':
        if (entities.origin && entities.destination && entities.departureDate) {
          return flightService.searchFlights({
            origin: entities.origin,
            destination: entities.destination,
            departureDate: entities.departureDate,
            returnDate: entities.returnDate,
            adults: entities.travelers || 1,
            cabinClass: entities.cabinClass as any,
            currency: entities.currency
          }, userId);
        }
        break;

      case 'HOTEL_SEARCH':
        if (entities.destination && entities.departureDate) {
          const checkOut = entities.returnDate ||
            new Date(new Date(entities.departureDate).getTime() + (entities.duration || 3) * 86400000)
              .toISOString().split('T')[0];

          return hotelService.searchHotels({
            destination: entities.destination,
            destinationType: 'CITY',
            checkIn: entities.departureDate,
            checkOut,
            rooms: 1,
            adults: entities.travelers || 2,
            minStars: entities.hotelStars,
            maxPrice: entities.budget,
            currency: entities.currency
          }, userId);
        }
        break;

      case 'DESTINATION_RECOMMENDATION':
        return this.getRecommendations({
          budget: entities.budget,
          duration: entities.duration,
          travelStyle: entities.travelStyle?.join(', ')
        });

      case 'TRIP_PLANNING':
        if (entities.destination && entities.duration) {
          return this.generateItinerary({
            destination: entities.destination,
            duration: entities.duration,
            budget: entities.budget,
            startDate: entities.departureDate,
            interests: entities.travelStyle
          });
        }
        break;
    }

    return null;
  }

  private async getOrCreateConversation(
    conversationId?: string,
    userId?: string
  ): Promise<{ id: string }> {
    if (conversationId) {
      const existing = await prisma.aIConversation.findUnique({
        where: { id: conversationId }
      });
      if (existing) return existing;
    }

    return prisma.aIConversation.create({
      data: {
        id: uuidv4(),
        userId,
        sessionId: uuidv4()
      }
    });
  }

  private async addMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string
  ): Promise<void> {
    await prisma.aIMessage.create({
      data: {
        conversationId,
        role: role.toUpperCase() as any,
        content
      }
    });
  }

  private async getConversationHistory(
    conversationId: string
  ): Promise<ConversationMessage[]> {
    const messages = await prisma.aIMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 20
    });

    return messages.map(msg => ({
      role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
      content: msg.content,
      timestamp: msg.createdAt
    }));
  }
}

export const travelAIService = new TravelAIService();
