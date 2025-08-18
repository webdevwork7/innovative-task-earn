import { Router } from 'express';
import { z } from 'zod';
import { db } from '../services/database';
import { users, earnings, payouts, taskCompletions } from '../../database/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { hashPassword } from '../utils/auth';

const router = Router();

// Validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6)
});

// Get user profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const { password: _, emailOtp: __, ...userData } = req.user;
    
    // Get additional stats
    const [stats] = await db
      .select({
        totalEarnings: sql<number>`COALESCE(SUM(${earnings.amount}), 0)`,
        completedTasks: sql<number>`COUNT(DISTINCT ${taskCompletions.id})`,
        pendingTasks: sql<number>`COUNT(DISTINCT CASE WHEN ${taskCompletions.status} = 'pending' THEN ${taskCompletions.id} END)`
      })
      .from(users)
      .leftJoin(earnings, eq(earnings.userId, users.id))
      .leftJoin(taskCompletions, eq(taskCompletions.userId, users.id))
      .where(eq(users.id, req.user.id))
      .groupBy(users.id);

    res.json({
      user: userData,
      stats
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    const [updated] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(users.id, req.user.id))
      .returning();

    const { password: _, emailOtp: __, ...userData } = updated;
    
    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const data = changePasswordSchema.parse(req.body);

    // Verify current password
    const { verifyPassword } = await import('../utils/auth');
    const isValid = await verifyPassword(data.currentPassword, req.user.password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await hashPassword(data.newPassword);

    // Update password
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, req.user.id));

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get earnings history
router.get('/earnings', requireAuth, async (req, res) => {
  try {
    const userEarnings = await db
      .select()
      .from(earnings)
      .where(eq(earnings.userId, req.user.id))
      .orderBy(desc(earnings.createdAt));

    // Calculate totals
    const totals = userEarnings.reduce((acc, earning) => {
      acc.total += Number(earning.amount);
      if (earning.type === 'task') acc.fromTasks += Number(earning.amount);
      if (earning.type === 'referral') acc.fromReferrals += Number(earning.amount);
      if (earning.type === 'bonus') acc.fromBonus += Number(earning.amount);
      return acc;
    }, { total: 0, fromTasks: 0, fromReferrals: 0, fromBonus: 0 });

    res.json({
      earnings: userEarnings,
      totals
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

// Get dashboard stats
router.get('/dashboard-stats', requireAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get various stats
    const [stats] = await db
      .select({
        totalEarnings: sql<number>`COALESCE(SUM(${earnings.amount}), 0)`,
        todayEarnings: sql<number>`COALESCE(SUM(CASE WHEN ${earnings.createdAt} >= ${today} THEN ${earnings.amount} ELSE 0 END), 0)`,
        completedTasks: sql<number>`COUNT(DISTINCT CASE WHEN ${taskCompletions.status} = 'approved' THEN ${taskCompletions.id} END)`,
        pendingTasks: sql<number>`COUNT(DISTINCT CASE WHEN ${taskCompletions.status} = 'pending' THEN ${taskCompletions.id} END)`
      })
      .from(users)
      .leftJoin(earnings, eq(earnings.userId, users.id))
      .leftJoin(taskCompletions, eq(taskCompletions.userId, users.id))
      .where(eq(users.id, req.user.id))
      .groupBy(users.id);

    // Get referral count
    const [referralStats] = await db
      .select({
        referralCount: sql<number>`COUNT(*)`
      })
      .from(users)
      .where(eq(users.referredBy, req.user.id));

    res.json({
      ...stats,
      referralCount: referralStats?.referralCount || 0,
      currentBalance: req.user.balance
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get all users (Admin only)
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        role: users.role,
        status: users.status,
        balance: users.balance,
        kycStatus: users.kycStatus,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    res.json(allUsers);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user status (Admin only)
router.patch('/:userId/status', requireAdmin, async (req, res) => {
  try {
    const { status } = z.object({
      status: z.enum(['active', 'suspended'])
    }).parse(req.body);

    const [updated] = await db
      .update(users)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(users.id, req.params.userId))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: updated
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Update user role (Admin only)
router.patch('/:userId/role', requireAdmin, async (req, res) => {
  try {
    const { role } = z.object({
      role: z.enum(['user', 'admin'])
    }).parse(req.body);

    const [updated] = await db
      .update(users)
      .set({
        role,
        updatedAt: new Date()
      })
      .where(eq(users.id, req.params.userId))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: updated
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

export default router;