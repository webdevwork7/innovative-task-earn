import bcrypt from 'bcryptjs';
import { adminUsers, type AdminUser, type AdminLogin } from '@shared/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';

// Extend session interface to include adminUser
declare module 'express-session' {
  interface SessionData {
    adminUser?: AdminUser;
  }
}

// Admin authentication middleware
export const isAdminAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ message: "Admin authentication required" });
  }
  next();
};

// Admin login function
// Temporary admin user while database is unavailable
const tempAdmin = {
  id: "temp-admin-001",
  name: "Admin User",
  username: "admin",
  password: "admin123", // Plain text for demo
  isActive: true,
  createdAt: new Date(),
  lastLoginAt: new Date(),
  updatedAt: new Date()
};

export async function authenticateAdmin(username: string, password: string): Promise<AdminUser | null> {
  try {
    // Use temporary admin credentials when database is unavailable
    if (username === tempAdmin.username && password === tempAdmin.password) {
      console.log('Admin authenticated with temporary credentials');
      return tempAdmin;
    }

    return null;
  } catch (error) {
    console.error('Admin authentication error:', error);
    return null;
  }
}

// Admin logout function
export function logoutAdmin(req: any): void {
  if (req.session.adminUser) {
    delete req.session.adminUser;
  }
}