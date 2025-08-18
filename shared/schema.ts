import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User verification status enum
export const verificationStatusEnum = pgEnum("verification_status", [
  "pending",
  "verified",
  "rejected"
]);

// User account status enum
export const accountStatusEnum = pgEnum("account_status", [
  "active",
  "suspended",
  "banned"
]);

// Gender enum
export const genderEnum = pgEnum("gender", [
  "male",
  "female",
  "other",
  "prefer_not_to_say"
]);

// User role enum
export const userRoleEnum = pgEnum("user_role", [
  "user",
  "admin"
]);

// Support team role enum
export const supportRoleEnum = pgEnum("support_role", [
  "agent",
  "supervisor",
  "admin"
]);

// Chat session status enum
export const chatStatusEnum = pgEnum("chat_status", [
  "waiting",
  "active",
  "resolved",
  "closed"
]);

// Message type enum
export const messageTypeEnum = pgEnum("message_type", [
  "user",
  "agent",
  "system",
  "faq"
]);

// Task category enum
export const taskCategoryEnum = pgEnum("task_category", [
  "app_download",
  "business_review", 
  "product_review",
  "channel_subscribe",
  "comment_like",
  "youtube_video_see",
  "survey",
  "social_media"
]);

// Task completion status enum
export const taskCompletionStatusEnum = pgEnum("task_completion_status", [
  "pending",
  "submitted", 
  "approved",
  "rejected"
]);

// Admin users table (separate from regular users)
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(), // Will store hashed password
  name: varchar("name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Users table - Optimized for 200k+ user scale
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Traditional auth fields
  password: varchar("password"), // For traditional login (hashed)
  phoneNumber: varchar("phone_number"),
  dateOfBirth: varchar("date_of_birth"),
  gender: genderEnum("gender"),
  
  // Address fields
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  pincode: varchar("pincode"),
  
  // Bank details fields
  accountHolderName: varchar("account_holder_name"),
  accountNumber: varchar("account_number"),
  ifscCode: varchar("ifsc_code"),
  bankName: varchar("bank_name"),
  
  // Government ID fields
  governmentIdType: varchar("government_id_type"),
  governmentIdNumber: varchar("government_id_number"),
  governmentIdUrl: varchar("government_id_url"), // Object storage path
  
  // KYC fields
  kycStatus: varchar("kyc_status", { enum: ["pending", "submitted", "approved", "rejected"] }).default("pending"),
  kycFeePaid: boolean("kyc_fee_paid").default(false),
  kycFeePaymentId: varchar("kyc_fee_payment_id"),
  govIdFrontUrl: varchar("gov_id_front_url"),
  govIdBackUrl: varchar("gov_id_back_url"),
  selfieWithIdUrl: varchar("selfie_with_id_url"),
  kycSubmittedAt: timestamp("kyc_submitted_at"),
  kycApprovedAt: timestamp("kyc_approved_at"),
  
  // System fields
  role: userRoleEnum("role").default("user").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  referralCode: varchar("referral_code").unique(),
  referredBy: varchar("referred_by"),
  verificationStatus: verificationStatusEnum("verification_status").default("pending").notNull(),
  status: accountStatusEnum("status").default("active").notNull(),
  dailyWatchTime: integer("daily_watch_time").default(0).notNull(), // in minutes
  lastWatchDate: timestamp("last_watch_date"),
  lastHourlyBonusAt: timestamp("last_hourly_bonus_at"),
  hourlyBonusCount: integer("hourly_bonus_count").default(0).notNull(),
  
  // Account suspension fields
  suspendedAt: timestamp("suspended_at"),
  suspensionReason: varchar("suspension_reason"),
  consecutiveFailedDays: integer("consecutive_failed_days").default(0).notNull(),
  reactivationFeePaid: boolean("reactivation_fee_paid").default(false).notNull(),
  reactivationFeeAmount: decimal("reactivation_fee_amount", { precision: 8, scale: 2 }).default("49.00"),
  
  // Password reset fields
  resetToken: varchar("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Indexes for performance at scale
  index("idx_users_email").on(table.email),
  index("idx_users_referral_code").on(table.referralCode),
  index("idx_users_referred_by").on(table.referredBy),
  index("idx_users_kyc_status").on(table.kycStatus),
  index("idx_users_verification_status").on(table.verificationStatus),
  index("idx_users_created_at").on(table.createdAt),
]);

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: taskCategoryEnum("category").notNull(),
  reward: varchar("reward").notNull(),
  timeLimit: integer("time_limit"), // in minutes, null for no limit
  maxCompletions: integer("max_completions"), // null for unlimited
  currentCompletions: integer("current_completions").default(0).notNull(),
  requirements: text("requirements"), // JSON string with task requirements
  verificationMethod: varchar("verification_method"), // "automatic", "manual", "screenshot"
  taskLink: varchar("task_link").notNull(), // Mandatory link for direct task access
  isActive: boolean("is_active").default(true).notNull(),
  expiryDate: timestamp("expiry_date"),
  createdBy: varchar("created_by").references(() => adminUsers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_tasks_category").on(table.category),
  index("idx_tasks_active").on(table.isActive),
  index("idx_tasks_created_at").on(table.createdAt),
]);

// Task completions table
export const taskCompletions = pgTable("task_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  taskId: varchar("task_id").references(() => tasks.id).notNull(),
  status: taskCompletionStatusEnum("status").default("pending").notNull(),
  proofData: text("proof_data"), // Screenshots, links, etc.
  proofImages: text("proof_images").array(), // Array of uploaded image URLs
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => adminUsers.id),
  rewardCredited: boolean("reward_credited").default(false).notNull(),
  rejectionReason: text("rejection_reason"),
}, (table) => [
  index("idx_task_completions_user").on(table.userId),
  index("idx_task_completions_task").on(table.taskId),
  index("idx_task_completions_status").on(table.status),
  index("idx_task_completions_user_task").on(table.userId, table.taskId),
]);

// Videos table (kept for compatibility)
export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  url: varchar("url").notNull(), // Video URL
  thumbnailUrl: varchar("thumbnail_url"),
  duration: integer("duration").notNull(), // in seconds
  category: varchar("category"),
  earning: decimal("earning", { precision: 8, scale: 2 }).notNull(),
  views: integer("views").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Video watch progress - Optimized for large scale tracking
export const videoProgress = pgTable("video_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  videoId: varchar("video_id").references(() => videos.id).notNull(),
  watchedSeconds: integer("watched_seconds").default(0).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  isEarningCredited: boolean("is_earning_credited").default(false).notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  // Composite index for user-video lookup (most common query)
  index("idx_video_progress_user_video").on(table.userId, table.videoId),
  index("idx_video_progress_user_id").on(table.userId),
  index("idx_video_progress_completed").on(table.isCompleted),
]);

// Earnings table - Optimized for 200k+ users with permanent history
export const earnings = pgTable("earnings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  videoId: varchar("video_id").references(() => videos.id),
  taskId: varchar("task_id").references(() => tasks.id),
  type: varchar("type").notNull(), // "video", "task", "referral", "hourly_bonus", "signup_bonus"
  amount: decimal("amount", { precision: 8, scale: 2 }).notNull(),
  description: varchar("description"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  // Indexes for performance with large user base
  index("idx_earnings_user_id").on(table.userId),
  index("idx_earnings_created_at").on(table.createdAt),
  index("idx_earnings_user_date").on(table.userId, table.createdAt),
  index("idx_earnings_type").on(table.type),
]);

// Referrals table
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").references(() => users.id).notNull(),
  referredId: varchar("referred_id").references(() => users.id).notNull(),
  isEarningCredited: boolean("is_earning_credited").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payout requests - Optimized for admin processing and user history
export const payoutRequests = pgTable("payout_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("pending").notNull(), // "pending", "processing", "completed", "failed", "declined"
  bankDetails: text("bank_details").notNull(),
  reason: text("reason"), // reason for decline or other status updates
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at"),
}, (table) => [
  // Indexes for efficient admin processing and user history
  index("idx_payout_user_id").on(table.userId),
  index("idx_payout_status").on(table.status),
  index("idx_payout_requested_at").on(table.requestedAt),
  index("idx_payout_user_status").on(table.userId, table.status),
]);

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  isAdmin: boolean("is_admin").default(false).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment history table for tracking KYC and reactivation payments
export const paymentHistory = pgTable("payment_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // "kyc", "reactivation"
  amount: decimal("amount", { precision: 8, scale: 2 }).notNull(),
  orderId: varchar("order_id"),
  paymentMethod: varchar("payment_method"), // "cashfree", "development_fallback", etc.
  status: varchar("status").notNull(), // "pending", "completed", "failed"
  paymentGatewayData: jsonb("payment_gateway_data"), // Store Cashfree response data
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("idx_payment_history_user_id").on(table.userId),
  index("idx_payment_history_type").on(table.type),
  index("idx_payment_history_status").on(table.status),
  index("idx_payment_history_created_at").on(table.createdAt),
  index("idx_payment_history_user_type").on(table.userId, table.type),
]);

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  earnings: many(earnings),
  videoProgress: many(videoProgress),
  taskCompletions: many(taskCompletions),
  referralsMade: many(referrals, { relationName: "referrer" }),
  referralsReceived: many(referrals, { relationName: "referred" }),
  payoutRequests: many(payoutRequests),
  chatMessages: many(chatMessages),
  paymentHistory: many(paymentHistory),
  referredByUser: one(users, {
    fields: [users.referredBy],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ many, one }) => ({
  completions: many(taskCompletions),
  createdBy: one(adminUsers, {
    fields: [tasks.createdBy],
    references: [adminUsers.id],
  }),
}));

export const taskCompletionsRelations = relations(taskCompletions, ({ one }) => ({
  user: one(users, {
    fields: [taskCompletions.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [taskCompletions.taskId],
    references: [tasks.id],
  }),
  reviewedBy: one(adminUsers, {
    fields: [taskCompletions.reviewedBy],
    references: [adminUsers.id],
  }),
}));

export const videosRelations = relations(videos, ({ many }) => ({
  videoProgress: many(videoProgress),
  earnings: many(earnings),
}));

export const videoProgressRelations = relations(videoProgress, ({ one }) => ({
  user: one(users, {
    fields: [videoProgress.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [videoProgress.videoId],
    references: [videos.id],
  }),
}));

export const earningsRelations = relations(earnings, ({ one }) => ({
  user: one(users, {
    fields: [earnings.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [earnings.videoId],
    references: [videos.id],
  }),
  task: one(tasks, {
    fields: [earnings.taskId],
    references: [tasks.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrer",
  }),
  referred: one(users, {
    fields: [referrals.referredId],
    references: [users.id],
    relationName: "referred",
  }),
}));

export const payoutRequestsRelations = relations(payoutRequests, ({ one }) => ({
  user: one(users, {
    fields: [payoutRequests.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const paymentHistoryRelations = relations(paymentHistory, ({ one }) => ({
  user: one(users, {
    fields: [paymentHistory.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  balance: true,
  dailyWatchTime: true,
  lastWatchDate: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  views: true,
});

export const insertVideoProgressSchema = createInsertSchema(videoProgress).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertEarningSchema = createInsertSchema(earnings).omit({
  id: true,
  createdAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
  isEarningCredited: true,
});

export const insertPayoutRequestSchema = createInsertSchema(payoutRequests).omit({
  id: true,
  requestedAt: true,
  processedAt: true,
  status: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentHistorySchema = createInsertSchema(paymentHistory).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentCompletions: true,
});

export const insertTaskCompletionSchema = createInsertSchema(taskCompletions).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
  rewardCredited: true,
});

// Admin login schema
export const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Upsert user schema for auth
export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminLogin = z.infer<typeof adminLoginSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type VideoProgress = typeof videoProgress.$inferSelect;
export type InsertVideoProgress = z.infer<typeof insertVideoProgressSchema>;
export type Earning = typeof earnings.$inferSelect;
export type InsertEarning = z.infer<typeof insertEarningSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type PayoutRequest = typeof payoutRequests.$inferSelect;
export type InsertPayoutRequest = z.infer<typeof insertPayoutRequestSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type InsertPaymentHistory = z.infer<typeof insertPaymentHistorySchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TaskCompletion = typeof taskCompletions.$inferSelect;
export type InsertTaskCompletion = z.infer<typeof insertTaskCompletionSchema>;

// Support team members table
export const supportTeam = pgTable("support_team", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email").notNull().unique(),
  role: supportRoleEnum("role").default("agent").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastActive: timestamp("last_active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_support_team_email").on(table.email),
  index("idx_support_team_role").on(table.role),
  index("idx_support_team_active").on(table.isActive),
]);

// FAQ categories
export const faqCategories = pgTable("faq_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// FAQ items
export const faqs = pgTable("faqs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").references(() => faqCategories.id),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  views: integer("views").default(0),
  helpful: integer("helpful").default(0),
  notHelpful: integer("not_helpful").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_faqs_category").on(table.categoryId),
  index("idx_faqs_active").on(table.isActive),
]);

// Chat sessions
export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  assignedAgentId: varchar("assigned_agent_id").references(() => supportTeam.id),
  status: chatStatusEnum("status").default("waiting").notNull(),
  priority: varchar("priority").default("normal").notNull(),
  subject: varchar("subject"),
  startedAt: timestamp("started_at").defaultNow(),
  assignedAt: timestamp("assigned_at"),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
  rating: integer("rating"),
  feedback: text("feedback"),
  lastActivity: timestamp("last_activity").defaultNow(),
}, (table) => [
  index("idx_chat_sessions_user").on(table.userId),
  index("idx_chat_sessions_agent").on(table.assignedAgentId),
  index("idx_chat_sessions_status").on(table.status),
  index("idx_chat_sessions_priority").on(table.priority),
  index("idx_chat_sessions_last_activity").on(table.lastActivity),
]);

// Enhanced Chat messages table
export const liveChatMessages = pgTable("live_chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => chatSessions.id).notNull(),
  senderId: varchar("sender_id"),
  senderType: messageTypeEnum("sender_type").notNull(),
  message: text("message").notNull(),
  attachments: text("attachments").array(),
  faqId: varchar("faq_id").references(() => faqs.id),
  isRead: boolean("is_read").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => [
  index("idx_live_chat_messages_session").on(table.sessionId),
  index("idx_live_chat_messages_sender").on(table.senderId),
  index("idx_live_chat_messages_timestamp").on(table.timestamp),
  index("idx_live_chat_messages_read").on(table.isRead),
]);

// Chat invitations for team members
export const chatInvitations = pgTable("chat_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  role: supportRoleEnum("role").default("agent").notNull(),
  token: varchar("token").notNull().unique(),
  invitedBy: varchar("invited_by").references(() => supportTeam.id),
  isUsed: boolean("is_used").default(false).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_chat_invitations_token").on(table.token),
  index("idx_chat_invitations_email").on(table.email),
]);

// Advertiser Inquiries table
export const advertiserInquiries = pgTable("advertiser_inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()::text`),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  website: varchar("website", { length: 500 }),
  industry: varchar("industry", { length: 100 }).notNull(),
  campaignBudget: varchar("campaign_budget", { length: 50 }).notNull(),
  taskTypes: jsonb("task_types").notNull(), // Array of selected task type IDs
  campaignObjective: text("campaign_objective").notNull(),
  targetAudience: text("target_audience").notNull(),
  campaignDuration: varchar("campaign_duration", { length: 50 }).notNull(),
  additionalRequirements: text("additional_requirements"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, contacted, in_progress, completed, rejected
  assignedTo: varchar("assigned_to", { length: 255 }), // Admin user ID who handles this inquiry
  notes: text("notes"), // Internal notes from admin team
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Contact Form Inquiries table  
export const contactInquiries = pgTable("contact_inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()::text`),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  inquiryType: varchar("inquiry_type", { length: 50 }).notNull(), // general, support, business, complaint, suggestion
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, responded, resolved, closed
  assignedTo: varchar("assigned_to", { length: 255 }), // Admin user ID who handles this inquiry
  adminResponse: text("admin_response"), // Response from admin team
  responseDate: timestamp("response_date"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Schema exports and types
export const insertAdvertiserInquirySchema = createInsertSchema(advertiserInquiries);
export const insertContactInquirySchema = createInsertSchema(contactInquiries);

export type AdvertiserInquiry = typeof advertiserInquiries.$inferSelect;
export type ContactInquiry = typeof contactInquiries.$inferSelect;
export type InsertAdvertiserInquiry = z.infer<typeof insertAdvertiserInquirySchema>;
export type InsertContactInquiry = z.infer<typeof insertContactInquirySchema>;

// Chat system types
export type SupportTeam = typeof supportTeam.$inferSelect;
export type FaqCategory = typeof faqCategories.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;
export type LiveChatMessage = typeof liveChatMessages.$inferSelect;
export type ChatInvitation = typeof chatInvitations.$inferSelect;
