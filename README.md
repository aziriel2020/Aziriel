# NeuraField Quantum - AI Video Generation Platform

> **The Ultimate AI Video Platform** - 15+ State-of-the-Art Models, Production-Ready Infrastructure

🚀 **Way Better Than Higgsfield.ai** - More models, better UX, more features, fully open-source!

## 🎯 Features

### 🎬 15+ AI Video Models
- **Big Three**: Sora 2, Veo 3.1, Gen-4.5
- **Chinese Powerhouses**: Kling 2.6, Kling O1, HunyuanVideo, HY-World, Wan 2.2, Hailuo 2.3
- **Specialized**: Luma Ray 3, Pika 2.2, Mochi 1, Higgsfield, Haiper

### ⚡ Production-Ready Infrastructure
- **Real-time Job Queue** - Bull + Redis for reliable processing
- **WebSocket Updates** - Instant notifications via Socket.io
- **S3 Storage** - AWS S3 or compatible (Cloudflare R2, MinIO)
- **JWT Authentication** - Secure user sessions
- **Credit System** - Usage tracking and limits
- **Rate Limiting** - API protection
- **Comprehensive Logging** - Winston logger
- **Type Safety** - Full TypeScript coverage
- **Validation** - Zod schemas for all inputs

### 🎨 Beautiful Frontend
- **Next.js 14** - Latest App Router
- **Glassmorphism UI** - Modern, stunning design
- **Framer Motion** - Smooth 60fps animations
- **React Query** - Smart data fetching + caching
- **Zustand** - Global state management
- **Real-time Dashboard** - Live job tracking
- **Advanced Gallery** - Grid/List views, filters, search
- **Model Comparison** - Detailed specs for all 15+ models

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/neurafield.git
cd neurafield

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Required variables:**
```env
# Database
DATABASE_URL=postgresql://neurafield:password@localhost:5432/neurafield

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key

# S3 Storage
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET_NAME=neurafield-videos

# AI Model Keys (at least one required)
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
RUNWAY_API_KEY=...
# ... see .env.example for all models
```

### 3. Database Setup

```bash
cd server
npx prisma migrate dev
npx prisma generate
```

### 4. Run with Docker Compose (Recommended)

```bash
# Start all services (PostgreSQL, Redis, MinIO, Server, Client)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Services:**
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- MinIO Console: http://localhost:9001 (minioadmin / minioadmin123)
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### 5. Or Run Locally (Development)

**Terminal 1 - Database & Redis:**
```bash
docker-compose up postgres redis minio -d
```

**Terminal 2 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd client
npm run dev
```

## 📁 Project Structure

```
neurafield/
├── server/                    # Backend (Node.js + Express + TypeScript)
│   ├── controllers/          # Request handlers
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   │   ├── video-generation.service.ts   # 15+ AI models
│   │   ├── queue.service.ts              # Bull queue + workers
│   │   └── s3.service.ts                 # S3 upload
│   ├── middleware/           # Auth, validation, errors
│   ├── config/               # Database, logger
│   ├── prisma/               # Database schema
│   └── app.ts                # Express app + Socket.io
│
├── client/                   # Frontend (Next.js 14 + TypeScript)
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   │   ├── page.tsx     # Landing page
│   │   │   ├── studio/      # Video generation studio
│   │   │   ├── gallery/     # User gallery
│   │   │   ├── dashboard/   # User dashboard
│   │   │   └── models/      # Model comparison
│   │   ├── components/      # React components
│   │   ├── hooks/           # React Query hooks
│   │   ├── store/           # Zustand stores
│   │   └── lib/             # API client, utils
│
├── docker-compose.yml        # Production deployment
└── .env.example              # Environment variables template
```

## 🎬 Usage

### 1. Register/Login
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "secure123",
  "name": "John Doe"
}
```

### 2. Generate Video
```bash
POST /api/generate/video
Authorization: Bearer <token>
{
  "prompt": "A cinematic shot of a futuristic city at sunset",
  "model": "sora2",
  "duration": 10,
  "aspectRatio": "16:9"
}
```

### 3. Check Job Status
```bash
GET /api/jobs/:jobId
Authorization: Bearer <token>
```

### 4. WebSocket Real-time Updates
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', {
  auth: { token: 'your-jwt-token' }
});

socket.on('job:processing', (data) => {
  console.log('Job processing:', data.jobId);
});

socket.on('job:completed', (data) => {
  console.log('Video ready!', data.outputUrl);
});
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Video Generation
- `POST /api/generate/video` - Generate video
- `GET /api/generate/status/:jobId` - Check status

### Jobs
- `GET /api/jobs` - List user jobs (with filters)
- `GET /api/jobs/:id` - Get specific job
- `DELETE /api/jobs/:id` - Delete job

### User
- `GET /api/users/profile` - Get profile
- `PATCH /api/users/profile` - Update profile
- `GET /api/users/credits` - Get credits

## 🎨 Frontend Pages

- **/** - Landing page with hero, features, model showcase
- **/studio** - Video generation studio with 15+ models
- **/gallery** - User gallery with grid/list views, filters
- **/dashboard** - User dashboard with stats, activity feed
- **/models** - Complete model comparison with pros/cons

## 🏗️ Tech Stack

### Backend
- Node.js 20 + Express
- TypeScript
- Prisma (PostgreSQL)
- Bull (Redis queue)
- Socket.io (WebSocket)
- JWT (Authentication)
- AWS SDK v3 (S3)
- Zod (Validation)
- Winston (Logging)

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- React Query
- Zustand
- Socket.io-client
- Axios

### Infrastructure
- Docker + Docker Compose
- PostgreSQL 16
- Redis 7
- MinIO (S3-compatible)
- Nginx (optional)

## 📊 Supported AI Models

| Model | Provider | Cost | Duration | Quality | Best For |
|-------|----------|------|----------|---------|----------|
| Sora 2 | OpenAI | $0.08/s | 25s | ⭐⭐⭐⭐⭐ | Social media, character-driven |
| Veo 3.1 | Google | $0.12/s | 60s+ | ⭐⭐⭐⭐⭐ | Enterprise, long-form |
| Gen-4.5 | Runway | $0.05/s | 10s | ⭐⭐⭐⭐⭐ | VFX, cinematic |
| Hailuo 2.3 | MiniMax | $0.045/s | 6s | ⭐⭐⭐⭐ | Anime, high-volume |
| HunyuanVideo | Tencent | FREE | 10s | ⭐⭐⭐⭐ | Open source, unlimited |
| ... | ... | ... | ... | ... | ... |

See `/models` page for complete comparison!

## 🚢 Production Deployment

### Option 1: Docker Compose (Simple)

```bash
# 1. Configure .env for production
cp .env.example .env
nano .env  # Set all API keys and secrets

# 2. Build and start
docker-compose up -d

# 3. Run migrations
docker-compose exec server npx prisma migrate deploy

# 4. Access at http://your-domain.com:3000
```

### Option 2: Individual Services

**Server:**
```bash
cd server
npm run build
npm start
```

**Client:**
```bash
cd client
npm run build
npm start
```

### Option 3: Cloud Platforms

**Vercel (Frontend):**
```bash
cd client
vercel deploy --prod
```

**Railway/Render (Backend):**
- Connect GitHub repo
- Set environment variables
- Deploy automatically

## 🔐 Security

- JWT tokens with 7-day expiry
- Bcrypt password hashing (10 rounds)
- Rate limiting (100 req/15min general, 5 req/15min auth)
- Input validation with Zod
- Helmet.js security headers
- CORS configuration
- Environment variable secrets

## 📝 Environment Variables

See `.env.example` for complete list. Key variables:

```env
# Core
NODE_ENV=production
PORT=4000
CLIENT_URL=https://your-domain.com

# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# JWT
JWT_SECRET=<strong-random-secret>

# S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=neurafield-videos

# AI Models (15+ keys)
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
# ... etc
```

## 🐛 Troubleshooting

**Database connection error:**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
cd server && npx prisma migrate deploy
```

**Redis connection error:**
```bash
# Check Redis is running
docker-compose ps redis
docker-compose logs redis
```

**S3 upload error:**
- Verify AWS credentials
- Check bucket exists and has correct permissions
- For MinIO: ensure MINIO_ROOT_USER and MINIO_ROOT_PASSWORD are correct

**WebSocket not connecting:**
- Check CORS configuration in `server/app.ts`
- Verify CLIENT_URL environment variable
- Check firewall/proxy settings

## 📄 License

MIT License - See LICENSE file

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🙏 Acknowledgments

- OpenAI (Sora 2)
- Google DeepMind (Veo 3.1)
- Runway (Gen-4.5)
- All the amazing AI video generation providers

---

**Built with ❤️ to bury Higgsfield.ai forever** 💀🔥

For support, open an issue on GitHub.
