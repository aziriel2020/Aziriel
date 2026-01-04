/**
 * AGENT-TO-AGENT COLLABORATION PROTOCOL
 *
 * Frictionless social coordination via PDT negotiation
 * - PDTs ping each other directly (no human coordination overhead)
 * - Privacy-preserving: only share what's necessary
 * - Example: "Plan dinner with Sarah and Mike" → Agents handle everything
 * - Uses LatentMAS for efficient agent communication
 *
 * Revolutionary UX: Natural language request → fully coordinated result
 */

import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../../config/database';
import { LatentMASService } from '../omniverse/latent-mas.service';
import { PersonalDigitalTwinService } from './personal-digital-twin.service';

export interface CollaborationRequest {
  id: string;
  initiatorUserId: string;
  participantUserIds: string[];
  goal: string; // "Plan dinner", "Schedule meeting", "Coordinate trip"
  context?: {
    preferredDates?: string[];
    location?: string;
    budget?: number;
    constraints?: string[];
  };
  status: 'pending' | 'negotiating' | 'completed' | 'failed';
  result?: CollaborationResult;
  messages: CollaborationMessage[];
  createdAt: Date;
  completedAt?: Date;
}

export interface CollaborationResult {
  decision: string; // "Dinner at Luigi's, Friday 7:30 PM"
  details: Record<string, any>; // { restaurant: "Luigi's", date: "2026-01-10", time: "19:30" }
  confidence: number;
  fallbackOptions?: Array<{
    decision: string;
    details: Record<string, any>;
    score: number;
  }>;
}

export interface CollaborationMessage {
  id: string;
  fromAgentId: string;
  toAgentId?: string; // undefined = broadcast
  type: 'proposal' | 'acceptance' | 'rejection' | 'counter-proposal' | 'query';
  content: string;
  data?: Record<string, any>;
  timestamp: Date;
}

export interface AgentPreferences {
  userId: string;
  calendar: {
    available: Array<{ start: Date; end: Date }>;
    timezone: string;
  };
  preferences: {
    cuisinePreferences?: string[];
    budgetRange?: { min: number; max: number };
    locationPreferences?: string[];
    customRules?: string[];
  };
}

export class AgentCollaborationService {
  private static anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  /**
   * Initiate collaboration between multiple users' PDTs
   * Example: "Plan dinner with Sarah and Mike this weekend"
   */
  static async initiateCollaboration(data: {
    initiatorUserId: string;
    participantUserIds: string[];
    goal: string;
    context?: CollaborationRequest['context'];
  }): Promise<CollaborationRequest> {
    const request: CollaborationRequest = {
      id: `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      initiatorUserId: data.initiatorUserId,
      participantUserIds: data.participantUserIds,
      goal: data.goal,
      context: data.context,
      status: 'pending',
      messages: [],
      createdAt: new Date(),
    };

    // Store in database
    await prisma.$executeRaw`
      INSERT INTO agent_collaborations (id, initiator_user_id, participant_user_ids, goal, context, status, messages, created_at)
      VALUES (${request.id}, ${data.initiatorUserId}, ${JSON.stringify(data.participantUserIds)},
              ${data.goal}, ${JSON.stringify(data.context)}, ${request.status}, '[]'::jsonb, NOW())
    `;

    console.log(
      `[AGENT-COLLAB] Initiated: ${data.goal} with ${data.participantUserIds.length} participants`
    );

    // Start negotiation process
    await this.runNegotiation(request);

    return request;
  }

  /**
   * Run multi-agent negotiation to achieve goal
   */
  private static async runNegotiation(
    request: CollaborationRequest
  ): Promise<void> {
    request.status = 'negotiating';

    // Get all participants' PDTs
    const allUserIds = [
      request.initiatorUserId,
      ...request.participantUserIds,
    ];
    const agents = await Promise.all(
      allUserIds.map((userId) => this.getAgentForUser(userId))
    );

    // Gather each agent's preferences
    const preferences = await Promise.all(
      allUserIds.map((userId) => this.gatherAgentPreferences(userId, request))
    );

    // Create LatentMAS conversation for efficient negotiation
    const latentConversation = await LatentMASService.multiAgentCollaboration({
      agentIds: agents.map((a) => a.id),
      goal: request.goal,
      maxRounds: 5,
    });

    // Decode final decision using Claude
    const result = await this.synthesizeResult({
      request,
      preferences,
      latentConversation,
    });

    request.result = result;
    request.status = 'completed';
    request.completedAt = new Date();

    // Update database
    await prisma.$executeRaw`
      UPDATE agent_collaborations
      SET status = ${request.status},
          result = ${JSON.stringify(request.result)},
          completed_at = NOW()
      WHERE id = ${request.id}
    `;

    // Notify all participants
    await this.notifyParticipants(request);

    console.log(
      `[AGENT-COLLAB] Completed: ${request.goal} → ${result.decision}`
    );
  }

  /**
   * Gather agent's preferences for the collaboration
   */
  private static async gatherAgentPreferences(
    userId: string,
    request: CollaborationRequest
  ): Promise<AgentPreferences> {
    // Get user's calendar availability
    const calendar = await this.getCalendarAvailability(userId, request);

    // Get user's preferences from PDT memory
    const pdtId = `pdt_${userId}`;
    const pdt = await PersonalDigitalTwinService['getPDT'](pdtId);

    // Extract relevant preferences based on goal type
    const preferences = await this.extractRelevantPreferences(
      userId,
      request.goal,
      pdt
    );

    return {
      userId,
      calendar,
      preferences,
    };
  }

  /**
   * Get user's calendar availability
   */
  private static async getCalendarAvailability(
    userId: string,
    request: CollaborationRequest
  ): Promise<AgentPreferences['calendar']> {
    // PRODUCTION: Integrate with Google Calendar, Outlook, etc.
    // For now, return mock availability

    const preferredDates = request.context?.preferredDates || [];
    const available: Array<{ start: Date; end: Date }> = [];

    if (preferredDates.length > 0) {
      // Parse preferred dates
      for (const dateStr of preferredDates) {
        const date = new Date(dateStr);
        // Add typical dinner times (6-9 PM)
        for (let hour = 18; hour <= 20; hour++) {
          available.push({
            start: new Date(date.setHours(hour, 0, 0, 0)),
            end: new Date(date.setHours(hour + 2, 0, 0, 0)),
          });
        }
      }
    } else {
      // Default: next 7 days, evenings
      const today = new Date();
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() + day);
        for (let hour = 18; hour <= 20; hour++) {
          available.push({
            start: new Date(date.setHours(hour, 0, 0, 0)),
            end: new Date(date.setHours(hour + 2, 0, 0, 0)),
          });
        }
      }
    }

    return {
      available,
      timezone: 'America/New_York', // Would get from user profile
    };
  }

  /**
   * Extract relevant preferences from PDT
   */
  private static async extractRelevantPreferences(
    userId: string,
    goal: string,
    pdt: any
  ): Promise<AgentPreferences['preferences']> {
    // Use Claude to analyze goal and extract relevant preferences
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Goal: "${goal}"

User's known preferences:
- Likes: ${pdt.memory?.preferences?.likes?.join(', ') || 'None'}
- Dislikes: ${pdt.memory?.preferences?.dislikes?.join(', ') || 'None'}
- Custom rules: ${pdt.memory?.preferences?.customRules?.join(', ') || 'None'}

Extract relevant preferences for this goal in JSON format:
{
  "cuisinePreferences": ["Italian", "Japanese"],
  "budgetRange": { "min": 20, "max": 50 },
  "locationPreferences": ["downtown", "near office"],
  "customRules": ["no seafood", "vegetarian options required"]
}

Only include fields that are relevant to the goal.`,
        },
      ],
    });

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '{}';

    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch {
      return {};
    }
  }

  /**
   * Synthesize final result from negotiation
   */
  private static async synthesizeResult(data: {
    request: CollaborationRequest;
    preferences: AgentPreferences[];
    latentConversation: any;
  }): Promise<CollaborationResult> {
    // Use Claude to synthesize optimal decision
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: `You are a coordination AI synthesizing the best outcome for a group.
Your goal is to find a solution that satisfies everyone's preferences as much as possible.`,
      messages: [
        {
          role: 'user',
          content: `Goal: "${data.request.goal}"

Participants' preferences:
${JSON.stringify(data.preferences, null, 2)}

Context:
${JSON.stringify(data.request.context, null, 2)}

Based on the preferences and context, suggest the BEST option that satisfies everyone.

Return JSON:
{
  "decision": "Concise one-line decision",
  "details": {
    "specific": "fields",
    "for": "the decision"
  },
  "confidence": 0.95,
  "reasoning": "Why this is the best option",
  "fallbackOptions": [
    {
      "decision": "Alternative option",
      "details": {},
      "score": 0.85
    }
  ]
}`,
        },
      ],
    });

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '{}';

    try {
      const parsed = JSON.parse(text);
      return {
        decision: parsed.decision || 'Unable to find consensus',
        details: parsed.details || {},
        confidence: parsed.confidence || 0.5,
        fallbackOptions: parsed.fallbackOptions || [],
      };
    } catch {
      return {
        decision: 'Unable to synthesize decision',
        details: {},
        confidence: 0.3,
      };
    }
  }

  /**
   * Notify all participants of the result
   */
  private static async notifyParticipants(
    request: CollaborationRequest
  ): Promise<void> {
    const allUserIds = [
      request.initiatorUserId,
      ...request.participantUserIds,
    ];

    for (const userId of allUserIds) {
      // PRODUCTION: Send push notification, email, or in-app notification
      await prisma.$executeRaw`
        INSERT INTO notifications (user_id, type, title, message, data, created_at)
        VALUES (${userId}, 'collaboration_complete',
                'Plan Complete: ${request.goal}',
                ${request.result?.decision || 'Decision reached'},
                ${JSON.stringify(request.result)}, NOW())
      `;
    }

    console.log(
      `[AGENT-COLLAB] Notified ${allUserIds.length} participants of result`
    );
  }

  /**
   * Get or create agent for user
   */
  private static async getAgentForUser(userId: string): Promise<any> {
    // Check if user already has a digital twin agent
    const existingAgent = await LatentMASService['getAgent'](
      `agent_twin_${userId}`
    );

    if (existingAgent) {
      return existingAgent;
    }

    // Create new agent for user
    const agent = await LatentMASService.createAgent({
      type: 'digital-twin',
      userId,
      personality: {
        traits: ['helpful', 'efficient', 'respectful'],
        tone: 'friendly',
        expertise: ['scheduling', 'preferences', 'coordination'],
      },
      goals: ['represent user', 'find consensus', 'respect preferences'],
    });

    return agent;
  }

  /**
   * Quick helpers for common collaboration types
   */

  /**
   * Plan dinner with friends
   */
  static async planDinner(data: {
    userId: string;
    friendUserIds: string[];
    preferredDates?: string[];
    cuisine?: string;
    budget?: number;
  }): Promise<CollaborationRequest> {
    return this.initiateCollaboration({
      initiatorUserId: data.userId,
      participantUserIds: data.friendUserIds,
      goal: 'Plan dinner',
      context: {
        preferredDates: data.preferredDates,
        constraints: data.cuisine ? [`cuisine: ${data.cuisine}`] : undefined,
        budget: data.budget,
      },
    });
  }

  /**
   * Schedule meeting
   */
  static async scheduleMeeting(data: {
    userId: string;
    attendeeUserIds: string[];
    duration: number; // minutes
    preferredDates?: string[];
    location?: string;
  }): Promise<CollaborationRequest> {
    return this.initiateCollaboration({
      initiatorUserId: data.userId,
      participantUserIds: data.attendeeUserIds,
      goal: `Schedule ${data.duration}-minute meeting`,
      context: {
        preferredDates: data.preferredDates,
        location: data.location,
        constraints: [`duration: ${data.duration} minutes`],
      },
    });
  }

  /**
   * Plan trip
   */
  static async planTrip(data: {
    userId: string;
    travelCompanionUserIds: string[];
    destination?: string;
    preferredDates?: string[];
    budget?: number;
  }): Promise<CollaborationRequest> {
    return this.initiateCollaboration({
      initiatorUserId: data.userId,
      participantUserIds: data.travelCompanionUserIds,
      goal: `Plan trip${data.destination ? ` to ${data.destination}` : ''}`,
      context: {
        preferredDates: data.preferredDates,
        location: data.destination,
        budget: data.budget,
      },
    });
  }

  /**
   * Get collaboration status
   */
  static async getCollaboration(
    collaborationId: string
  ): Promise<CollaborationRequest | null> {
    const result = await prisma.$queryRaw<Array<any>>`
      SELECT * FROM agent_collaborations
      WHERE id = ${collaborationId}
      LIMIT 1
    `;

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id,
      initiatorUserId: row.initiator_user_id,
      participantUserIds: row.participant_user_ids,
      goal: row.goal,
      context: row.context,
      status: row.status,
      result: row.result,
      messages: row.messages || [],
      createdAt: row.created_at,
      completedAt: row.completed_at,
    };
  }

  /**
   * Get user's collaboration history
   */
  static async getUserCollaborations(
    userId: string,
    limit: number = 20
  ): Promise<CollaborationRequest[]> {
    const results = await prisma.$queryRaw<Array<any>>`
      SELECT * FROM agent_collaborations
      WHERE initiator_user_id = ${userId}
         OR ${userId} = ANY(participant_user_ids)
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return results.map((row) => ({
      id: row.id,
      initiatorUserId: row.initiator_user_id,
      participantUserIds: row.participant_user_ids,
      goal: row.goal,
      context: row.context,
      status: row.status,
      result: row.result,
      messages: row.messages || [],
      createdAt: row.created_at,
      completedAt: row.completed_at,
    }));
  }

  /**
   * Cancel collaboration
   */
  static async cancelCollaboration(collaborationId: string): Promise<void> {
    await prisma.$executeRaw`
      UPDATE agent_collaborations
      SET status = 'failed'
      WHERE id = ${collaborationId}
    `;
  }
}
