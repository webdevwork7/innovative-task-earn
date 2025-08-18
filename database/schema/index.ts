import { 
  pgTable, 
  varchar, 
  text, 
  timestamp, 
  boolean, 
  decimal, 
  integer,
  pgEnum,
  uuid
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const userStatusEnum = pgEnum('user_status', ['active', 'suspended']);
export const kycStatusEnum = pgEnum('kyc_status', ['pending', 'submitted', 'verified', 'rejected']);
export const taskCategoryEnum = pgEnum('task_category', [
  'app_download',
  'business_review', 
  'product_review',
  'channel_subscribe',
  'comment_like',
  'youtube_video_see'
]);
export const taskStatusEnum = pgEnum('task_status', ['pending', 'approved', 'rejected']);
export const payoutStatusEnum = pgEnum('payout_status', ['pending', 'processing', 'completed', 'failed']);
export const earningTypeEnum = pgEnum('earning_type', ['task', 'referral', 'bonus']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  status: userStatusEnum('status').default('active').notNull(),
  balance: decimal('balance', { precision: 10, scale: 2 }).default('0.00').notNull(),
  referralCode: varchar('referral_code', { length: 20 }).notNull().unique(),
  referredBy: uuid('referred_by'),
  kycStatus: kycStatusEnum('kyc_status').default('pending').notNull(),
  kycFeePaid: boolean('kyc_fee_paid').default(false).notNull(),
  verificationStatus: varchar('verification_status', { length: 20 }).default('pending').notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  emailOtp: varchar('email_otp', { length: 6 }),
  otpExpiry: timestamp('otp_expiry'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tasks table
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: taskCategoryEnum('category').notNull(),
  reward: decimal('reward', { precision: 10, scale: 2 }).notNull(),
  timeLimit: integer('time_limit').notNull(), // in minutes
  requirements: text('requirements').array().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Task Completions table
export const taskCompletions = pgTable('task_completions', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').notNull().references(() => tasks.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  proofUrl: text('proof_url'),
  proofText: text('proof_text'),
  status: taskStatusEnum('status').default('pending').notNull(),
  earnings: decimal('earnings', { precision: 10, scale: 2 }).notNull(),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  rejectionReason: text('rejection_reason')
});

// Earnings table
export const earnings = pgTable('earnings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  type: earningTypeEnum('type').notNull(),
  description: text('description').notNull(),
  taskCompletionId: uuid('task_completion_id').references(() => taskCompletions.id),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Payouts table
export const payouts = pgTable('payouts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  method: varchar('method', { length: 50 }).notNull(),
  accountDetails: text('account_details').notNull(),
  status: payoutStatusEnum('status').default('pending').notNull(),
  processedAt: timestamp('processed_at'),
  transactionId: varchar('transaction_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// KYC Documents table
export const kycDocuments = pgTable('kyc_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  documentType: varchar('document_type', { length: 50 }).notNull(),
  documentNumber: varchar('document_number', { length: 100 }).notNull(),
  documentUrl: text('document_url').notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Chat Messages table
export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  adminId: uuid('admin_id').references(() => users.id),
  message: text('message').notNull(),
  isFromUser: boolean('is_from_user').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// FAQs table
export const faqs = pgTable('faqs', {
  id: uuid('id').defaultRandom().primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  order: integer('order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Inquiries table
export const inquiries = pgTable('inquiries', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: varchar('type', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  company: varchar('company', { length: 255 }),
  message: text('message').notNull(),
  budget: varchar('budget', { length: 100 }),
  status: varchar('status', { length: 50 }).default('new').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Define relations
export const usersRelations = relations(users, ({ many, one }) => ({
  tasks: many(tasks),
  taskCompletions: many(taskCompletions),
  earnings: many(earnings),
  payouts: many(payouts),
  kycDocuments: many(kycDocuments),
  chatMessages: many(chatMessages),
  referrer: one(users, {
    fields: [users.referredBy],
    references: [users.id]
  })
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.id]
  }),
  completions: many(taskCompletions)
}));

export const taskCompletionsRelations = relations(taskCompletions, ({ one }) => ({
  task: one(tasks, {
    fields: [taskCompletions.taskId],
    references: [tasks.id]
  }),
  user: one(users, {
    fields: [taskCompletions.userId],
    references: [users.id]
  }),
  reviewer: one(users, {
    fields: [taskCompletions.reviewedBy],
    references: [users.id]
  })
}));

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  balance: true,
  referralCode: true
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertTaskCompletionSchema = createInsertSchema(taskCompletions).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TaskCompletion = typeof taskCompletions.$inferSelect;
export type InsertTaskCompletion = z.infer<typeof insertTaskCompletionSchema>;