/**
 * Performance Optimizations for EarnPay Platform
 * Handles 200,000+ users with permanent earnings history
 */

import { sql } from "drizzle-orm";
import { db } from "./db";

export class PerformanceOptimizer {
  /**
   * Creates optimized indexes for large scale operations
   * These indexes are created manually to avoid data loss during migration
   */
  static async createOptimizedIndexes(): Promise<void> {
    try {
      // Earnings table indexes for fast user history queries
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_earnings_user_id 
        ON earnings(user_id);
      `);
      
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_earnings_created_at 
        ON earnings(created_at DESC);
      `);
      
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_earnings_user_date 
        ON earnings(user_id, created_at DESC);
      `);
      
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_earnings_type 
        ON earnings(type);
      `);

      // Video progress indexes for user tracking
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_video_progress_user_video 
        ON video_progress(user_id, video_id);
      `);
      
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_video_progress_user_id 
        ON video_progress(user_id);
      `);
      
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_video_progress_completed 
        ON video_progress(is_completed);
      `);

      // Payout requests indexes for admin efficiency
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payout_user_id 
        ON payout_requests(user_id);
      `);
      
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payout_status 
        ON payout_requests(status);
      `);
      
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payout_requested_at 
        ON payout_requests(requested_at DESC);
      `);

      // Users table indexes for scale
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email 
        ON users(email);
      `);
      
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_referral_code 
        ON users(referral_code);
      `);
      
      await db.execute(sql`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_kyc_status 
        ON users(kyc_status);
      `);

      console.log("✅ Optimized indexes created successfully for 200k+ user scale");
    } catch (error) {
      console.log("ℹ️ Indexes may already exist or database doesn't support CONCURRENTLY:", error);
      // Indexes might already exist, which is fine
    }
  }

  /**
   * Optimized query for user earnings history with pagination
   */
  static async getUserEarningsOptimized(userId: string, limit = 50, offset = 0) {
    return await db.execute(sql`
      SELECT id, amount, type, description, created_at, video_id
      FROM earnings 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset};
    `);
  }

  /**
   * Fast earnings statistics query
   */
  static async getEarningsStatsOptimized(userId: string) {
    return await db.execute(sql`
      SELECT 
        COALESCE(SUM(amount), 0) as total_earnings,
        COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE THEN amount ELSE 0 END), 0) as today_earnings,
        COUNT(*) as total_transactions
      FROM earnings 
      WHERE user_id = ${userId};
    `);
  }

  /**
   * Database maintenance for optimal performance
   */
  static async performMaintenance(): Promise<void> {
    try {
      // Analyze tables for query planner optimization
      await db.execute(sql`ANALYZE earnings;`);
      await db.execute(sql`ANALYZE video_progress;`);
      await db.execute(sql`ANALYZE payout_requests;`);
      await db.execute(sql`ANALYZE users;`);
      
      console.log("✅ Database maintenance completed");
    } catch (error) {
      console.log("ℹ️ Database maintenance skipped:", error);
    }
  }

  /**
   * Check database performance metrics
   */
  static async checkPerformanceMetrics() {
    try {
      const result = await db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_rows
        FROM pg_stat_user_tables 
        WHERE tablename IN ('earnings', 'users', 'video_progress', 'payout_requests')
        ORDER BY live_rows DESC;
      `);
      
      console.log("📊 Performance Metrics:", result);
      return result;
    } catch (error) {
      console.log("ℹ️ Performance metrics not available:", error);
      return [];
    }
  }
}

/**
 * Configuration for 200k+ user scale
 */
export const SCALE_CONFIG = {
  MAX_USERS: 200000,
  EXPECTED_EARNINGS_PER_USER_PER_YEAR: 250,
  ESTIMATED_TOTAL_EARNINGS_RECORDS: 50000000, // 50M records for 200k users
  
  QUERY_LIMITS: {
    EARNINGS_HISTORY: 50,     // Paginate earnings history
    ADMIN_USER_LIST: 100,     // Admin user pagination
    VIDEO_PROGRESS: 50,       // Video progress pagination
  },
  
  CACHE_SETTINGS: {
    EARNINGS_STATS_TTL: 300,  // 5 minutes cache for stats
    USER_PROFILE_TTL: 600,    // 10 minutes cache for profiles
    VIDEO_LIST_TTL: 900,      // 15 minutes cache for video lists
  }
} as const;