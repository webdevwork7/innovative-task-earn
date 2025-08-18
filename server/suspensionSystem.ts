/**
 * Account Suspension System for EarnPay
 * 
 * Rules:
 * 1. Only applies to KYC-completed users (kycStatus='approved' AND verificationStatus='verified')
 * 2. Tracks daily watch time targets (8 hours minimum)
 * 3. Suspends accounts after consecutive failed days
 * 4. Charges ₹49 reactivation fee for suspended accounts
 */

import { sql, eq, and, lt } from "drizzle-orm";
import { db } from "./db";
import { users, earnings } from "@shared/schema";
import { storage } from "./storage";

export class SuspensionSystem {
  static readonly DAILY_TARGET_MINUTES = 480; // 8 hours
  static readonly SUSPENSION_THRESHOLD_DAYS = 3; // Suspend after 3 consecutive failed days
  static readonly REACTIVATION_FEE = "49.00"; // ₹49

  /**
   * Check if user is eligible for suspension monitoring
   * Only KYC-completed users are subject to suspension
   */
  static async isEligibleForSuspension(userId: string): Promise<boolean> {
    const user = await storage.getUser(userId);
    if (!user) return false;
    
    return user.kycStatus === 'approved' && user.verificationStatus === 'verified';
  }

  /**
   * Check daily watch time compliance for all eligible users
   * Run this as a daily cron job (e.g., at midnight)
   */
  static async checkDailyCompliance(): Promise<void> {
    try {
      // Get all KYC-completed users
      const eligibleUsers = await db
        .select()
        .from(users)
        .where(and(
          eq(users.kycStatus, 'approved'),
          eq(users.verificationStatus, 'verified'),
          eq(users.status, 'active') // Only check active accounts
        ));

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      for (const user of eligibleUsers) {
        await this.checkUserDailyCompliance(user.id, yesterday);
      }
      
      console.log(`✅ Daily compliance check completed for ${eligibleUsers.length} eligible users`);
    } catch (error) {
      console.error("❌ Error in daily compliance check:", error);
    }
  }

  /**
   * Check individual user's daily compliance
   */
  static async checkUserDailyCompliance(userId: string, checkDate: Date): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user || !await this.isEligibleForSuspension(userId)) return;

    const dailyWatchTime = await storage.getDailyWatchTime(userId);
    const targetMet = dailyWatchTime >= this.DAILY_TARGET_MINUTES;

    if (targetMet) {
      // Reset consecutive failed days counter
      await db
        .update(users)
        .set({ consecutiveFailedDays: 0 })
        .where(eq(users.id, userId));
    } else {
      // Increment consecutive failed days
      const newFailedDays = user.consecutiveFailedDays + 1;
      
      await db
        .update(users)
        .set({ consecutiveFailedDays: newFailedDays })
        .where(eq(users.id, userId));

      // Check if suspension threshold reached
      if (newFailedDays >= this.SUSPENSION_THRESHOLD_DAYS) {
        await this.suspendUser(userId, "Failed to meet daily watch time targets");
      }
    }
  }

  /**
   * Suspend a user account
   */
  static async suspendUser(userId: string, reason: string): Promise<void> {
    await db
      .update(users)
      .set({
        status: 'suspended',
        suspendedAt: new Date(),
        suspensionReason: reason,
        reactivationFeePaid: false,
        reactivationFeeAmount: this.REACTIVATION_FEE
      })
      .where(eq(users.id, userId));

    console.log(`⚠️ User ${userId} suspended: ${reason}`);
  }

  /**
   * Process reactivation fee payment
   */
  static async processReactivationFee(userId: string): Promise<{ success: boolean; message: string }> {
    const user = await storage.getUser(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (user.status !== 'suspended') {
      return { success: false, message: "Account is not suspended" };
    }

    if (user.reactivationFeePaid) {
      return { success: false, message: "Reactivation fee already paid" };
    }

    // Check if user has sufficient balance
    const currentBalance = parseFloat(user.balance.toString());
    const feeAmount = parseFloat(this.REACTIVATION_FEE);
    
    if (currentBalance < feeAmount) {
      return { 
        success: false, 
        message: `Insufficient balance. Required: ₹${feeAmount}, Available: ₹${currentBalance}` 
      };
    }

    try {
      // Deduct fee and reactivate account
      const newBalance = (currentBalance - feeAmount).toFixed(2);
      
      await db
        .update(users)
        .set({
          status: 'active',
          reactivationFeePaid: true,
          consecutiveFailedDays: 0,
          balance: newBalance,
          suspendedAt: null,
          suspensionReason: null
        })
        .where(eq(users.id, userId));

      // Create earning record for the fee deduction
      await storage.createEarning({
        userId: userId,
        amount: `-${feeAmount}`,
        type: "reactivation_fee",
        description: "Account reactivation fee"
      });

      return { 
        success: true, 
        message: `Account reactivated successfully. ₹${feeAmount} deducted from balance.` 
      };
    } catch (error) {
      console.error("Error processing reactivation fee:", error);
      return { success: false, message: "Failed to process payment" };
    }
  }

  /**
   * Get suspension status for a user
   */
  static async getSuspensionStatus(userId: string): Promise<{
    isSuspended: boolean;
    suspendedAt?: Date;
    reason?: string;
    reactivationFee?: string;
    reactivationFeePaid?: boolean;
    consecutiveFailedDays: number;
    eligibleForSuspension: boolean;
  }> {
    const user = await storage.getUser(userId);
    if (!user) {
      return { 
        isSuspended: false, 
        consecutiveFailedDays: 0,
        eligibleForSuspension: false 
      };
    }

    const eligibleForSuspension = await this.isEligibleForSuspension(userId);

    return {
      isSuspended: user.status === 'suspended',
      suspendedAt: user.suspendedAt || undefined,
      reason: user.suspensionReason ?? undefined,
      reactivationFee: user.reactivationFeeAmount,
      reactivationFeePaid: user.reactivationFeePaid,
      consecutiveFailedDays: user.consecutiveFailedDays,
      eligibleForSuspension
    };
  }

  /**
   * Manual suspension by admin
   */
  static async adminSuspendUser(userId: string, reason: string): Promise<void> {
    await this.suspendUser(userId, `Admin suspension: ${reason}`);
  }

  /**
   * Get users at risk of suspension (for warning notifications)
   */
  static async getUsersAtRisk(): Promise<any[]> {
    return await db
      .select()
      .from(users)
      .where(and(
        eq(users.kycStatus, 'approved'),
        eq(users.verificationStatus, 'verified'),
        eq(users.status, 'active'),
        sql`consecutive_failed_days >= 2` // Warn users at 2+ failed days
      ));
  }
}

/**
 * Initialize daily compliance checking
 * Call this in your server startup or cron job
 */
export async function initializeSuspensionSystem(): Promise<void> {
  // Set up daily compliance check (this would typically be a cron job)
  console.log("🔍 Suspension system initialized - KYC-completed users subject to daily watch time monitoring");
}