/**
 * LOYALTY ROUTES
 * Loyalty program management, points, rewards, tier system
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from './auth.routes';

const router = Router();

// In-memory store for demo (use database in production)
const loyaltyAccounts: Map<string, any> = new Map();
const pointsTransactions: Map<string, any[]> = new Map();
const rewards: Map<string, any> = new Map();
const redemptions: Map<string, any[]> = new Map();

// Tier thresholds and benefits
const TIER_CONFIG = {
  bronze: {
    name: 'Bronze',
    minPoints: 0,
    color: '#CD7F32',
    multiplier: 1,
    benefits: [
      'Earn 1 point per $1 spent',
      'Member-only deals',
      'Birthday bonus points',
      'Email support'
    ]
  },
  silver: {
    name: 'Silver',
    minPoints: 10000,
    color: '#C0C0C0',
    multiplier: 1.25,
    benefits: [
      'Earn 1.25 points per $1 spent',
      'Priority customer service',
      'Free seat selection on flights',
      'Early access to sales',
      '5% discount on hotel bookings'
    ]
  },
  gold: {
    name: 'Gold',
    minPoints: 25000,
    color: '#FFD700',
    multiplier: 1.5,
    benefits: [
      'Earn 1.5 points per $1 spent',
      'Free checked baggage',
      'Priority boarding',
      'Room upgrades (subject to availability)',
      '10% discount on all bookings',
      'Dedicated phone support'
    ]
  },
  platinum: {
    name: 'Platinum',
    minPoints: 50000,
    color: '#E5E4E2',
    multiplier: 2,
    benefits: [
      'Earn 2 points per $1 spent',
      'Airport lounge access',
      'Guaranteed room upgrades',
      'Free cancellation on flights',
      '15% discount on all bookings',
      'Concierge service',
      'Complimentary travel insurance'
    ]
  },
  ambassador: {
    name: 'Ambassador',
    minPoints: 100000,
    color: '#000000',
    multiplier: 3,
    benefits: [
      'Earn 3 points per $1 spent',
      'First-class lounge access',
      'Personal travel advisor',
      'VIP airport transfers',
      '20% discount on all bookings',
      'Unlimited free cancellations',
      'Exclusive partner benefits',
      'Annual luxury gift',
      'Priority waitlist'
    ]
  }
};

// Sample rewards catalog
const REWARDS_CATALOG = [
  {
    id: 'reward-1',
    name: '$25 Flight Credit',
    description: 'Credit towards any flight booking',
    category: 'flight',
    pointsCost: 2500,
    value: 25,
    currency: 'USD',
    image: '/images/rewards/flight-credit.jpg',
    available: true
  },
  {
    id: 'reward-2',
    name: '$50 Hotel Credit',
    description: 'Credit towards any hotel booking',
    category: 'hotel',
    pointsCost: 5000,
    value: 50,
    currency: 'USD',
    image: '/images/rewards/hotel-credit.jpg',
    available: true
  },
  {
    id: 'reward-3',
    name: 'Free Checked Bag',
    description: 'One free checked bag on your next flight',
    category: 'flight',
    pointsCost: 1500,
    value: 35,
    currency: 'USD',
    image: '/images/rewards/baggage.jpg',
    available: true
  },
  {
    id: 'reward-4',
    name: 'Airport Lounge Pass',
    description: 'Single-use airport lounge access',
    category: 'experience',
    pointsCost: 3000,
    value: 50,
    currency: 'USD',
    image: '/images/rewards/lounge.jpg',
    available: true
  },
  {
    id: 'reward-5',
    name: 'Hotel Room Upgrade',
    description: 'Guaranteed room upgrade at participating hotels',
    category: 'hotel',
    pointsCost: 4000,
    value: 75,
    currency: 'USD',
    image: '/images/rewards/upgrade.jpg',
    available: true
  },
  {
    id: 'reward-6',
    name: 'Priority Boarding',
    description: 'Priority boarding on your next flight',
    category: 'flight',
    pointsCost: 1000,
    value: 15,
    currency: 'USD',
    image: '/images/rewards/priority.jpg',
    available: true
  },
  {
    id: 'reward-7',
    name: 'Spa Credit ($100)',
    description: 'Spa treatment at partner hotels',
    category: 'experience',
    pointsCost: 10000,
    value: 100,
    currency: 'USD',
    image: '/images/rewards/spa.jpg',
    available: true
  },
  {
    id: 'reward-8',
    name: 'Car Rental Day',
    description: 'One free day of car rental',
    category: 'experience',
    pointsCost: 5000,
    value: 60,
    currency: 'USD',
    image: '/images/rewards/car.jpg',
    available: true
  }
];

// Initialize rewards catalog
REWARDS_CATALOG.forEach(reward => rewards.set(reward.id, reward));

/**
 * GET /api/loyalty/account
 * Get user's loyalty account
 */
router.get('/account', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    let account = loyaltyAccounts.get(userId);

    // Create account if doesn't exist
    if (!account) {
      account = {
        userId,
        memberId: `SKY${Date.now()}`,
        tier: 'bronze',
        points: 0,
        lifetimePoints: 0,
        tierPoints: 0, // Points that count towards tier status
        joinDate: new Date().toISOString(),
        tierExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date().toISOString()
      };
      loyaltyAccounts.set(userId, account);
    }

    // Calculate tier progress
    const currentTierConfig = TIER_CONFIG[account.tier as keyof typeof TIER_CONFIG];
    const tiers = Object.entries(TIER_CONFIG);
    const currentTierIndex = tiers.findIndex(([key]) => key === account.tier);
    const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;

    const tierProgress = nextTier ? {
      currentTier: account.tier,
      nextTier: nextTier[0],
      pointsToNextTier: nextTier[1].minPoints - account.tierPoints,
      progress: Math.min(100, (account.tierPoints / nextTier[1].minPoints) * 100)
    } : {
      currentTier: account.tier,
      nextTier: null,
      pointsToNextTier: 0,
      progress: 100
    };

    res.json({
      account: {
        ...account,
        tierConfig: currentTierConfig
      },
      tierProgress,
      allTiers: TIER_CONFIG
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get loyalty account', details: error.message });
  }
});

/**
 * POST /api/loyalty/enroll
 * Enroll in loyalty program
 */
router.post('/enroll', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { acceptTerms } = req.body;

    // Check if already enrolled
    if (loyaltyAccounts.has(userId)) {
      return res.status(400).json({ error: 'Already enrolled in loyalty program' });
    }

    if (!acceptTerms) {
      return res.status(400).json({ error: 'Must accept loyalty program terms' });
    }

    // Create account with welcome bonus
    const account = {
      userId,
      memberId: `SKY${Date.now()}`,
      tier: 'bronze',
      points: 1000, // Welcome bonus
      lifetimePoints: 1000,
      tierPoints: 0,
      joinDate: new Date().toISOString(),
      tierExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date().toISOString()
    };

    loyaltyAccounts.set(userId, account);

    // Record welcome bonus transaction
    const transactions = [{
      id: uuidv4(),
      type: 'earn',
      category: 'bonus',
      points: 1000,
      description: 'Welcome bonus',
      createdAt: new Date().toISOString()
    }];
    pointsTransactions.set(userId, transactions);

    res.status(201).json({
      message: 'Successfully enrolled in Skyward Rewards',
      account,
      welcomeBonus: 1000
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to enroll', details: error.message });
  }
});

/**
 * GET /api/loyalty/transactions
 * Get points transaction history
 */
router.get('/transactions', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { page = 1, limit = 20, type } = req.query;

    let transactions = pointsTransactions.get(userId) || [];

    // Filter by type
    if (type && typeof type === 'string') {
      transactions = transactions.filter(t => t.type === type);
    }

    // Sort by date (newest first)
    transactions.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    res.json({
      transactions: paginatedTransactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: transactions.length,
        totalPages: Math.ceil(transactions.length / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get transactions', details: error.message });
  }
});

/**
 * POST /api/loyalty/earn
 * Earn points (called after booking)
 */
router.post('/earn', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { bookingId, amount, description, category } = req.body;

    const account = loyaltyAccounts.get(userId);
    if (!account) {
      return res.status(404).json({ error: 'Loyalty account not found' });
    }

    // Calculate points with tier multiplier
    const tierConfig = TIER_CONFIG[account.tier as keyof typeof TIER_CONFIG];
    const basePoints = Math.floor(amount);
    const earnedPoints = Math.floor(basePoints * tierConfig.multiplier);

    // Update account
    account.points += earnedPoints;
    account.lifetimePoints += earnedPoints;
    account.tierPoints += earnedPoints;
    account.lastActivity = new Date().toISOString();

    // Check for tier upgrade
    const tiers = Object.entries(TIER_CONFIG);
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (account.tierPoints >= tiers[i][1].minPoints) {
        if (account.tier !== tiers[i][0]) {
          account.tier = tiers[i][0];
          account.tierExpiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
        }
        break;
      }
    }

    loyaltyAccounts.set(userId, account);

    // Record transaction
    const transaction = {
      id: uuidv4(),
      type: 'earn',
      category: category || 'booking',
      points: earnedPoints,
      basePoints,
      multiplier: tierConfig.multiplier,
      bookingId,
      description: description || 'Points earned from booking',
      createdAt: new Date().toISOString()
    };

    const transactions = pointsTransactions.get(userId) || [];
    transactions.push(transaction);
    pointsTransactions.set(userId, transactions);

    res.json({
      earnedPoints,
      basePoints,
      multiplier: tierConfig.multiplier,
      newBalance: account.points,
      tier: account.tier,
      transaction
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to earn points', details: error.message });
  }
});

/**
 * GET /api/loyalty/rewards
 * Get rewards catalog
 */
router.get('/rewards', (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    let rewardsList = Array.from(rewards.values());

    if (category && typeof category === 'string') {
      rewardsList = rewardsList.filter(r => r.category === category);
    }

    res.json({
      rewards: rewardsList,
      categories: ['flight', 'hotel', 'experience']
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get rewards', details: error.message });
  }
});

/**
 * GET /api/loyalty/rewards/:id
 * Get reward details
 */
router.get('/rewards/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reward = rewards.get(id);

    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    res.json({ reward });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get reward', details: error.message });
  }
});

/**
 * POST /api/loyalty/redeem
 * Redeem points for a reward
 */
router.post('/redeem', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { rewardId, quantity = 1 } = req.body;

    const account = loyaltyAccounts.get(userId);
    if (!account) {
      return res.status(404).json({ error: 'Loyalty account not found' });
    }

    const reward = rewards.get(rewardId);
    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    if (!reward.available) {
      return res.status(400).json({ error: 'Reward is not available' });
    }

    const totalCost = reward.pointsCost * quantity;
    if (account.points < totalCost) {
      return res.status(400).json({
        error: 'Insufficient points',
        required: totalCost,
        available: account.points
      });
    }

    // Deduct points
    account.points -= totalCost;
    account.lastActivity = new Date().toISOString();
    loyaltyAccounts.set(userId, account);

    // Create redemption record
    const redemption = {
      id: uuidv4(),
      rewardId,
      rewardName: reward.name,
      quantity,
      pointsSpent: totalCost,
      value: reward.value * quantity,
      currency: reward.currency,
      code: `RWD${Date.now().toString(36).toUpperCase()}`,
      status: 'active',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      redeemedAt: new Date().toISOString()
    };

    const userRedemptions = redemptions.get(userId) || [];
    userRedemptions.push(redemption);
    redemptions.set(userId, userRedemptions);

    // Record transaction
    const transaction = {
      id: uuidv4(),
      type: 'redeem',
      category: 'reward',
      points: -totalCost,
      description: `Redeemed: ${reward.name}${quantity > 1 ? ` x${quantity}` : ''}`,
      redemptionId: redemption.id,
      createdAt: new Date().toISOString()
    };

    const transactions = pointsTransactions.get(userId) || [];
    transactions.push(transaction);
    pointsTransactions.set(userId, transactions);

    res.json({
      message: 'Reward redeemed successfully',
      redemption,
      newBalance: account.points
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to redeem reward', details: error.message });
  }
});

/**
 * GET /api/loyalty/redemptions
 * Get user's redemption history
 */
router.get('/redemptions', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const userRedemptions = redemptions.get(userId) || [];

    res.json({
      redemptions: userRedemptions.sort((a, b) =>
        new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime()
      )
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get redemptions', details: error.message });
  }
});

/**
 * POST /api/loyalty/use-points
 * Use points for booking discount
 */
router.post('/use-points', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { points, bookingId } = req.body;

    const account = loyaltyAccounts.get(userId);
    if (!account) {
      return res.status(404).json({ error: 'Loyalty account not found' });
    }

    if (!points || points <= 0) {
      return res.status(400).json({ error: 'Invalid points amount' });
    }

    if (account.points < points) {
      return res.status(400).json({
        error: 'Insufficient points',
        required: points,
        available: account.points
      });
    }

    // Calculate discount (100 points = $1)
    const discountAmount = points / 100;

    // Deduct points
    account.points -= points;
    account.lastActivity = new Date().toISOString();
    loyaltyAccounts.set(userId, account);

    // Record transaction
    const transaction = {
      id: uuidv4(),
      type: 'use',
      category: 'booking_discount',
      points: -points,
      discountAmount,
      bookingId,
      description: `Points used for booking discount`,
      createdAt: new Date().toISOString()
    };

    const transactions = pointsTransactions.get(userId) || [];
    transactions.push(transaction);
    pointsTransactions.set(userId, transactions);

    res.json({
      pointsUsed: points,
      discountAmount,
      currency: 'USD',
      newBalance: account.points
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to use points', details: error.message });
  }
});

/**
 * POST /api/loyalty/refund-points
 * Refund points (e.g., cancelled booking)
 */
router.post('/refund-points', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { points, bookingId, reason } = req.body;

    const account = loyaltyAccounts.get(userId);
    if (!account) {
      return res.status(404).json({ error: 'Loyalty account not found' });
    }

    // Add points back
    account.points += points;
    account.lastActivity = new Date().toISOString();
    loyaltyAccounts.set(userId, account);

    // Record transaction
    const transaction = {
      id: uuidv4(),
      type: 'refund',
      category: 'booking_cancellation',
      points,
      bookingId,
      description: reason || 'Points refunded from cancelled booking',
      createdAt: new Date().toISOString()
    };

    const transactions = pointsTransactions.get(userId) || [];
    transactions.push(transaction);
    pointsTransactions.set(userId, transactions);

    res.json({
      pointsRefunded: points,
      newBalance: account.points
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to refund points', details: error.message });
  }
});

/**
 * GET /api/loyalty/tiers
 * Get tier information
 */
router.get('/tiers', (req: Request, res: Response) => {
  res.json({ tiers: TIER_CONFIG });
});

/**
 * GET /api/loyalty/stats
 * Get user's loyalty stats
 */
router.get('/stats', authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const account = loyaltyAccounts.get(userId);

    if (!account) {
      return res.status(404).json({ error: 'Loyalty account not found' });
    }

    const transactions = pointsTransactions.get(userId) || [];
    const userRedemptions = redemptions.get(userId) || [];

    // Calculate stats
    const totalEarned = transactions
      .filter(t => t.type === 'earn')
      .reduce((sum, t) => sum + t.points, 0);

    const totalRedeemed = transactions
      .filter(t => t.type === 'redeem' || t.type === 'use')
      .reduce((sum, t) => sum + Math.abs(t.points), 0);

    const savedAmount = userRedemptions
      .reduce((sum, r) => sum + r.value, 0);

    // This year stats
    const thisYear = new Date().getFullYear();
    const thisYearTransactions = transactions.filter(t =>
      new Date(t.createdAt).getFullYear() === thisYear
    );

    const thisYearEarned = thisYearTransactions
      .filter(t => t.type === 'earn')
      .reduce((sum, t) => sum + t.points, 0);

    res.json({
      currentBalance: account.points,
      lifetimePoints: account.lifetimePoints,
      tierPoints: account.tierPoints,
      currentTier: account.tier,
      memberSince: account.joinDate,
      totalEarned,
      totalRedeemed,
      savedAmount,
      thisYearEarned,
      totalRedemptions: userRedemptions.length,
      activeRewards: userRedemptions.filter(r => r.status === 'active').length
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get stats', details: error.message });
  }
});

export default router;
