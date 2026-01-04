# NeuraField Quantum Platform

Revolutionary AI-powered generative social platform combining Google Flow clone capabilities with the Nexus Protocol for post-feed era social coordination.

## 🌟 Overview

NeuraField is a production-ready platform featuring:

- **Flow Studio**: Complete Google Flow clone for AI video generation
- **Personal Digital Twins (PDT)**: Privacy-first local AI filtering based on stated goals
- **Agent Collaboration**: Autonomous agent-to-agent coordination for scheduling
- **Generative UI**: Adaptive interfaces that morph based on conversation context
- **Spatial Worlds**: 3D immersive environments using Gaussian Splatting
- **Voice Translation**: Real-time multilingual translation with voice cloning
- **ActivityPub Federation**: W3C ActivityPub for Fediverse interoperability
- **Web of Trust**: Decentralized trust verification with C2PA and W3C credentials

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- PostgreSQL 16+
- Redis 7+
- Docker (optional)

### Environment Setup

```bash
# Clone repository
git clone https://github.com/yourusername/aziriel.git
cd aziriel

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure .env with your API keys:
# - DATABASE_URL (PostgreSQL)
# - REDIS_URL
# - JWT_SECRET
# - ANTHROPIC_API_KEY
# - OPENAI_API_KEY
# - ELEVENLABS_API_KEY
# - AWS credentials for S3
# - Stripe credentials
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### Development

```bash
# Start development server
npm run dev

# Server runs on http://localhost:3000
```

### Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Start full stack (app + postgres + redis + nginx)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop stack
docker-compose down
```

## 📚 API Documentation

### Authentication

All protected endpoints require JWT authentication:

```bash
Authorization: Bearer <your_jwt_token>
```

### Flow Studio API

#### Text to Film
```bash
POST /api/flow/quick-start/text-to-film
{
  "userId": "uuid",
  "prompt": "A cinematic shot of...",
  "style": "cinematic",
  "duration": 30,
  "quality": "high"
}
```

#### Scene Builder
```bash
POST /api/flow/scene-builder/create
{
  "userId": "uuid",
  "projectId": "uuid",
  "sceneData": {
    "description": "Opening scene...",
    "duration": 10
  }
}
```

#### Video Extension
```bash
POST /api/flow/extend
{
  "userId": "uuid",
  "videoId": "uuid",
  "direction": "forward",
  "duration": 10
}
```

### Nexus Protocol API

#### Personal Digital Twin

**Initialize PDT**
```bash
POST /api/nexus/pdt/initialize
{
  "userId": "uuid",
  "initialGoals": {
    "primary": ["Learn piano", "Get healthy"],
    "avoid": ["Doom scrolling", "Political content"],
    "prioritize": ["Education", "Fitness"]
  }
}
```

**Filter Content**
```bash
POST /api/nexus/pdt/filter
{
  "pdtId": "pdt_uuid",
  "contentBatch": [
    {
      "id": "content_1",
      "title": "10 Minute Piano Lesson",
      "description": "Learn basic chords",
      "contentType": "video"
    }
  ]
}
```

#### Agent Collaboration

**Plan Dinner**
```bash
POST /api/nexus/collaboration/plan-dinner
{
  "userId": "uuid",
  "friendUserIds": ["friend1_uuid", "friend2_uuid"],
  "preferredDates": ["2026-01-10", "2026-01-11"],
  "cuisine": "Italian",
  "budget": 100
}
```

#### Generative UI

**Generate Adaptive UI**
```bash
POST /api/nexus/genui/generate
{
  "conversationId": "conv_uuid",
  "userId": "uuid",
  "intent": "browse",
  "entities": [
    {"type": "product", "name": "Running shoes"}
  ],
  "history": [
    {"role": "user", "content": "I need running shoes"}
  ]
}
```

#### Spatial Worlds

**Generate World**
```bash
POST /api/nexus/spatial/generate
{
  "userId": "uuid",
  "description": "A cozy coffee shop with vintage decor",
  "theme": "vintage",
  "maxParticipants": 20
}
```

**Join World**
```bash
POST /api/nexus/spatial/:worldId/join
{
  "userId": "uuid",
  "position": {"x": 0, "y": 0, "z": 0}
}
```

#### Voice Translation

**Translate Voice**
```bash
POST /api/nexus/translation/translate
Content-Type: multipart/form-data

{
  "audio": <audio_file>,
  "userId": "uuid",
  "sourceLanguage": "en",
  "targetLanguages": ["es", "fr", "ja"],
  "preserveVoice": true
}
```

#### Web of Trust

**Calculate Trust Score**
```bash
POST /api/nexus/trust/score/:userId/calculate
```

**Issue Verifiable Credential**
```bash
POST /api/nexus/trust/credential/issue
{
  "userId": "uuid",
  "type": "VerifiedCreator",
  "credentialSubject": {
    "name": "John Doe",
    "skill": "Video Editing"
  }
}
```

**Create Community Note**
```bash
POST /api/nexus/trust/note
{
  "contentId": "content_uuid",
  "authorId": "uuid",
  "text": "This claim is misleading because...",
  "rating": "misleading",
  "evidence": ["https://source1.com", "https://source2.com"]
}
```

#### ActivityPub Federation

**Create Federated Post**
```bash
POST /api/nexus/activitypub/post
{
  "username": "alice",
  "content": "Hello Fediverse!",
  "visibility": "public"
}
```

**Follow Remote Actor**
```bash
POST /api/nexus/activitypub/follow
{
  "username": "alice",
  "remoteActorId": "https://mastodon.social/users/bob"
}
```

### WebSocket Events

Connect to WebSocket server:
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'your_jwt_token' }
});
```

#### Spatial Worlds Events

```javascript
// Join world
socket.emit('spatial:join', {
  worldId: 'world_uuid',
  userId: 'user_uuid',
  position: {x: 0, y: 0, z: 0}
});

// Update position
socket.emit('spatial:move', {
  worldId: 'world_uuid',
  userId: 'user_uuid',
  position: {x: 10, y: 0, z: 5},
  rotation: {x: 0, y: 90, z: 0}
});

// Listen for other users
socket.on('spatial:user-moved', (data) => {
  console.log('User moved:', data);
});
```

#### Voice Translation Events

```javascript
// Join translation session
socket.emit('translation:join', {
  sessionId: 'session_uuid',
  userId: 'user_uuid'
});

// Stream audio chunk
socket.emit('translation:audio-chunk', {
  sessionId: 'session_uuid',
  userId: 'user_uuid',
  audioChunk: audioBuffer,
  sourceLanguage: 'en'
});

// Receive translation
socket.on('translation:message', (data) => {
  console.log('Translations:', data.translations);
});
```

## 🏗️ Architecture

### Tech Stack

**Backend**
- Node.js 20 + TypeScript
- Express.js
- Prisma ORM + PostgreSQL
- Socket.IO (WebSockets)
- Bull (Job Queue) + Redis
- Winston (Logging)

**AI Services**
- Anthropic Claude Sonnet 3.5 (orchestration)
- OpenAI GPT-4, Whisper, embeddings
- ElevenLabs (voice cloning, TTS)
- Replicate, fal.ai (video generation)
- Meshy5 (3D generation)

**Vector Databases**
- Chroma DB (local, on-device)
- Pinecone (cloud backup)
- Milvus (enterprise scale)

**Security**
- Helmet (security headers)
- CORS
- Rate limiting
- JWT authentication
- Zod validation

**DevOps**
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- Nginx (reverse proxy)
- Jest (testing)

### Directory Structure

```
aziriel/
├── server/
│   ├── index.ts                  # Main entry point
│   ├── config/                   # Configuration
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── aws.ts
│   │   ├── stripe.ts
│   │   └── logger.ts
│   ├── middleware/               # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── security.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/                   # API routes
│   │   ├── flow.routes.ts
│   │   └── nexus/
│   │       ├── pdt.routes.ts
│   │       ├── collaboration.routes.ts
│   │       ├── genui.routes.ts
│   │       ├── spatial.routes.ts
│   │       ├── translation.routes.ts
│   │       ├── activitypub.routes.ts
│   │       └── trust.routes.ts
│   ├── services/                 # Business logic
│   │   └── nexus/
│   │       ├── personal-digital-twin.service.ts
│   │       ├── agent-collaboration.service.ts
│   │       ├── generative-ui.service.ts
│   │       ├── spatial-worlds.service.ts
│   │       ├── voice-translation.service.ts
│   │       ├── activitypub.service.ts
│   │       └── web-of-trust.service.ts
│   ├── websocket/                # WebSocket handlers
│   │   ├── index.ts
│   │   └── handlers/
│   │       ├── spatial.handler.ts
│   │       ├── collaboration.handler.ts
│   │       ├── genui.handler.ts
│   │       └── translation.handler.ts
│   ├── validators/               # Zod schemas
│   │   ├── nexus.validators.ts
│   │   └── flow.validators.ts
│   └── workers/                  # Background jobs
│       ├── index.ts
│       └── video.worker.ts
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Seed data
│   └── migrations/               # Database migrations
├── .github/
│   └── workflows/
│       └── ci.yml                # CI/CD pipeline
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
├── package.json
├── tsconfig.json
└── .env.example
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- health.test.ts
```

## 🔒 Security

- **Helmet**: Security headers and CSP
- **CORS**: Configurable origins
- **Rate Limiting**: 100 requests per 15 minutes (API), 5 per 15 minutes (auth)
- **Input Validation**: Zod schemas on all endpoints
- **JWT**: Secure token-based authentication
- **Secrets Management**: Environment variables only

## 📊 Database Schema

### Core Models

- **User**: Authentication, subscriptions, roles
- **PersonalDigitalTwin**: User's local AI with goals and filtering
- **AgentCollaboration**: Multi-agent coordination sessions
- **GeneratedUI**: Adaptive UI components
- **SpatialWorld**: 3D environments
- **TranslationSession**: Multi-language voice sessions
- **TrustScore**: User reputation scores
- **VerifiableCredential**: W3C credentials
- **FederatedPost**: ActivityPub posts

See `prisma/schema.prisma` for full schema.

## 🚢 Deployment

### Environment Variables

Required environment variables (see `.env.example`):

```bash
# Core
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret-key

# AI Services
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...

# Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...

# Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SENDGRID_API_KEY=SG....

# ActivityPub
DOMAIN=yourdomain.com
```

### Production Checklist

- [ ] Set all environment variables
- [ ] Run database migrations
- [ ] Configure SSL certificates
- [ ] Set up CDN (CloudFront)
- [ ] Configure monitoring (Sentry, Datadog)
- [ ] Set up backups (PostgreSQL, Redis)
- [ ] Enable rate limiting
- [ ] Configure CORS origins
- [ ] Set up log rotation
- [ ] Enable Redis persistence

## 📈 Performance

- **Horizontal Scaling**: Stateless design supports load balancing
- **Caching**: Redis for session management and job queues
- **CDN**: CloudFront for static assets
- **Database**: Connection pooling, indexes on all queries
- **WebSockets**: Socket.IO with Redis adapter for multi-instance

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file

## 🙏 Acknowledgments

- Anthropic for Claude AI
- OpenAI for GPT-4 and Whisper
- W3C for ActivityPub and Verifiable Credentials specifications
- Google for Flow inspiration
- The Fediverse community

## 📞 Support

- Documentation: https://docs.neurafield.ai
- Issues: https://github.com/yourusername/aziriel/issues
- Discord: https://discord.gg/neurafield

---

Built with ❤️ for the post-feed era
