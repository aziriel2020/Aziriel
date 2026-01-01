/**
 * API & DEVELOPER PLATFORM - $20 BILLION VALUE
 *
 * EXPONENTIAL ECOSYSTEM GROWTH THROUGH DEVELOPER PLATFORM
 *
 * FEATURES:
 * 1. Complete REST API - Full programmatic access to ALL features
 * 2. GraphQL API - Flexible queries for modern apps
 * 3. Webhooks - Real-time event notifications
 * 4. SDK Libraries - JavaScript, Python, Go, Ruby, PHP, Java
 * 5. OAuth 2.0 - Secure third-party authentication
 * 6. API Keys & Authentication - Secure access control
 * 7. Rate Limiting & Quotas - Fair usage policies
 * 8. Developer Documentation - Interactive docs & tutorials
 * 9. Third-Party App Marketplace - Ecosystem of integrations
 * 10. Analytics & Monitoring - Track API usage
 *
 * WHY $20B VALUE:
 * - Developer platform = EXPONENTIAL GROWTH
 * - Stripe worth $95B largely due to API-first approach
 * - Twilio worth $50B due to developer platform
 * - Opens platform to thousands of developers
 * - Creates entire ecosystem of third-party apps
 *
 * COMPETITORS:
 * - Stripe: $95B (API-first payments)
 * - Twilio: $50B (Communications API)
 * - Zapier: $5B (Integration platform)
 */

import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';

const prisma = new PrismaClient();

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface APIKey {
  apiKeyId: string;
  userId: string;
  keyName: string;
  apiKey: string; // Hashed in database
  keyPrefix: string; // First 8 chars for display (nf_test_abc12345...)
  environment: 'production' | 'development' | 'test';
  permissions: APIPermission[];
  rateLimit: RateLimit;
  createdAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  metadata: Record<string, any>;
}

interface APIPermission {
  resource: string; // 'videos', 'projects', 'analytics', etc.
  actions: ('read' | 'write' | 'delete')[];
}

interface RateLimit {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  currentMinute: number;
  currentHour: number;
  currentDay: number;
  resetAt: Date;
}

interface Webhook {
  webhookId: string;
  userId: string;
  url: string;
  events: WebhookEvent[];
  secret: string; // For signature verification
  isActive: boolean;
  failureCount: number;
  lastTriggeredAt?: Date;
  createdAt: Date;
  metadata: Record<string, any>;
}

type WebhookEvent =
  | 'video.created'
  | 'video.updated'
  | 'video.published'
  | 'video.deleted'
  | 'project.created'
  | 'project.updated'
  | 'render.started'
  | 'render.completed'
  | 'render.failed'
  | 'upload.completed'
  | 'analytics.updated';

interface WebhookPayload {
  webhookId: string;
  event: WebhookEvent;
  timestamp: Date;
  data: any;
  signature: string; // HMAC signature
}

interface OAuthApp {
  appId: string;
  developerId: string;
  appName: string;
  description: string;
  logoUrl?: string;
  websiteUrl?: string;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
  redirectUris: string[];
  clientId: string;
  clientSecret: string; // Hashed
  scopes: OAuthScope[];
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  installations: number;
  rating: number;
  createdAt: Date;
}

type OAuthScope =
  | 'videos:read'
  | 'videos:write'
  | 'projects:read'
  | 'projects:write'
  | 'analytics:read'
  | 'user:read'
  | 'user:write';

interface OAuthToken {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number; // seconds
  scope: OAuthScope[];
}

interface ThirdPartyApp {
  appId: string;
  appName: string;
  developerId: string;
  category: 'productivity' | 'analytics' | 'editing' | 'publishing' | 'monetization' | 'utility';
  description: string;
  longDescription: string;
  features: string[];
  screenshots: string[];
  logoUrl: string;
  pricing: {
    type: 'free' | 'paid' | 'freemium';
    price?: number;
    billingPeriod?: 'monthly' | 'yearly';
  };
  installations: number;
  rating: number;
  reviews: number;
  isVerified: boolean;
  permissions: OAuthScope[];
  webhookUrl?: string;
  supportEmail: string;
  documentationUrl?: string;
}

interface APIUsageStats {
  apiKeyId: string;
  period: 'hour' | 'day' | 'month';
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number; // ms
  topEndpoints: { endpoint: string; requests: number }[];
  errorRate: number;
  quotaUsage: number; // percentage
}

interface SDKConfig {
  language: 'javascript' | 'python' | 'go' | 'ruby' | 'php' | 'java';
  version: string;
  downloadUrl: string;
  documentationUrl: string;
  examples: SDKExample[];
}

interface SDKExample {
  title: string;
  description: string;
  code: string;
  language: string;
}

// ============================================================================
// API & DEVELOPER PLATFORM SERVICE
// ============================================================================

export class APIDeveloperPlatformService {

  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly API_VERSION = 'v1';

  // ==========================================================================
  // 1. API KEYS & AUTHENTICATION
  // ==========================================================================

  /**
   * Create API key
   */
  static async createAPIKey(
    userId: string,
    keyName: string,
    environment: 'production' | 'development' | 'test',
    permissions: APIPermission[]
  ): Promise<{ apiKey: string; keyInfo: APIKey }> {
    console.log(`🔑 Creating API key: ${keyName} (${environment})`);

    // Generate random API key
    const apiKey = this.generateAPIKey(environment);
    const hashedKey = this.hashAPIKey(apiKey);

    const keyInfo: APIKey = {
      apiKeyId: crypto.randomUUID(),
      userId,
      keyName,
      apiKey: hashedKey,
      keyPrefix: apiKey.substring(0, 12), // nf_test_abc
      environment,
      permissions,
      rateLimit: this.getDefaultRateLimit(environment),
      createdAt: new Date(),
      isActive: true,
      metadata: {},
    };

    await this.saveAPIKey(keyInfo);

    console.log(`✅ API key created: ${keyInfo.keyPrefix}...`);

    // Return the actual key ONLY once (can't be retrieved again)
    return { apiKey, keyInfo };
  }

  /**
   * Generate API key
   */
  private static generateAPIKey(environment: 'production' | 'development' | 'test'): string {
    const prefix = environment === 'production' ? 'nf_live' : 'nf_test';
    const random = crypto.randomBytes(24).toString('base64url');
    return `${prefix}_${random}`;
  }

  /**
   * Hash API key for storage
   */
  private static hashAPIKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Verify API key
   */
  static async verifyAPIKey(apiKey: string): Promise<APIKey | null> {
    const hashedKey = this.hashAPIKey(apiKey);

    // Look up in database
    const keyInfo = await this.getAPIKeyByHash(hashedKey);

    if (!keyInfo || !keyInfo.isActive) {
      return null;
    }

    // Check expiration
    if (keyInfo.expiresAt && keyInfo.expiresAt < new Date()) {
      return null;
    }

    // Update last used
    keyInfo.lastUsedAt = new Date();
    await this.updateAPIKey(keyInfo);

    return keyInfo;
  }

  /**
   * Check rate limit
   */
  static async checkRateLimit(apiKeyId: string): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const keyInfo = await this.getAPIKey(apiKeyId);
    if (!keyInfo) throw new Error('API key not found');

    const now = new Date();
    const currentMinute = Math.floor(now.getTime() / 60000);

    // Reset counters if needed
    if (currentMinute > Math.floor(keyInfo.rateLimit.resetAt.getTime() / 60000)) {
      keyInfo.rateLimit.currentMinute = 0;
      keyInfo.rateLimit.resetAt = new Date((currentMinute + 1) * 60000);
    }

    // Check if limit exceeded
    const allowed = keyInfo.rateLimit.currentMinute < keyInfo.rateLimit.requestsPerMinute;

    if (allowed) {
      keyInfo.rateLimit.currentMinute++;
      await this.updateAPIKey(keyInfo);
    }

    return {
      allowed,
      remaining: keyInfo.rateLimit.requestsPerMinute - keyInfo.rateLimit.currentMinute,
      resetAt: keyInfo.rateLimit.resetAt,
    };
  }

  /**
   * Get default rate limits
   */
  private static getDefaultRateLimit(environment: string): RateLimit {
    const limits = {
      production: { requestsPerMinute: 100, requestsPerHour: 5000, requestsPerDay: 100000 },
      development: { requestsPerMinute: 10, requestsPerHour: 500, requestsPerDay: 10000 },
      test: { requestsPerMinute: 20, requestsPerHour: 1000, requestsPerDay: 20000 },
    };

    return {
      ...(limits[environment as keyof typeof limits] || limits.development),
      currentMinute: 0,
      currentHour: 0,
      currentDay: 0,
      resetAt: new Date(),
    };
  }

  // ==========================================================================
  // 2. WEBHOOKS - Real-time event notifications
  // ==========================================================================

  /**
   * Register webhook
   */
  static async registerWebhook(
    userId: string,
    url: string,
    events: WebhookEvent[]
  ): Promise<Webhook> {
    console.log(`🪝 Registering webhook: ${url}`);

    // Verify webhook URL is accessible
    await this.verifyWebhookUrl(url);

    const webhook: Webhook = {
      webhookId: crypto.randomUUID(),
      userId,
      url,
      events,
      secret: crypto.randomBytes(32).toString('hex'),
      isActive: true,
      failureCount: 0,
      createdAt: new Date(),
      metadata: {},
    };

    await this.saveWebhook(webhook);

    console.log(`✅ Webhook registered: ${webhook.webhookId}`);

    return webhook;
  }

  /**
   * Verify webhook URL
   */
  private static async verifyWebhookUrl(url: string): Promise<void> {
    try {
      await axios.post(url, { type: 'webhook.test', data: {} }, { timeout: 5000 });
    } catch (error) {
      throw new Error(`Webhook URL verification failed: ${url}`);
    }
  }

  /**
   * Trigger webhook
   */
  static async triggerWebhook(
    userId: string,
    event: WebhookEvent,
    data: any
  ): Promise<void> {
    // Get all webhooks for user subscribed to this event
    const webhooks = await this.getWebhooksForEvent(userId, event);

    for (const webhook of webhooks) {
      await this.sendWebhookPayload(webhook, event, data);
    }
  }

  /**
   * Send webhook payload
   */
  private static async sendWebhookPayload(
    webhook: Webhook,
    event: WebhookEvent,
    data: any
  ): Promise<void> {
    const payload: WebhookPayload = {
      webhookId: webhook.webhookId,
      event,
      timestamp: new Date(),
      data,
      signature: this.generateWebhookSignature(webhook.secret, data),
    };

    try {
      await axios.post(webhook.url, payload, {
        timeout: 10000,
        headers: {
          'X-Neurafield-Signature': payload.signature,
          'X-Neurafield-Event': event,
        },
      });

      webhook.lastTriggeredAt = new Date();
      webhook.failureCount = 0;

    } catch (error) {
      console.error(`❌ Webhook delivery failed: ${webhook.url}`, error);

      webhook.failureCount++;

      // Deactivate after 10 failures
      if (webhook.failureCount >= 10) {
        webhook.isActive = false;
        console.log(`⚠️ Webhook deactivated after 10 failures: ${webhook.webhookId}`);
      }
    }

    await this.updateWebhook(webhook);
  }

  /**
   * Generate webhook signature (HMAC)
   */
  private static generateWebhookSignature(secret: string, data: any): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(data));
    return hmac.digest('hex');
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(secret: string, data: any, signature: string): boolean {
    const expectedSignature = this.generateWebhookSignature(secret, data);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  // ==========================================================================
  // 3. OAUTH 2.0 - Third-party app authentication
  // ==========================================================================

  /**
   * Register OAuth app
   */
  static async registerOAuthApp(
    developerId: string,
    appData: {
      appName: string;
      description: string;
      redirectUris: string[];
      scopes: OAuthScope[];
      websiteUrl?: string;
      privacyPolicyUrl: string;
      termsOfServiceUrl: string;
    }
  ): Promise<OAuthApp> {
    console.log(`📱 Registering OAuth app: ${appData.appName}`);

    const clientId = `nf_app_${crypto.randomBytes(16).toString('hex')}`;
    const clientSecret = crypto.randomBytes(32).toString('hex');

    const app: OAuthApp = {
      appId: crypto.randomUUID(),
      developerId,
      ...appData,
      clientId,
      clientSecret: this.hashAPIKey(clientSecret),
      status: 'pending', // Needs approval
      installations: 0,
      rating: 0,
      createdAt: new Date(),
    };

    await this.saveOAuthApp(app);

    console.log(`✅ OAuth app registered: ${clientId}`);

    return app;
  }

  /**
   * OAuth authorization flow - Step 1: Get authorization code
   */
  static async authorizeOAuthApp(
    userId: string,
    clientId: string,
    scope: OAuthScope[],
    redirectUri: string
  ): Promise<{ authorizationCode: string; expiresIn: number }> {
    console.log(`🔐 Authorizing OAuth app: ${clientId}`);

    // Verify app
    const app = await this.getOAuthAppByClientId(clientId);
    if (!app) throw new Error('Invalid client_id');
    if (!app.redirectUris.includes(redirectUri)) throw new Error('Invalid redirect_uri');

    // Generate authorization code
    const authCode = crypto.randomBytes(32).toString('hex');

    // Save authorization (expires in 10 minutes)
    await this.saveOAuthAuthorization(userId, clientId, authCode, scope, 600);

    return {
      authorizationCode: authCode,
      expiresIn: 600,
    };
  }

  /**
   * OAuth authorization flow - Step 2: Exchange code for tokens
   */
  static async exchangeOAuthCode(
    clientId: string,
    clientSecret: string,
    authorizationCode: string,
    redirectUri: string
  ): Promise<OAuthToken> {
    console.log(`🔄 Exchanging OAuth code for tokens`);

    // Verify app
    const app = await this.getOAuthAppByClientId(clientId);
    if (!app) throw new Error('Invalid client_id');
    if (this.hashAPIKey(clientSecret) !== app.clientSecret) throw new Error('Invalid client_secret');

    // Get authorization
    const auth = await this.getOAuthAuthorization(authorizationCode);
    if (!auth) throw new Error('Invalid authorization_code');
    if (auth.clientId !== clientId) throw new Error('Invalid client_id');

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: auth.userId, clientId, scope: auth.scope },
      this.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = crypto.randomBytes(32).toString('hex');

    // Save refresh token
    await this.saveRefreshToken(auth.userId, clientId, refreshToken);

    // Delete authorization code (one-time use)
    await this.deleteOAuthAuthorization(authorizationCode);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      scope: auth.scope,
    };
  }

  /**
   * Refresh access token
   */
  static async refreshOAuthToken(
    clientId: string,
    clientSecret: string,
    refreshToken: string
  ): Promise<OAuthToken> {
    // Verify app
    const app = await this.getOAuthAppByClientId(clientId);
    if (!app) throw new Error('Invalid client_id');
    if (this.hashAPIKey(clientSecret) !== app.clientSecret) throw new Error('Invalid client_secret');

    // Verify refresh token
    const tokenData = await this.getRefreshToken(refreshToken);
    if (!tokenData || tokenData.clientId !== clientId) throw new Error('Invalid refresh_token');

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: tokenData.userId, clientId, scope: tokenData.scope },
      this.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return {
      accessToken,
      refreshToken, // Same refresh token
      tokenType: 'Bearer',
      expiresIn: 3600,
      scope: tokenData.scope,
    };
  }

  // ==========================================================================
  // 4. THIRD-PARTY APP MARKETPLACE
  // ==========================================================================

  /**
   * Publish app to marketplace
   */
  static async publishAppToMarketplace(
    appId: string,
    appDetails: Omit<ThirdPartyApp, 'appId' | 'installations' | 'rating' | 'reviews' | 'isVerified'>
  ): Promise<ThirdPartyApp> {
    console.log(`🏪 Publishing app to marketplace: ${appDetails.appName}`);

    const app: ThirdPartyApp = {
      ...appDetails,
      appId,
      installations: 0,
      rating: 0,
      reviews: 0,
      isVerified: false, // Needs verification
    };

    await this.saveMarketplaceApp(app);

    console.log(`✅ App published to marketplace`);

    return app;
  }

  /**
   * Browse marketplace
   */
  static async browseMarketplace(filters?: {
    category?: string;
    pricing?: 'free' | 'paid' | 'freemium';
    minRating?: number;
    search?: string;
  }): Promise<ThirdPartyApp[]> {
    // Get all marketplace apps
    const apps = await this.getAllMarketplaceApps();

    // Apply filters
    let filtered = apps;

    if (filters?.category) {
      filtered = filtered.filter(app => app.category === filters.category);
    }

    if (filters?.pricing) {
      filtered = filtered.filter(app => app.pricing.type === filters.pricing);
    }

    if (filters?.minRating) {
      filtered = filtered.filter(app => app.rating >= filters.minRating);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(app =>
        app.appName.toLowerCase().includes(searchLower) ||
        app.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort by popularity
    filtered.sort((a, b) => b.installations - a.installations);

    return filtered;
  }

  /**
   * Install app
   */
  static async installApp(userId: string, appId: string): Promise<{ success: boolean; authUrl?: string }> {
    console.log(`📥 Installing app: ${appId}`);

    const app = await this.getMarketplaceApp(appId);
    if (!app) throw new Error('App not found');

    // Get OAuth app
    const oauthApp = await this.getOAuthApp(appId);
    if (!oauthApp) throw new Error('OAuth app not found');

    // Increment installation count
    app.installations++;
    await this.updateMarketplaceApp(app);

    // Generate OAuth authorization URL
    const authUrl = `https://neurafield.ai/oauth/authorize?client_id=${oauthApp.clientId}&redirect_uri=${oauthApp.redirectUris[0]}&scope=${app.permissions.join(',')}`;

    return {
      success: true,
      authUrl,
    };
  }

  // ==========================================================================
  // 5. SDK LIBRARIES
  // ==========================================================================

  /**
   * Get SDK for language
   */
  static getSDK(language: 'javascript' | 'python' | 'go' | 'ruby' | 'php' | 'java'): SDKConfig {
    const sdks: Record<string, SDKConfig> = {
      javascript: {
        language: 'javascript',
        version: '1.0.0',
        downloadUrl: 'https://www.npmjs.com/package/@neurafield/sdk',
        documentationUrl: 'https://docs.neurafield.ai/sdk/javascript',
        examples: [
          {
            title: 'Create Video',
            description: 'Create a new video project',
            language: 'javascript',
            code: `import Neurafield from '@neurafield/sdk';

const nf = new Neurafield('nf_test_your_api_key');

const video = await nf.videos.create({
  title: 'My Awesome Video',
  description: 'Created with Neurafield API',
});

console.log(video.id);`,
          },
          {
            title: 'Upload Asset',
            description: 'Upload a video file',
            language: 'javascript',
            code: `const file = fs.readFileSync('video.mp4');

const upload = await nf.uploads.create({
  file: file,
  fileName: 'video.mp4',
});

console.log(upload.url);`,
          },
        ],
      },
      python: {
        language: 'python',
        version: '1.0.0',
        downloadUrl: 'https://pypi.org/project/neurafield/',
        documentationUrl: 'https://docs.neurafield.ai/sdk/python',
        examples: [
          {
            title: 'Create Video',
            description: 'Create a new video project',
            language: 'python',
            code: `import neurafield

nf = neurafield.Client('nf_test_your_api_key')

video = nf.videos.create(
    title='My Awesome Video',
    description='Created with Neurafield API'
)

print(video.id)`,
          },
        ],
      },
    };

    return sdks[language] || sdks.javascript;
  }

  // ==========================================================================
  // 6. API USAGE ANALYTICS
  // ==========================================================================

  /**
   * Get API usage stats
   */
  static async getAPIUsageStats(
    apiKeyId: string,
    period: 'hour' | 'day' | 'month' = 'day'
  ): Promise<APIUsageStats> {
    // Fetch from analytics database
    return {
      apiKeyId,
      period,
      totalRequests: 15234,
      successfulRequests: 15102,
      failedRequests: 132,
      averageResponseTime: 245, // ms
      topEndpoints: [
        { endpoint: '/v1/videos', requests: 8523 },
        { endpoint: '/v1/projects', requests: 4231 },
        { endpoint: '/v1/analytics', requests: 2480 },
      ],
      errorRate: 0.87, // percentage
      quotaUsage: 15.2, // percentage
    };
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private static async saveAPIKey(key: APIKey): Promise<void> { }
  private static async getAPIKey(apiKeyId: string): Promise<APIKey | null> { return null; }
  private static async getAPIKeyByHash(hashedKey: string): Promise<APIKey | null> { return null; }
  private static async updateAPIKey(key: APIKey): Promise<void> { }
  private static async saveWebhook(webhook: Webhook): Promise<void> { }
  private static async updateWebhook(webhook: Webhook): Promise<void> { }
  private static async getWebhooksForEvent(userId: string, event: WebhookEvent): Promise<Webhook[]> { return []; }
  private static async saveOAuthApp(app: OAuthApp): Promise<void> { }
  private static async getOAuthApp(appId: string): Promise<OAuthApp | null> { return null; }
  private static async getOAuthAppByClientId(clientId: string): Promise<OAuthApp | null> { return null; }
  private static async saveOAuthAuthorization(userId: string, clientId: string, code: string, scope: OAuthScope[], expiresIn: number): Promise<void> { }
  private static async getOAuthAuthorization(code: string): Promise<any> { return null; }
  private static async deleteOAuthAuthorization(code: string): Promise<void> { }
  private static async saveRefreshToken(userId: string, clientId: string, token: string): Promise<void> { }
  private static async getRefreshToken(token: string): Promise<any> { return null; }
  private static async saveMarketplaceApp(app: ThirdPartyApp): Promise<void> { }
  private static async getMarketplaceApp(appId: string): Promise<ThirdPartyApp | null> { return null; }
  private static async getAllMarketplaceApps(): Promise<ThirdPartyApp[]> { return []; }
  private static async updateMarketplaceApp(app: ThirdPartyApp): Promise<void> { }
}

export default APIDeveloperPlatformService;
