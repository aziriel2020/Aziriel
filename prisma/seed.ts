/**
 * DATABASE SEED
 * Initial data for development and testing
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@neurafield.ai' },
    update: {},
    create: {
      email: 'admin@neurafield.ai',
      username: 'admin',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      displayName: 'Admin',
      role: 'SUPERADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      subscriptionTier: 'ENTERPRISE',
      credits: 100000,
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create test user
  const testPassword = await bcrypt.hash('test123', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@neurafield.ai' },
    update: {},
    create: {
      email: 'test@neurafield.ai',
      username: 'testuser',
      passwordHash: testPassword,
      firstName: 'Test',
      lastName: 'User',
      displayName: 'Test User',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      subscriptionTier: 'FREE',
      credits: 100,
    },
  });

  console.log('✅ Created test user:', testUser.email);

  // Create sample project
  const project = await prisma.project.create({
    data: {
      userId: testUser.id,
      name: 'My First Project',
      description: 'Sample project for testing',
      type: 'short-film',
      isPublic: false,
    },
  });

  console.log('✅ Created sample project:', project.name);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
