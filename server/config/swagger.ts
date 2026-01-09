// @ts-nocheck
/**
 * Swagger/OpenAPI Configuration
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NEURAFIELD QUANTUM API',
      version: '5.0.0',
      description: `
# 🚀 NEURAFIELD QUANTUM API

The ultimate AI-powered content generation platform with 200+ AI providers, 500+ models, and advanced Cinematix Engine.

## Features

- **200+ AI Providers**: OpenAI, Anthropic, Google, Runway, Midjourney, and more
- **500+ Models**: Video, image, audio, and 3D generation
- **Cinematix Engine**: 12 advanced filmmaking innovations
- **Social Platform**: Share, collaborate, and discover
- **Enterprise Ready**: SSO, audit logs, advanced security

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
\`\`\`

Get your token by logging in or registering.
      `,
      contact: {
        name: 'NEURAFIELD QUANTUM Support',
        email: 'support@neurafield.ai',
      },
      license: {
        name: 'Proprietary',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.neurafield.ai',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            username: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['USER', 'CREATOR', 'ADMIN', 'ENTERPRISE'] },
            plan: { type: 'string', enum: ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'] },
            status: { type: 'string', enum: ['ACTIVE', 'SUSPENDED', 'BANNED'] },
            credits: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Job: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['VIDEO', 'IMAGE', 'AUDIO', 'MODEL_3D'] },
            status: { type: 'string', enum: ['PENDING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'] },
            progress: { type: 'integer', minimum: 0, maximum: 100 },
            prompt: { type: 'string' },
            provider: { type: 'string' },
            outputUrl: { type: 'string', format: 'uri' },
            error: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time' },
          },
        },
        Post: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            authorId: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            content: { type: 'string' },
            mediaUrl: { type: 'string', format: 'uri' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            amount: { type: 'integer', description: 'Amount in cents' },
            status: { type: 'string', enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] },
            stripePaymentIntentId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'array', items: { type: 'object' } },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Generation', description: 'AI content generation' },
      { name: 'Jobs', description: 'Job management' },
      { name: 'Social', description: 'Social features (posts, comments, likes)' },
      { name: 'Payments', description: 'Payment and subscriptions' },
      { name: 'Admin', description: 'Admin endpoints (requires ADMIN role)' },
      { name: 'AI Providers', description: 'AI provider information' },
      { name: 'Cinematix', description: 'Cinematix Engine features' },
    ],
  },
  apis: ['./server/routes/*.ts', './server/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
