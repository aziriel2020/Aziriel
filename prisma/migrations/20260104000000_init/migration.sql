-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'CREATOR', 'PRO', 'STUDIO', 'ENTERPRISE', 'ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED', 'DELETED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'CREATOR', 'PRO', 'STUDIO', 'ENTERPRISE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'TRIALING', 'PAUSED');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER', 'COMMENTER');

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('QUEUED', 'PROCESSING', 'TRANSCODING', 'COMPLETED', 'FAILED', 'CANCELED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE', 'UNLISTED', 'TEAM', 'PASSWORD_PROTECTED');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('VIDEO', 'IMAGE', 'AUDIO', 'SUBTITLE', 'FONT', 'PRESET', 'TEMPLATE', 'EFFECT', 'MODEL', 'OTHER');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('VIDEO_GENERATION', 'VIDEO_PROCESSING', 'VIDEO_TRANSLATION', 'VIDEO_TRANSCRIPTION', 'HIGHLIGHT_EXTRACTION', 'STORYBOARD_GENERATION', 'MULTIVERSE_GENERATION', 'VIDEO_OPTIMIZATION', 'VIDEO_TRANSCODING', 'SOCIAL_MEDIA_PUBLISH', 'THUMBNAIL_GENERATION', 'SUBTITLE_GENERATION', 'VOICE_CLONING', 'AUDIO_GENERATION');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELED', 'RETRYING', 'PAUSED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "passwordHash" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "displayName" TEXT,
    "avatar" TEXT,
    "avatarUrl" TEXT,
    "bannerUrl" TEXT,
    "bio" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "emailVerificationToken" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "twoFactorBackupCodes" TEXT[],
    "googleId" TEXT,
    "githubId" TEXT,
    "discordId" TEXT,
    "twitterId" TEXT,
    "publicKey" TEXT,
    "privateKey" TEXT,
    "stripeCustomerId" TEXT,
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
    "subscriptionId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "trialEndsAt" TIMESTAMP(3),
    "credits" INTEGER NOT NULL DEFAULT 100,
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "monthlyQuota" INTEGER,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "suspendedAt" TIMESTAMP(3),
    "suspendedReason" TEXT,
    "deletedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3),
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "preferences" JSONB,
    "timezone" TEXT DEFAULT 'UTC',
    "language" TEXT DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_digital_twins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL DEFAULT 'llama-4-7b',
    "personality" JSONB,
    "privacySettings" JSONB,
    "localCollectionId" TEXT NOT NULL,
    "cloudCollectionId" TEXT,
    "syncEnabled" BOOLEAN NOT NULL DEFAULT false,
    "documentCount" INTEGER NOT NULL DEFAULT 0,
    "statedGoals" JSONB NOT NULL,
    "avoidTopics" TEXT[],
    "prioritizeTopics" TEXT[],
    "contentFiltered" INTEGER NOT NULL DEFAULT 0,
    "slopBlocked" INTEGER NOT NULL DEFAULT 0,
    "goalAlignment" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "maxDailyScreenTime" INTEGER,
    "focusHours" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_digital_twins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_githubId_key" ON "users"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "users_discordId_key" ON "users"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "users_twitterId_key" ON "users"("twitterId");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_stripeCustomerId_idx" ON "users"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "users_subscriptionTier_idx" ON "users"("subscriptionTier");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "personal_digital_twins_userId_key" ON "personal_digital_twins"("userId");
