/**
 * Database Seed Script
 * Populates database with initial data for development/testing
 */

import { PrismaClient, PlanType, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo users
  const adminPassword = await bcrypt.hash('Admin1234!', 12);
  const userPassword = await bcrypt.hash('User1234!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@neurafield.ai' },
    update: {},
    create: {
      email: 'admin@neurafield.ai',
      username: 'admin',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
      plan: PlanType.ENTERPRISE,
      status: UserStatus.ACTIVE,
      credits: 100000,
      bio: 'Platform Administrator',
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@neurafield.ai' },
    update: {},
    create: {
      email: 'demo@neurafield.ai',
      username: 'demo_user',
      name: 'Demo User',
      password: userPassword,
      role: UserRole.CREATOR,
      plan: PlanType.PRO,
      status: UserStatus.ACTIVE,
      credits: 1000,
      bio: 'Demo creator account showcasing platform capabilities',
    },
  });

  const freeUser = await prisma.user.upsert({
    where: { email: 'free@neurafield.ai' },
    update: {},
    create: {
      email: 'free@neurafield.ai',
      username: 'free_user',
      name: 'Free User',
      password: userPassword,
      role: UserRole.USER,
      plan: PlanType.FREE,
      status: UserStatus.ACTIVE,
      credits: 100,
      bio: 'Free tier user',
    },
  });

  console.log('✅ Created users:', {
    admin: admin.email,
    demo: demoUser.email,
    free: freeUser.email,
  });

  // Create demo tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'ai-video' },
      update: {},
      create: { name: 'ai-video' },
    }),
    prisma.tag.upsert({
      where: { name: 'cinematix' },
      update: {},
      create: { name: 'cinematix' },
    }),
    prisma.tag.upsert({
      where: { name: 'ai-art' },
      update: {},
      create: { name: 'ai-art' },
    }),
    prisma.tag.upsert({
      where: { name: 'tutorial' },
      update: {},
      create: { name: 'tutorial' },
    }),
    prisma.tag.upsert({
      where: { name: 'showcase' },
      update: {},
      create: { name: 'showcase' },
    }),
  ]);

  console.log('✅ Created tags:', tags.map((t) => t.name));

  // Create demo posts
  const post1 = await prisma.post.create({
    data: {
      title: 'Welcome to NEURAFIELD QUANTUM!',
      content: `🚀 Welcome to the future of AI-powered content creation!

NEURAFIELD QUANTUM is the most advanced AI content generation platform with:
- 200+ AI providers
- 500+ models
- 12 Cinematix innovations
- Real-time collaboration
- Enterprise-grade security

Start creating amazing content today!`,
      authorId: admin.id,
      tags: {
        connect: [{ name: 'tutorial' }, { name: 'showcase' }],
      },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Creating Stunning AI Videos with Cinematix',
      content: `Learn how to create professional-quality AI videos using our revolutionary Cinematix Engine.

The Cinematix Engine provides:
- 18 shot types
- 21 camera movements
- 9 VFX categories
- 10 emotion profiles
- Director style presets

Check out the documentation to get started!`,
      authorId: demoUser.id,
      tags: {
        connect: [{ name: 'ai-video' }, { name: 'cinematix' }, { name: 'tutorial' }],
      },
    },
  });

  console.log('✅ Created posts:', [post1.title, post2.title]);

  // Create demo jobs
  const job1 = await prisma.job.create({
    data: {
      userId: demoUser.id,
      type: 'VIDEO',
      status: 'COMPLETED',
      progress: 100,
      prompt: 'A cinematic shot of a futuristic city at sunset',
      provider: 'openai-sora',
      outputUrl: 'https://example.com/videos/demo-1.mp4',
      completedAt: new Date(),
    },
  });

  const job2 = await prisma.job.create({
    data: {
      userId: demoUser.id,
      type: 'IMAGE',
      status: 'COMPLETED',
      progress: 100,
      prompt: 'A beautiful landscape with mountains and rivers',
      provider: 'midjourney',
      outputUrl: 'https://example.com/images/demo-1.png',
      completedAt: new Date(),
    },
  });

  console.log('✅ Created jobs:', [job1.id, job2.id]);

  // Create demo follows
  await prisma.follow.create({
    data: {
      followerId: freeUser.id,
      followingId: demoUser.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: freeUser.id,
      followingId: admin.id,
    },
  });

  console.log('✅ Created follows');

  // Create demo likes
  await prisma.like.create({
    data: {
      userId: freeUser.id,
      postId: post1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: demoUser.id,
      postId: post1.id,
    },
  });

  console.log('✅ Created likes');

  // Create demo comments
  await prisma.comment.create({
    data: {
      content: 'This is amazing! Can\'t wait to try it out!',
      postId: post1.id,
      authorId: freeUser.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Great tutorial! The Cinematix Engine is a game changer.',
      postId: post2.id,
      authorId: freeUser.id,
    },
  });

  console.log('✅ Created comments');

  // Create demo analytics events
  await prisma.analytics.createMany({
    data: [
      {
        userId: admin.id,
        event: 'user_login',
        properties: { source: 'web' },
      },
      {
        userId: demoUser.id,
        event: 'generation_created',
        properties: { type: 'VIDEO', provider: 'openai-sora' },
      },
      {
        userId: demoUser.id,
        event: 'job_completed',
        properties: { jobId: job1.id, duration: 15000 },
      },
      {
        userId: freeUser.id,
        event: 'user_signup',
        properties: { plan: 'FREE' },
      },
    ],
  });

  console.log('✅ Created analytics events');

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'user_created',
        resource: 'user',
        metadata: { email: admin.email },
      },
      {
        userId: demoUser.id,
        action: 'post_created',
        resource: `post:${post2.id}`,
        metadata: { title: post2.title },
      },
    ],
  });

  console.log('✅ Created audit logs');

  console.log('\n🎉 Database seed completed successfully!\n');
  console.log('📧 Demo accounts created:');
  console.log('   Admin: admin@neurafield.ai / Admin1234!');
  console.log('   Demo:  demo@neurafield.ai / User1234!');
  console.log('   Free:  free@neurafield.ai / User1234!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
