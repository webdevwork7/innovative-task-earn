// Storage layer with memory fallback for development

import { User, Task, TaskCompletion, Earning } from '../shared/types';
import { hashPassword, generateReferralCode } from './utils/auth';
import { db } from './db';
import { users, tasks, taskCompletions, earnings } from '../database/schema';
import { eq } from 'drizzle-orm';

// Memory storage for development mode
class MemoryStorage {
  private users: Map<string, User> = new Map();
  private passwords: Map<string, string> = new Map();
  private tasks: Map<string, Task> = new Map();
  private completions: Map<string, TaskCompletion> = new Map();
  private earnings: Map<string, Earning[]> = new Map();

  constructor() {
    this.initializeTestData();
  }

  private async initializeTestData() {
    // Create test admin user
    const adminId = 'admin-001';
    const adminPassword = await hashPassword('admin123');
    
    this.users.set(adminId, {
      id: adminId,
      email: 'admin@innovativetaskearn.online',
      firstName: 'Admin',
      lastName: 'User',
      phone: '9999999999',
      role: 'admin',
      status: 'active',
      balance: 0,
      referralCode: 'ADMIN001',
      kycStatus: 'verified',
      kycFeePaid: true,
      verificationStatus: 'verified',
      dailyWorkHours: 0,
      lastActiveTime: new Date(),
      workStartTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    } as User);
    
    this.passwords.set(adminId, adminPassword);

    // Create test user
    const userId = 'user-001';
    const userPassword = await hashPassword('demo123');
    
    this.users.set(userId, {
      id: userId,
      email: 'demo@innovativetaskearn.online',
      firstName: 'Demo',
      lastName: 'User',
      phone: '8888888888',
      role: 'user',
      status: 'active',
      balance: 1250.50, // Includes ₹1000 signup bonus + earnings
      referralCode: 'DEMO001',
      kycStatus: 'pending',
      kycFeePaid: false,
      verificationStatus: 'pending',
      dailyWorkHours: 0,
      lastActiveTime: new Date(),
      workStartTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    } as User);
    
    this.passwords.set(userId, userPassword);

    // Add signup bonus earning record for demo user
    this.earnings.set(userId, [
      {
        id: 'earn-signup-001',
        userId: userId,
        type: 'signup_bonus',
        amount: 1000,
        description: 'Welcome Signup Bonus',
        createdAt: new Date('2025-01-01'),
        status: 'approved'
      }
    ]);

    // Create sample tasks
    const taskCategories = [
      { id: 'task-001', title: 'Download Amazon App', category: 'app_download', reward: 15 },
      { id: 'task-002', title: 'Review Local Restaurant', category: 'business_review', reward: 20 },
      { id: 'task-003', title: 'Subscribe to Tech Channel', category: 'channel_subscribe', reward: 10 },
      { id: 'task-004', title: 'Review Product on Flipkart', category: 'product_review', reward: 25 },
      { id: 'task-005', title: 'Like and Comment on Post', category: 'comment_like', reward: 5 },
      { id: 'task-006', title: 'Watch Educational Video', category: 'youtube_video_see', reward: 8 }
    ];

    taskCategories.forEach(task => {
      this.tasks.set(task.id, {
        id: task.id,
        title: task.title,
        description: `Complete this ${task.category.replace('_', ' ')} task to earn ₹${task.reward}`,
        category: task.category as any,
        reward: task.reward,
        timeLimit: 20,
        requirements: ['Submit proof screenshot', 'Follow all guidelines'],
        isActive: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // 1. Fully Verified User with Good Standing
    const verifiedUserId = 'user-003';
    const verifiedPassword = await hashPassword('verified123');
    
    this.users.set(verifiedUserId, {
      id: verifiedUserId,
      email: 'john.doe@innovativetaskearn.online',
      firstName: 'John',
      lastName: 'Doe',
      phone: '9876543210',
      role: 'user',
      status: 'active',
      balance: 4500.75,
      referralCode: 'JOHN123',
      kycStatus: 'verified',
      kycFeePaid: true,
      verificationStatus: 'verified',
      dailyWorkHours: 8.5, // Exceeding requirement
      lastActiveTime: new Date(),
      workStartTime: new Date(Date.now() - 8.5 * 60 * 60 * 1000),
      totalWorkDays: 45,
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date()
    } as User);
    
    this.passwords.set(verifiedUserId, verifiedPassword);

    // 2. KYC Submitted but Payment Not Done
    const kycPendingPaymentId = 'user-004';
    const kycPendingPassword = await hashPassword('priya123');
    
    this.users.set(kycPendingPaymentId, {
      id: kycPendingPaymentId,
      email: 'priya.sharma@innovativetaskearn.online',
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '8765432109',
      role: 'user',
      status: 'active',
      balance: 1350,
      referralCode: 'PRIYA456',
      kycStatus: 'submitted', // Documents uploaded
      kycFeePaid: false, // Payment pending
      verificationStatus: 'pending',
      dailyWorkHours: 2.3,
      lastActiveTime: new Date(),
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date()
    } as User);
    
    this.passwords.set(kycPendingPaymentId, kycPendingPassword);

    // 3. Suspended for Work Hour Violation (Was Verified)
    const suspendedWorkId = 'user-005';
    const suspendedWorkPassword = await hashPassword('alex123');
    
    this.users.set(suspendedWorkId, {
      id: suspendedWorkId,
      email: 'alex.kumar@innovativetaskearn.online',
      firstName: 'Alex',
      lastName: 'Kumar',
      phone: '7654321098',
      role: 'user',
      status: 'suspended',
      balance: 2100,
      referralCode: 'ALEX789',
      kycStatus: 'verified',
      kycFeePaid: true,
      verificationStatus: 'verified',
      dailyWorkHours: 3.5,
      lastActiveTime: new Date(Date.now() - 12 * 60 * 60 * 1000),
      suspensionReason: 'Failed to complete 8-hour work requirement. Only worked 3.5 hours.',
      totalWorkDays: 23,
      createdAt: new Date('2024-11-15'),
      updatedAt: new Date()
    } as User);
    
    this.passwords.set(suspendedWorkId, suspendedWorkPassword);

    // 4. KYC Rejected User
    const kycRejectedId = 'user-006';
    const kycRejectedPassword = await hashPassword('raj123');
    
    this.users.set(kycRejectedId, {
      id: kycRejectedId,
      email: 'raj.patel@innovativetaskearn.online',
      firstName: 'Raj',
      lastName: 'Patel',
      phone: '6543210987',
      role: 'user',
      status: 'active',
      balance: 1100,
      referralCode: 'RAJ012',
      kycStatus: 'rejected',
      kycFeePaid: true, // Paid but documents rejected
      verificationStatus: 'pending',
      dailyWorkHours: 0,
      lastActiveTime: new Date(),
      createdAt: new Date('2025-01-05'),
      updatedAt: new Date()
    } as User);
    
    this.passwords.set(kycRejectedId, kycRejectedPassword);

    // 5. High Performer Verified User
    const topPerformerId = 'user-007';
    const topPerformerPassword = await hashPassword('sarah123');
    
    this.users.set(topPerformerId, {
      id: topPerformerId,
      email: 'sarah.wilson@innovativetaskearn.online',
      firstName: 'Sarah',
      lastName: 'Wilson',
      phone: '5432109876',
      role: 'user',
      status: 'active',
      balance: 12500, // High balance
      referralCode: 'SARAH345',
      kycStatus: 'verified',
      kycFeePaid: true,
      verificationStatus: 'verified',
      dailyWorkHours: 9.2, // Exceeding hours
      lastActiveTime: new Date(),
      workStartTime: new Date(Date.now() - 9.2 * 60 * 60 * 1000),
      totalWorkDays: 120,
      createdAt: new Date('2024-08-01'),
      updatedAt: new Date()
    } as User);
    
    this.passwords.set(topPerformerId, topPerformerPassword);

    // 6. New User (Just Signed Up)
    const newUserId = 'user-008';
    const newUserPassword = await hashPassword('amit123');
    
    this.users.set(newUserId, {
      id: newUserId,
      email: 'amit.singh@innovativetaskearn.online',
      firstName: 'Amit',
      lastName: 'Singh',
      phone: '4321098765',
      role: 'user',
      status: 'active',
      balance: 1000, // Only signup bonus
      referralCode: 'AMIT678',
      kycStatus: 'pending',
      kycFeePaid: false,
      verificationStatus: 'pending',
      dailyWorkHours: 0,
      lastActiveTime: new Date(),
      createdAt: new Date(), // Created today
      updatedAt: new Date()
    } as User);
    
    this.passwords.set(newUserId, newUserPassword);

    // 7. Suspended for Other Violation
    const suspendedViolationId = 'user-009';
    const suspendedViolationPassword = await hashPassword('maya123');
    
    this.users.set(suspendedViolationId, {
      id: suspendedViolationId,
      email: 'maya.gupta@innovativetaskearn.online',
      firstName: 'Maya',
      lastName: 'Gupta',
      phone: '3210987654',
      role: 'user',
      status: 'suspended',
      balance: 750,
      referralCode: 'MAYA901',
      kycStatus: 'pending',
      kycFeePaid: false,
      verificationStatus: 'pending',
      dailyWorkHours: 0,
      lastActiveTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
      suspensionReason: 'Multiple fraudulent task submissions detected.',
      createdAt: new Date('2024-12-20'),
      updatedAt: new Date()
    } as User);
    
    this.passwords.set(suspendedViolationId, suspendedViolationPassword);

    // 8. Partially Verified (KYC in Progress)
    const partialVerifiedId = 'user-010';
    const partialVerifiedPassword = await hashPassword('neha123');
    
    this.users.set(partialVerifiedId, {
      id: partialVerifiedId,
      email: 'neha.reddy@innovativetaskearn.online',
      firstName: 'Neha',
      lastName: 'Reddy',
      phone: '2109876543',
      role: 'user',
      status: 'active',
      balance: 1850,
      referralCode: 'NEHA234',
      kycStatus: 'submitted',
      kycFeePaid: true, // Paid and documents under review
      verificationStatus: 'pending',
      dailyWorkHours: 4.7,
      lastActiveTime: new Date(),
      workStartTime: new Date(Date.now() - 4.7 * 60 * 60 * 1000),
      createdAt: new Date('2024-12-25'),
      updatedAt: new Date()
    } as User);
    
    this.passwords.set(partialVerifiedId, partialVerifiedPassword);
    
    // Add earnings for verified users
    this.earnings.set(verifiedUserId, [
      {
        id: 'earn-v-001',
        userId: verifiedUserId,
        type: 'signup_bonus',
        amount: 1000,
        description: 'Welcome Signup Bonus',
        createdAt: new Date('2024-12-01'),
        status: 'approved'
      },
      {
        id: 'earn-v-002',
        userId: verifiedUserId,
        type: 'task',
        amount: 250,
        description: 'Completed App Download Tasks',
        createdAt: new Date('2025-01-10'),
        status: 'approved'
      },
      {
        id: 'earn-v-003',
        userId: verifiedUserId,
        type: 'referral',
        amount: 245, // 5 referrals × ₹49
        description: 'Referral Bonuses',
        createdAt: new Date('2025-01-12'),
        status: 'approved'
      }
    ]);
    
    this.earnings.set(topPerformerId, [
      {
        id: 'earn-t-001',
        userId: topPerformerId,
        type: 'signup_bonus',
        amount: 1000,
        description: 'Welcome Signup Bonus',
        createdAt: new Date('2024-08-01'),
        status: 'approved'
      },
      {
        id: 'earn-t-002',
        userId: topPerformerId,
        type: 'task',
        amount: 8500,
        description: 'Multiple Task Completions',
        createdAt: new Date('2025-01-14'),
        status: 'approved'
      },
      {
        id: 'earn-t-003',
        userId: topPerformerId,
        type: 'referral',
        amount: 980, // 20 referrals × ₹49
        description: 'Referral Program Earnings',
        createdAt: new Date('2025-01-15'),
        status: 'approved'
      }
    ]);
  }

  // User methods
  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const id = `user-${Date.now()}`;
    const user: User = {
      id,
      email: userData.email!,
      firstName: userData.firstName!,
      lastName: userData.lastName!,
      phone: userData.phone!,
      role: 'user',
      status: 'active',
      balance: 1000, // ₹1000 signup bonus
      referralCode: generateReferralCode(),
      kycStatus: 'pending',
      kycFeePaid: false,
      verificationStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData
    };
    this.users.set(id, user);
    
    // Add signup bonus earning record
    this.earnings.set(id, [
      {
        id: `earn-signup-${Date.now()}`,
        userId: id,
        type: 'signup_bonus',
        amount: 1000,
        description: 'Welcome Signup Bonus',
        createdAt: new Date(),
        status: 'approved'
      }
    ]);
    
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;
    
    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  // Task methods
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(t => t.isActive);
  }

  async getTaskById(id: string): Promise<Task | null> {
    return this.tasks.get(id) || null;
  }

  async createTask(taskData: Partial<Task>): Promise<Task> {
    const id = `task-${Date.now()}`;
    const task: Task = {
      id,
      title: taskData.title!,
      description: taskData.description!,
      category: taskData.category!,
      reward: taskData.reward!,
      timeLimit: taskData.timeLimit!,
      requirements: taskData.requirements || [],
      isActive: true,
      createdBy: taskData.createdBy!,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...taskData
    };
    this.tasks.set(id, task);
    return task;
  }

  // Task completion methods
  async createTaskCompletion(data: Partial<TaskCompletion>): Promise<TaskCompletion> {
    const id = `completion-${Date.now()}`;
    const completion: TaskCompletion = {
      id,
      taskId: data.taskId!,
      userId: data.userId!,
      status: 'pending',
      earnings: data.earnings!,
      submittedAt: new Date(),
      ...data
    };
    this.completions.set(id, completion);
    return completion;
  }

  async getTaskCompletionsByUser(userId: string): Promise<TaskCompletion[]> {
    return Array.from(this.completions.values()).filter(c => c.userId === userId);
  }

  // Earnings methods
  async addEarning(data: Partial<Earning>): Promise<Earning> {
    const earning: Earning = {
      id: `earning-${Date.now()}`,
      userId: data.userId!,
      amount: data.amount!,
      type: data.type!,
      description: data.description!,
      createdAt: new Date(),
      ...data
    };
    
    const userEarnings = this.earnings.get(data.userId!) || [];
    userEarnings.push(earning);
    this.earnings.set(data.userId!, userEarnings);
    
    // Update user balance
    const user = this.users.get(data.userId!);
    if (user) {
      user.balance += data.amount!;
      this.users.set(data.userId!, user);
    }
    
    return earning;
  }

  async getUserEarnings(userId: string): Promise<Earning[]> {
    return this.earnings.get(userId) || [];
  }

  // Authentication method
  async authenticateUser(email: string, password: string): Promise<User | null> {
    // Import bcrypt for password comparison
    const bcrypt = await import('bcryptjs');
    
    // Find user by email
    for (const [userId, user] of this.users.entries()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        const storedPassword = this.passwords.get(userId);
        if (storedPassword && await bcrypt.compare(password, storedPassword)) {
          return user;
        }
      }
    }
    return null;
  }

  // Get all verified users
  async getAllVerifiedUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.kycStatus === 'verified');
  }

  // Reset all users' daily work hours
  async resetAllUsersDailyHours(): Promise<void> {
    for (const [id, user] of this.users) {
      user.dailyWorkHours = 0;
      user.lastResetDate = new Date();
      this.users.set(id, user);
    }
  }
}

// Create storage instance based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const memoryStorage = new MemoryStorage();

export const storage = {
  // Authentication operation
  async authenticateUser(email: string, password: string): Promise<any> {
    if (!db || isDevelopment) {
      return memoryStorage.authenticateUser(email, password);
    }
    // In production, you would implement proper authentication with the database
    return null;
  },

  // User operations
  async getUserByEmail(email: string): Promise<any> {
    if (!db || isDevelopment) {
      return memoryStorage.getUserByEmail(email);
    }
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    return user;
  },

  async getUserById(id: string): Promise<any> {
    if (!db || isDevelopment) {
      return memoryStorage.getUserById(id);
    }
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  },

  async createUser(userData: any): Promise<any> {
    if (!db || isDevelopment) {
      return memoryStorage.createUser(userData);
    }
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  },

  async updateUser(id: string, updates: any): Promise<any> {
    if (!db || isDevelopment) {
      return memoryStorage.updateUser(id, updates);
    }
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  },

  // Task operations
  async getAllTasks(): Promise<any[]> {
    if (!db || isDevelopment) {
      return memoryStorage.getAllTasks();
    }
    return db.select().from(tasks).where(eq(tasks.isActive, true));
  },

  async getTaskById(id: string): Promise<any> {
    if (!db || isDevelopment) {
      return memoryStorage.getTaskById(id);
    }
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return task;
  },

  async createTask(taskData: any): Promise<any> {
    if (!db || isDevelopment) {
      return memoryStorage.createTask(taskData);
    }
    const [task] = await db.insert(tasks).values(taskData).returning();
    return task;
  },

  // Task completion operations
  async createTaskCompletion(data: any): Promise<any> {
    if (!db || isDevelopment) {
      return memoryStorage.createTaskCompletion(data);
    }
    const [completion] = await db.insert(taskCompletions).values(data).returning();
    return completion;
  },

  async getTaskCompletionsByUser(userId: string): Promise<any[]> {
    if (!db || isDevelopment) {
      return memoryStorage.getTaskCompletionsByUser(userId);
    }
    return db.select().from(taskCompletions).where(eq(taskCompletions.userId, userId));
  },

  // Earnings operations
  async addEarning(data: any): Promise<any> {
    if (!db || isDevelopment) {
      return memoryStorage.addEarning(data);
    }
    const [earning] = await db.insert(earnings).values(data).returning();
    return earning;
  },

  async getUserEarnings(userId: string): Promise<any[]> {
    if (!db || isDevelopment) {
      return memoryStorage.getUserEarnings(userId);
    }
    return db.select().from(earnings).where(eq(earnings.userId, userId));
  },

  // Work time tracking operations
  async getAllVerifiedUsers(): Promise<any[]> {
    if (!db || isDevelopment) {
      return memoryStorage.getAllVerifiedUsers();
    }
    return db.select().from(users).where(eq(users.kycStatus, 'verified'));
  },

  async resetAllUsersDailyHours(): Promise<void> {
    if (!db || isDevelopment) {
      return memoryStorage.resetAllUsersDailyHours();
    }
    await db.update(users).set({ 
      dailyWorkHours: 0,
      lastResetDate: new Date()
    });
  }
};