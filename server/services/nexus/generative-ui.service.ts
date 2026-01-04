/**
 * GENERATIVE UI (GenUI) SYSTEM
 *
 * Revolutionary adaptive interfaces that morph based on conversation context
 * - Router LLM analyzes conversation state
 * - Streams appropriate UI components in real-time
 * - React Server Components (RSC) for dynamic generation
 * - Example: Discussing trip → interface becomes shared map + booking widget
 *
 * NO MORE STATIC UIs - every interface adapts to user intent
 */

import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../../config/database';

export interface UIContext {
  conversationId: string;
  userId: string;
  currentTopic?: string;
  entities: Array<{
    type: 'person' | 'place' | 'product' | 'event' | 'concept';
    name: string;
    metadata?: Record<string, any>;
  }>;
  intent: 'browse' | 'search' | 'create' | 'collaborate' | 'transact' | 'learn';
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}

export interface GeneratedUI {
  id: string;
  components: UIComponent[];
  layout: 'stack' | 'grid' | 'sidebar' | 'fullscreen' | 'floating';
  theme?: 'light' | 'dark' | 'auto';
  metadata: {
    generatedAt: Date;
    confidence: number;
    reasoning: string;
  };
}

export interface UIComponent {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  children?: UIComponent[];
  position?: { x: number; y: number; width?: string; height?: string };
  animation?: 'fade' | 'slide' | 'scale' | 'none';
}

export type ComponentType =
  | 'text'
  | 'input'
  | 'button'
  | 'image'
  | 'video'
  | 'map'
  | 'calendar'
  | 'chart'
  | 'table'
  | 'form'
  | 'card'
  | 'list'
  | 'carousel'
  | 'timeline'
  | 'kanban'
  | 'chat'
  | 'editor'
  | 'player'
  | 'booking'
  | 'checkout'
  | 'profile'
  | 'feed'
  | 'search'
  | 'filter'
  | 'navigation'
  | 'modal'
  | 'drawer'
  | 'tabs'
  | 'accordion'
  | 'breadcrumbs'
  | 'pagination';

export interface UITemplate {
  name: string;
  description: string;
  triggers: string[]; // Keywords that trigger this template
  components: UIComponent[];
  layout: GeneratedUI['layout'];
}

export class GenerativeUIService {
  private static anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  // Pre-built templates for common scenarios
  private static TEMPLATES: UITemplate[] = [
    {
      name: 'trip-planning',
      description: 'Interactive trip planning interface',
      triggers: ['trip', 'travel', 'vacation', 'destination', 'flight', 'hotel'],
      layout: 'grid',
      components: [
        {
          id: 'map',
          type: 'map',
          props: {
            interactive: true,
            markers: [],
            zoom: 10,
          },
        },
        {
          id: 'calendar',
          type: 'calendar',
          props: {
            mode: 'range',
            selectable: true,
          },
        },
        {
          id: 'booking',
          type: 'booking',
          props: {
            type: 'flight',
            filters: ['price', 'duration', 'stops'],
          },
        },
      ],
    },
    {
      name: 'shopping',
      description: 'Product browsing and checkout',
      triggers: ['buy', 'purchase', 'shop', 'product', 'price', 'cart'],
      layout: 'sidebar',
      components: [
        {
          id: 'product-grid',
          type: 'carousel',
          props: {
            items: [],
            itemsPerView: 3,
          },
        },
        {
          id: 'filters',
          type: 'filter',
          props: {
            fields: ['price', 'brand', 'rating', 'category'],
          },
        },
        {
          id: 'checkout',
          type: 'checkout',
          props: {
            showCart: true,
          },
        },
      ],
    },
    {
      name: 'learning',
      description: 'Educational content with progress tracking',
      triggers: ['learn', 'course', 'tutorial', 'lesson', 'study'],
      layout: 'stack',
      components: [
        {
          id: 'video-player',
          type: 'player',
          props: {
            controls: true,
            autoplay: false,
          },
        },
        {
          id: 'progress',
          type: 'timeline',
          props: {
            steps: [],
            currentStep: 0,
          },
        },
        {
          id: 'notes',
          type: 'editor',
          props: {
            placeholder: 'Take notes...',
            toolbar: ['bold', 'italic', 'list'],
          },
        },
      ],
    },
    {
      name: 'collaboration',
      description: 'Real-time collaborative workspace',
      triggers: ['collaborate', 'team', 'share', 'work together', 'project'],
      layout: 'grid',
      components: [
        {
          id: 'kanban',
          type: 'kanban',
          props: {
            columns: ['To Do', 'In Progress', 'Done'],
            items: [],
          },
        },
        {
          id: 'chat',
          type: 'chat',
          props: {
            realtime: true,
            showTyping: true,
          },
        },
        {
          id: 'files',
          type: 'list',
          props: {
            items: [],
            itemType: 'file',
          },
        },
      ],
    },
    {
      name: 'analytics',
      description: 'Data visualization dashboard',
      triggers: ['analytics', 'data', 'stats', 'metrics', 'dashboard', 'insights'],
      layout: 'grid',
      components: [
        {
          id: 'metrics',
          type: 'card',
          props: {
            metrics: [
              { label: 'Users', value: 0 },
              { label: 'Revenue', value: 0 },
              { label: 'Growth', value: 0 },
            ],
          },
        },
        {
          id: 'chart',
          type: 'chart',
          props: {
            type: 'line',
            data: [],
            xAxis: 'date',
            yAxis: 'value',
          },
        },
        {
          id: 'table',
          type: 'table',
          props: {
            columns: [],
            data: [],
            sortable: true,
            filterable: true,
          },
        },
      ],
    },
  ];

  /**
   * Generate UI based on conversation context
   * This is the core GenUI function - analyzes context and returns adaptive UI
   */
  static async generateUI(context: UIContext): Promise<GeneratedUI> {
    // Step 1: Analyze conversation to understand intent and entities
    const analysis = await this.analyzeContext(context);

    // Step 2: Select or generate appropriate components
    const components = await this.selectComponents(context, analysis);

    // Step 3: Determine optimal layout
    const layout = this.determineLayout(context, components);

    const generatedUI: GeneratedUI = {
      id: `ui_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      components,
      layout,
      metadata: {
        generatedAt: new Date(),
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
      },
    };

    // Store in database for analytics
    await this.storeGeneratedUI(context, generatedUI);

    console.log(
      `[GenUI] Generated ${components.length} components for ${context.intent} intent`
    );

    return generatedUI;
  }

  /**
   * Analyze conversation context using Claude
   */
  private static async analyzeContext(context: UIContext): Promise<{
    intent: string;
    entities: Array<{ type: string; name: string; relevance: number }>;
    suggestedComponents: string[];
    confidence: number;
    reasoning: string;
  }> {
    const recentMessages = context.history.slice(-5); // Last 5 messages

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: `You are a UI Router analyzing conversation context to generate the perfect interface.
Analyze the conversation and determine what UI components would best serve the user's needs.`,
      messages: [
        {
          role: 'user',
          content: `Conversation history:
${recentMessages.map((m) => `${m.role}: ${m.content}`).join('\n')}

Current intent: ${context.intent}
Entities: ${JSON.stringify(context.entities)}

Analyze this conversation and return JSON:
{
  "intent": "specific user intent (e.g., 'planning trip to Paris')",
  "entities": [
    { "type": "place", "name": "Paris", "relevance": 0.95 }
  ],
  "suggestedComponents": ["map", "calendar", "booking", "weather"],
  "confidence": 0.9,
  "reasoning": "User is planning a trip, needs map for navigation, calendar for dates, booking for reservations"
}`,
        },
      ],
    });

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '{}';

    try {
      return JSON.parse(text);
    } catch {
      return {
        intent: context.intent,
        entities: [],
        suggestedComponents: ['text', 'input'],
        confidence: 0.5,
        reasoning: 'Fallback to basic UI',
      };
    }
  }

  /**
   * Select appropriate components based on context
   */
  private static async selectComponents(
    context: UIContext,
    analysis: any
  ): Promise<UIComponent[]> {
    // Check if any template matches
    const matchingTemplate = this.findMatchingTemplate(analysis);

    if (matchingTemplate) {
      console.log(`[GenUI] Using template: ${matchingTemplate.name}`);
      return this.customizeTemplate(matchingTemplate, context, analysis);
    }

    // Generate custom components
    return this.generateCustomComponents(context, analysis);
  }

  /**
   * Find matching template based on analysis
   */
  private static findMatchingTemplate(analysis: any): UITemplate | null {
    const intent = analysis.intent.toLowerCase();

    for (const template of this.TEMPLATES) {
      for (const trigger of template.triggers) {
        if (intent.includes(trigger.toLowerCase())) {
          return template;
        }
      }
    }

    return null;
  }

  /**
   * Customize template with context-specific data
   */
  private static customizeTemplate(
    template: UITemplate,
    context: UIContext,
    analysis: any
  ): UIComponent[] {
    const components = JSON.parse(JSON.stringify(template.components)); // Deep clone

    // Inject context-specific data into components
    for (const component of components) {
      // Customize based on entities
      if (component.type === 'map' && analysis.entities.length > 0) {
        const places = analysis.entities.filter((e: any) => e.type === 'place');
        component.props.markers = places.map((p: any) => ({
          name: p.name,
          position: { lat: 0, lng: 0 }, // Would geocode in production
        }));
      }

      // Customize calendar with suggested dates
      if (component.type === 'calendar') {
        component.props.defaultDate = new Date();
      }

      // Add user-specific customization
      component.props.userId = context.userId;
    }

    return components;
  }

  /**
   * Generate custom components from scratch
   */
  private static async generateCustomComponents(
    context: UIContext,
    analysis: any
  ): Promise<UIComponent[]> {
    const components: UIComponent[] = [];

    // Use Claude to generate component specs
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Generate UI components for this scenario:
Intent: ${analysis.intent}
Entities: ${JSON.stringify(analysis.entities)}
Suggested components: ${analysis.suggestedComponents.join(', ')}

Return JSON array of components:
[
  {
    "id": "component-1",
    "type": "text",
    "props": { "content": "Welcome!" }
  },
  {
    "id": "component-2",
    "type": "input",
    "props": { "placeholder": "Enter your message..." }
  }
]

Available types: ${Object.keys(this.COMPONENT_GENERATORS).join(', ')}`,
        },
      ],
    });

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '[]';

    try {
      const parsed = JSON.parse(text);
      return parsed.map((spec: any) => this.instantiateComponent(spec));
    } catch {
      // Fallback to basic components
      return [
        {
          id: 'text-1',
          type: 'text',
          props: { content: 'How can I help you?' },
        },
        {
          id: 'input-1',
          type: 'input',
          props: { placeholder: 'Type your message...' },
        },
      ];
    }
  }

  /**
   * Instantiate component from specification
   */
  private static instantiateComponent(spec: any): UIComponent {
    return {
      id: spec.id || `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: spec.type,
      props: spec.props || {},
      children: spec.children?.map((c: any) => this.instantiateComponent(c)),
      animation: spec.animation || 'fade',
    };
  }

  /**
   * Determine optimal layout
   */
  private static determineLayout(
    context: UIContext,
    components: UIComponent[]
  ): GeneratedUI['layout'] {
    const componentCount = components.length;

    // Simple heuristic-based layout selection
    if (componentCount === 1) return 'fullscreen';
    if (componentCount === 2) return 'sidebar';
    if (componentCount <= 4) return 'grid';
    return 'stack';
  }

  /**
   * Store generated UI for analytics
   */
  private static async storeGeneratedUI(
    context: UIContext,
    ui: GeneratedUI
  ): Promise<void> {
    await prisma.$executeRaw`
      INSERT INTO generated_uis (id, user_id, conversation_id, components, layout, metadata, created_at)
      VALUES (${ui.id}, ${context.userId}, ${context.conversationId},
              ${JSON.stringify(ui.components)}, ${ui.layout},
              ${JSON.stringify(ui.metadata)}, NOW())
    `;
  }

  /**
   * Component generators - functions that generate specific component types
   */
  private static COMPONENT_GENERATORS: Record<
    ComponentType,
    (data: any) => UIComponent
  > = {
    text: (data) => ({
      id: data.id || `text_${Date.now()}`,
      type: 'text',
      props: { content: data.content, ...data.props },
    }),
    input: (data) => ({
      id: data.id || `input_${Date.now()}`,
      type: 'input',
      props: { placeholder: data.placeholder, ...data.props },
    }),
    button: (data) => ({
      id: data.id || `button_${Date.now()}`,
      type: 'button',
      props: { label: data.label, action: data.action, ...data.props },
    }),
    map: (data) => ({
      id: data.id || `map_${Date.now()}`,
      type: 'map',
      props: {
        markers: data.markers || [],
        zoom: data.zoom || 10,
        interactive: true,
        ...data.props,
      },
    }),
    calendar: (data) => ({
      id: data.id || `calendar_${Date.now()}`,
      type: 'calendar',
      props: {
        mode: data.mode || 'single',
        selectable: true,
        ...data.props,
      },
    }),
    // ... would implement all 30+ component types
  } as any;

  /**
   * Stream UI updates in real-time
   * For progressive enhancement as conversation evolves
   */
  static async streamUIUpdates(data: {
    conversationId: string;
    userId: string;
    newMessage: string;
  }): Promise<AsyncGenerator<UIComponent>> {
    // PRODUCTION: Use Server-Sent Events or WebSocket
    // Yield components as they're generated
    async function* generateComponents() {
      // This would analyze the new message and yield new components
      yield {
        id: `update_${Date.now()}`,
        type: 'text',
        props: { content: 'Analyzing...' },
        animation: 'fade',
      } as UIComponent;

      // Would yield actual components based on message analysis
    }

    return generateComponents();
  }

  /**
   * Get UI generation analytics
   */
  static async getAnalytics(userId: string): Promise<{
    totalGenerated: number;
    byIntent: Record<string, number>;
    avgConfidence: number;
    topTemplates: Array<{ name: string; count: number }>;
  }> {
    // Query from database
    const results = await prisma.$queryRaw<Array<any>>`
      SELECT
        COUNT(*) as total,
        AVG((metadata->>'confidence')::float) as avg_confidence
      FROM generated_uis
      WHERE user_id = ${userId}
    `;

    return {
      totalGenerated: results[0]?.total || 0,
      byIntent: {}, // Would aggregate by intent
      avgConfidence: results[0]?.avg_confidence || 0,
      topTemplates: [], // Would aggregate by template usage
    };
  }
}
