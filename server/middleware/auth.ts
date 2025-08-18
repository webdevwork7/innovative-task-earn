import { Request, Response, NextFunction } from 'express';
import { db } from '../services/database';
import { users } from '../../database/schema';
import { eq } from 'drizzle-orm';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
      session?: any;
    }
  }
}

/**
 * Middleware to check if user is authenticated
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.userId))
      .limit(1);

    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Invalid session' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Account suspended' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}

/**
 * Middleware to check if user is admin
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.userId))
      .limit(1);

    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Invalid session' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Authorization error' });
  }
}

/**
 * Middleware to optionally load user if authenticated
 */
export async function loadUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.session?.userId) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.session.userId))
        .limit(1);

      if (user && user.status !== 'suspended') {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    console.error('Load user error:', error);
    next(); // Continue even if loading user fails
  }
}

/**
 * Middleware to check KYC verification status
 */
export async function requireKYC(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.kycStatus !== 'verified') {
    return res.status(403).json({ 
      error: 'KYC verification required',
      kycStatus: req.user.kycStatus 
    });
  }

  next();
}

/**
 * Rate limiting middleware
 */
const rateLimitMap = new Map();

export function rateLimit(maxRequests: number = 10, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitMap.has(key)) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const limit = rateLimitMap.get(key);
    
    if (now > limit.resetTime) {
      limit.count = 1;
      limit.resetTime = now + windowMs;
      return next();
    }

    if (limit.count >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests. Please try again later.' 
      });
    }

    limit.count++;
    next();
  };
}