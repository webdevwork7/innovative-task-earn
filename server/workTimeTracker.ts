// Work Time Tracking System for 8-hour requirement
import { storage } from './storage';

export class WorkTimeTracker {
  private activeUsers: Map<string, {
    startTime: Date;
    lastActive: Date;
    totalMinutes: number;
  }> = new Map();

  constructor() {
    // Check for users who haven't met their 8-hour requirement daily
    setInterval(() => this.checkDailyRequirements(), 60 * 60 * 1000); // Check every hour
    
    // Reset daily hours at midnight
    this.scheduleDailyReset();
  }

  // Start tracking work time for a user
  startTracking(userId: string) {
    const now = new Date();
    
    if (!this.activeUsers.has(userId)) {
      this.activeUsers.set(userId, {
        startTime: now,
        lastActive: now,
        totalMinutes: 0
      });
    } else {
      const userSession = this.activeUsers.get(userId)!;
      userSession.lastActive = now;
    }
  }

  // Update user activity
  updateActivity(userId: string) {
    const now = new Date();
    const userSession = this.activeUsers.get(userId);
    
    if (userSession) {
      const timeSinceLastActive = (now.getTime() - userSession.lastActive.getTime()) / 1000 / 60; // in minutes
      
      // If user was active within last 5 minutes, count it as work time
      if (timeSinceLastActive <= 5) {
        userSession.totalMinutes += timeSinceLastActive;
      }
      
      userSession.lastActive = now;
      
      // Update database with current work hours
      this.updateUserWorkHours(userId, userSession.totalMinutes / 60);
    } else {
      this.startTracking(userId);
    }
  }

  // Get user's work hours for today
  async getUserWorkHours(userId: string): Promise<{
    hoursWorked: number;
    hoursRemaining: number;
    isRequirementMet: boolean;
    lastActiveTime?: Date;
  }> {
    const userSession = this.activeUsers.get(userId);
    const hoursWorked = userSession ? userSession.totalMinutes / 60 : 0;
    const hoursRemaining = Math.max(0, 8 - hoursWorked);
    
    return {
      hoursWorked: parseFloat(hoursWorked.toFixed(2)),
      hoursRemaining: parseFloat(hoursRemaining.toFixed(2)),
      isRequirementMet: hoursWorked >= 8,
      lastActiveTime: userSession?.lastActive
    };
  }

  // Update user work hours in database
  private async updateUserWorkHours(userId: string, hours: number) {
    try {
      await storage.updateUser(userId, {
        dailyWorkHours: hours,
        lastActiveTime: new Date()
      });
    } catch (error) {
      console.error('Failed to update user work hours:', error);
    }
  }

  // Check daily requirements and suspend users who haven't met them
  private async checkDailyRequirements() {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Check at 11 PM every day
    if (currentHour === 23) {
      try {
        const users = await storage.getAllVerifiedUsers();
        
        for (const user of users) {
          const workData = await this.getUserWorkHours(user.id);
          
          // If verified user hasn't completed 8 hours, suspend account
          if (user.kycStatus === 'verified' && !workData.isRequirementMet) {
            await storage.updateUser(user.id, {
              status: 'suspended',
              suspensionReason: `Failed to complete 8-hour work requirement. Only worked ${workData.hoursWorked} hours today.`
            });
            
            console.log(`User ${user.email} suspended for not meeting 8-hour requirement`);
          }
        }
      } catch (error) {
        console.error('Failed to check daily requirements:', error);
      }
    }
  }

  // Reset daily work hours at midnight
  private scheduleDailyReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.resetDailyHours();
      // Schedule next reset
      setInterval(() => this.resetDailyHours(), 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
  }

  // Reset all users' daily work hours
  private async resetDailyHours() {
    console.log('Resetting daily work hours for all users...');
    
    // Clear in-memory tracking
    this.activeUsers.clear();
    
    try {
      // Reset database records
      await storage.resetAllUsersDailyHours();
      console.log('Daily work hours reset completed');
    } catch (error) {
      console.error('Failed to reset daily hours:', error);
    }
  }

  // Get work statistics for admin dashboard
  async getWorkStatistics(): Promise<{
    totalActiveUsers: number;
    averageHoursWorked: number;
    usersMetRequirement: number;
    usersPendingSuspension: number;
  }> {
    const stats = {
      totalActiveUsers: this.activeUsers.size,
      averageHoursWorked: 0,
      usersMetRequirement: 0,
      usersPendingSuspension: 0
    };

    let totalHours = 0;
    for (const [userId, session] of this.activeUsers) {
      const hours = session.totalMinutes / 60;
      totalHours += hours;
      
      if (hours >= 8) {
        stats.usersMetRequirement++;
      } else {
        stats.usersPendingSuspension++;
      }
    }

    if (stats.totalActiveUsers > 0) {
      stats.averageHoursWorked = parseFloat((totalHours / stats.totalActiveUsers).toFixed(2));
    }

    return stats;
  }
}

// Export singleton instance
export const workTimeTracker = new WorkTimeTracker();