import { Router } from 'express';
import { z } from 'zod';
import { db } from '../services/database';
import { tasks, taskCompletions, earnings, users } from '../../database/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  category: z.enum([
    'app_download',
    'business_review',
    'product_review',
    'channel_subscribe',
    'comment_like',
    'youtube_video_see'
  ]),
  reward: z.number().min(5).max(100),
  timeLimit: z.number().min(5).max(60),
  requirements: z.array(z.string())
});

const submitTaskSchema = z.object({
  taskId: z.string().uuid(),
  proofUrl: z.string().url().optional(),
  proofText: z.string().min(10).optional()
}).refine(data => data.proofUrl || data.proofText, {
  message: 'Either proof URL or proof text is required'
});

const reviewTaskSchema = z.object({
  completionId: z.string().uuid(),
  status: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().optional()
});

// Get all active tasks
router.get('/', async (req, res) => {
  try {
    const activeTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.isActive, true))
      .orderBy(desc(tasks.createdAt));

    res.json(activeTasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get task by ID
router.get('/:id', async (req, res) => {
  try {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, req.params.id))
      .limit(1);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create new task (Admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const data = createTaskSchema.parse(req.body);

    const [newTask] = await db
      .insert(tasks)
      .values({
        ...data,
        createdBy: req.user.id
      })
      .returning();

    res.json({
      success: true,
      task: newTask
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task (Admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const data = createTaskSchema.partial().parse(req.body);

    const [updatedTask] = await db
      .update(tasks)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(tasks.id, req.params.id))
      .returning();

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Toggle task active status (Admin only)
router.patch('/:id/toggle', requireAdmin, async (req, res) => {
  try {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, req.params.id))
      .limit(1);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const [updatedTask] = await db
      .update(tasks)
      .set({
        isActive: !task.isActive,
        updatedAt: new Date()
      })
      .where(eq(tasks.id, req.params.id))
      .returning();

    res.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ error: 'Failed to toggle task status' });
  }
});

// Submit task completion
router.post('/submit', requireAuth, async (req, res) => {
  try {
    const data = submitTaskSchema.parse(req.body);

    // Check if task exists and is active
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(
        eq(tasks.id, data.taskId),
        eq(tasks.isActive, true)
      ))
      .limit(1);

    if (!task) {
      return res.status(404).json({ error: 'Task not found or inactive' });
    }

    // Check if already submitted
    const [existing] = await db
      .select()
      .from(taskCompletions)
      .where(and(
        eq(taskCompletions.taskId, data.taskId),
        eq(taskCompletions.userId, req.user.id)
      ))
      .limit(1);

    if (existing) {
      return res.status(400).json({ 
        error: 'Task already submitted',
        status: existing.status 
      });
    }

    // Create task completion
    const [completion] = await db
      .insert(taskCompletions)
      .values({
        taskId: data.taskId,
        userId: req.user.id,
        proofUrl: data.proofUrl,
        proofText: data.proofText,
        earnings: task.reward,
        status: 'pending'
      })
      .returning();

    res.json({
      success: true,
      message: 'Task submitted for review',
      completion
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Submit task error:', error);
    res.status(500).json({ error: 'Failed to submit task' });
  }
});

// Get user's task completions
router.get('/completions/my', requireAuth, async (req, res) => {
  try {
    const completions = await db
      .select({
        completion: taskCompletions,
        task: tasks
      })
      .from(taskCompletions)
      .innerJoin(tasks, eq(taskCompletions.taskId, tasks.id))
      .where(eq(taskCompletions.userId, req.user.id))
      .orderBy(desc(taskCompletions.submittedAt));

    res.json(completions);
  } catch (error) {
    console.error('Get completions error:', error);
    res.status(500).json({ error: 'Failed to fetch completions' });
  }
});

// Review task completion (Admin only)
router.post('/review', requireAdmin, async (req, res) => {
  try {
    const data = reviewTaskSchema.parse(req.body);

    // Get completion details
    const [completion] = await db
      .select()
      .from(taskCompletions)
      .where(eq(taskCompletions.id, data.completionId))
      .limit(1);

    if (!completion) {
      return res.status(404).json({ error: 'Completion not found' });
    }

    if (completion.status !== 'pending') {
      return res.status(400).json({ error: 'Task already reviewed' });
    }

    // Update completion status
    const [updated] = await db
      .update(taskCompletions)
      .set({
        status: data.status,
        reviewedAt: new Date(),
        reviewedBy: req.user.id,
        rejectionReason: data.status === 'rejected' ? data.rejectionReason : null
      })
      .where(eq(taskCompletions.id, data.completionId))
      .returning();

    // If approved, add earnings and update user balance
    if (data.status === 'approved') {
      // Add earning record
      await db.insert(earnings).values({
        userId: completion.userId,
        amount: completion.earnings,
        type: 'task',
        description: `Task completion approved`,
        taskCompletionId: completion.id
      });

      // Update user balance
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${completion.earnings}`
        })
        .where(eq(users.id, completion.userId));
    }

    res.json({
      success: true,
      message: `Task ${data.status}`,
      completion: updated
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Review task error:', error);
    res.status(500).json({ error: 'Failed to review task' });
  }
});

// Get pending reviews (Admin only)
router.get('/pending-reviews', requireAdmin, async (req, res) => {
  try {
    const pending = await db
      .select({
        completion: taskCompletions,
        task: tasks,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName
        }
      })
      .from(taskCompletions)
      .innerJoin(tasks, eq(taskCompletions.taskId, tasks.id))
      .innerJoin(users, eq(taskCompletions.userId, users.id))
      .where(eq(taskCompletions.status, 'pending'))
      .orderBy(taskCompletions.submittedAt);

    res.json(pending);
  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch pending reviews' });
  }
});

export default router;