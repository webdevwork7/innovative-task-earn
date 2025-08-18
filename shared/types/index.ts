// Shared type definitions for the entire application

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  balance: number;
  referralCode: string;
  referredBy?: string;
  kycStatus: 'pending' | 'submitted' | 'verified' | 'rejected';
  kycFeePaid: boolean;
  verificationStatus: 'pending' | 'verified';
  dailyWorkHours?: number; // Hours worked today
  lastActiveTime?: Date; // Last activity timestamp
  workStartTime?: Date; // When user started working today
  lastResetDate?: Date; // Last date when hours were reset
  totalWorkDays?: number; // Total days worked
  suspensionReason?: string; // Reason for suspension
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  reward: number;
  timeLimit: number; // in minutes
  requirements: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskCategory = 
  | 'app_download'
  | 'business_review'
  | 'product_review'
  | 'channel_subscribe'
  | 'comment_like'
  | 'youtube_video_see';

export interface TaskCompletion {
  id: string;
  taskId: string;
  userId: string;
  proofUrl?: string;
  proofText?: string;
  status: 'pending' | 'approved' | 'rejected';
  earnings: number;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface Earning {
  id: string;
  userId: string;
  amount: number;
  type: 'task' | 'referral' | 'bonus';
  description: string;
  taskCompletionId?: string;
  createdAt: Date;
}

export interface Payout {
  id: string;
  userId: string;
  amount: number;
  method: 'upi' | 'bank_transfer';
  accountDetails: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processedAt?: Date;
  transactionId?: string;
  createdAt: Date;
}

export interface KYCDocument {
  id: string;
  userId: string;
  documentType: 'aadhaar' | 'pan';
  documentNumber: string;
  documentUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: Date;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  userId: string;
  adminId?: string;
  message: string;
  isFromUser: boolean;
  createdAt: Date;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
}

export interface Inquiry {
  id: string;
  type: 'contact' | 'advertiser';
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  budget?: string;
  status: 'new' | 'contacted' | 'resolved';
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  firstName: string;
  lastName: string;
  phone: string;
  referralCode?: string;
}

export interface DashboardStats {
  totalEarnings: number;
  todayEarnings: number;
  completedTasks: number;
  pendingPayouts: number;
  referralCount: number;
}