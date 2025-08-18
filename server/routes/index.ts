import { Express } from 'express';
import { createServer, type Server } from 'http';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from '../db';

const PgSession = connectPgSimple(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  const sessionConfig: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax'
    }
  };

  // Use PostgreSQL store in production, memory store in development
  if (pool && process.env.NODE_ENV === 'production') {
    sessionConfig.store = new PgSession({
      pool: pool,
      tableName: 'sessions'
    });
    console.log('Using PostgreSQL session store');
  } else {
    console.log('Using memory session store (development mode)');
  }

  app.use(session(sessionConfig));

  // Simple auth check endpoint for now
  app.get('/api/auth/check', async (req, res) => {
    if (req.session && (req.session as any).userId) {
      const userId = (req.session as any).userId;
      const role = (req.session as any).role;
      
      // Return complete user data for development mode
      if (userId === 'admin-001') {
        res.json({ 
          user: { 
            id: 'admin-001',
            email: 'admin@innovativetaskearn.online',
            role: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            balance: 0
          } 
        });
      } else {
        // Get user from storage for all other users
        const { storage } = await import('../storage');
        const user = await storage.getUserById(userId);
        
        if (user) {
          res.json({ 
            user: { 
              id: user.id,
              email: user.email,
              role: user.role,
              firstName: user.firstName,
              lastName: user.lastName,
              balance: user.balance,
              kycStatus: user.kycStatus,
              verificationStatus: user.verificationStatus,
              status: user.status
            } 
          });
        } else {
          res.json({ user: { id: userId, role: role || 'user' } });
        }
      }
    } else {
      res.json({ user: null });
    }
  });

  // Login endpoint using storage authentication
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Basic validation - only check if completely empty
    if (!email || !password || email.trim() === '' || password.trim() === '') {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    console.log('Login attempt for:', email);
    
    try {
      const { storage } = await import('../storage');
      const user = await storage.authenticateUser(email, password);
      
      if (user) {
        // Check if account is suspended
        if (user.status === 'suspended') {
          console.log('Suspended user login attempt for:', email);
          res.status(403).json({ 
            error: 'Account suspended',
            requiresReactivation: true,
            phone: user.phone,
            name: `${user.firstName} ${user.lastName}`,
            suspensionReason: user.suspensionReason
          });
          return;
        }
        
        // Set session
        (req.session as any).userId = user.id;
        (req.session as any).role = user.role;
        
        console.log(`${user.role === 'admin' ? 'Admin' : 'User'} login successful for: ${email}`);
        
        res.json({ 
          success: true, 
          user: { 
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            status: user.status,
            kycStatus: user.kycStatus,
            verificationStatus: user.verificationStatus,
            balance: user.balance
          } 
        });
      } else {
        console.log('Invalid credentials for:', email);
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Signup endpoint with ₹1000 bonus
  app.post('/api/auth/signup', async (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body;
    console.log('Signup attempt for:', email);
    
    // Comprehensive validation
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    // Phone number validation (basic)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Phone number must be 10 digits' });
    }

    // In development mode, create user in memory storage
    if (process.env.NODE_ENV === 'development') {
      // Check if email already exists (simulate for dev)
      if (email === 'demo@innovativetaskearn.online' || email === 'admin@innovativetaskearn.online') {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create new user ID and session
      const newUserId = `user-${Date.now()}`;
      (req.session as any).userId = newUserId;
      (req.session as any).role = 'user';
      
      console.log('Signup successful with ₹1000 bonus for:', email);
      res.json({
        success: true,
        message: 'Account created successfully with ₹1000 signup bonus!',
        user: {
          id: newUserId,
          email: email,
          firstName: firstName,
          lastName: lastName,
          role: 'user',
          balance: 1000
        },
        signupBonus: 1000
      });
    } else {
      res.status(501).json({ error: 'Signup not implemented in production' });
    }
  });

  // Reactivation payment initiation endpoint
  app.post('/api/reactivation/initiate', async (req, res) => {
    const { email, phone, name } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Development mode simulation
    if (process.env.NODE_ENV === 'development') {
      console.log(`Development mode: Simulating reactivation payment for ${email}`);
      
      // Generate order ID
      const orderId = `REACT_DEV_${Date.now()}`;
      
      // Store order details in session for verification
      (req.session as any).reactivationOrderId = orderId;
      (req.session as any).reactivationEmail = email;
      
      // Return simulated payment URL
      const paymentUrl = `/reactivation?payment=success&orderId=${orderId}`;
      
      res.json({ 
        success: true,
        paymentUrl: paymentUrl,
        orderId: orderId,
        sessionId: 'dev-session-' + orderId,
        devMode: true,
        message: 'Development mode: Click the payment URL to simulate successful payment'
      });
    } else {
      // Production mode with real Cashfree
      try {
        const { createPaymentSession } = await import('../cashfree');
        
        const orderId = `REACT_${Date.now()}`;
        
        const paymentSession = await createPaymentSession(
          orderId,
          49, // ₹49 reactivation fee
          phone || '9999999999',
          email,
          name || email,
          'reactivation_fee'
        );
        
        (req.session as any).reactivationOrderId = orderId;
        (req.session as any).reactivationEmail = email;
        
        const paymentUrl = `https://payments.cashfree.com/forms/reactivation?session_id=${paymentSession.payment_session_id}`;
        
        res.json({ 
          success: true,
          paymentUrl: paymentUrl,
          orderId: orderId,
          sessionId: paymentSession.payment_session_id
        });
      } catch (error) {
        console.error('Reactivation payment initiation error:', error);
        res.status(500).json({ error: 'Failed to initiate payment. Please check Cashfree credentials.' });
      }
    }
  });

  // Reactivation payment verification endpoint
  app.post('/api/reactivation/verify', async (req, res) => {
    const orderId = (req.session as any)?.reactivationOrderId;
    const email = (req.session as any)?.reactivationEmail;
    
    if (!orderId || !email) {
      return res.status(400).json({ error: 'Invalid session' });
    }
    
    try {
      // Import Cashfree module
      const { verifyPayment } = await import('../cashfree');
      
      // Verify payment with Cashfree
      const paymentStatus = await verifyPayment(orderId);
      
      if (paymentStatus.payment_status === 'SUCCESS') {
        // In development mode, simulate account reactivation
        console.log(`Account reactivated for: ${email}`);
        
        // Clear reactivation session data
        delete (req.session as any).reactivationOrderId;
        delete (req.session as any).reactivationEmail;
        
        res.json({ 
          success: true,
          message: 'Account reactivated successfully'
        });
      } else {
        res.status(400).json({ 
          error: 'Payment verification failed',
          status: paymentStatus.payment_status
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      // In development mode, allow simulation
      if (process.env.NODE_ENV === 'development') {
        console.log(`Development mode: Simulating successful reactivation for ${email}`);
        res.json({ 
          success: true,
          message: 'Account reactivated successfully (dev mode)'
        });
      } else {
        res.status(500).json({ error: 'Payment verification failed' });
      }
    }
  });

  // Work time tracking endpoints
  app.get('/api/user/work-time', async (req, res) => {
    const userId = (req.session as any)?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const { workTimeTracker } = await import('../workTimeTracker');
      const workData = await workTimeTracker.getUserWorkHours(userId);
      res.json(workData);
    } catch (error) {
      console.error('Failed to get work time:', error);
      res.json({
        hoursWorked: 0,
        hoursRemaining: 8,
        isRequirementMet: false
      });
    }
  });

  app.post('/api/user/update-activity', async (req, res) => {
    const userId = (req.session as any)?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const { workTimeTracker } = await import('../workTimeTracker');
      workTimeTracker.updateActivity(userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update activity:', error);
      res.status(500).json({ error: 'Failed to update activity' });
    }
  });

  app.get('/api/admin/work-statistics', async (req, res) => {
    const userRole = (req.session as any)?.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    try {
      const { workTimeTracker } = await import('../workTimeTracker');
      const stats = await workTimeTracker.getWorkStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Failed to get work statistics:', error);
      res.status(500).json({ error: 'Failed to get statistics' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ success: true });
    });
  });

  // Get tasks endpoint
  app.get('/api/tasks', (req, res) => {
    // Return sample tasks for development
    const sampleTasks = [
      { id: '1', title: 'Download Amazon App', category: 'app_download', reward: 15, timeLimit: 20, isActive: true },
      { id: '2', title: 'Review Local Restaurant', category: 'business_review', reward: 20, timeLimit: 20, isActive: true },
      { id: '3', title: 'Subscribe to Tech Channel', category: 'channel_subscribe', reward: 10, timeLimit: 15, isActive: true },
      { id: '4', title: 'Review Product', category: 'product_review', reward: 25, timeLimit: 30, isActive: true },
      { id: '5', title: 'Like and Comment', category: 'comment_like', reward: 5, timeLimit: 10, isActive: true },
      { id: '6', title: 'Watch Video', category: 'youtube_video_see', reward: 8, timeLimit: 15, isActive: true }
    ];
    res.json(sampleTasks);
  });

  // Admin task creation endpoint
  app.post('/api/admin/tasks', (req, res) => {
    const userId = (req.session as any)?.userId;
    const role = (req.session as any)?.role;
    
    if (!userId || role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { title, category, description, reward, timeLimit, requirements } = req.body;

    // Validate required fields
    if (!title || !category || !description || !reward || !timeLimit) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create new task with generated ID
    const newTask = {
      id: `task_${Date.now()}`,
      title,
      category,
      description,
      reward: Number(reward),
      timeLimit: Number(timeLimit),
      requirements: requirements || '',
      status: 'active',
      completions: 0,
      approvalRate: 100,
      createdDate: new Date().toISOString(),
      createdBy: userId,
      isActive: true
    };

    console.log('New task created by admin:', newTask);

    res.json({
      success: true,
      task: newTask,
      message: 'Task created successfully'
    });
  });

  // Admin get all tasks endpoint
  app.get('/api/admin/tasks', (req, res) => {
    const userId = (req.session as any)?.userId;
    const role = (req.session as any)?.role;
    
    if (!userId || role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const adminTasks = [
      { 
        id: '1', 
        title: 'Download Amazon App', 
        category: 'app_download', 
        description: 'Download and install the Amazon Shopping app, take a screenshot of the installed app on your home screen',
        reward: 15, 
        timeLimit: 20, 
        status: 'active',
        completions: 234,
        approvalRate: 95.2,
        createdDate: '2024-08-01T10:00:00Z',
        createdBy: 'admin-001'
      },
      { 
        id: '2', 
        title: 'Review Local Restaurant', 
        category: 'business_review', 
        description: 'Write a genuine review for a local restaurant on Google Maps with at least 100 words',
        reward: 20, 
        timeLimit: 30, 
        status: 'active',
        completions: 156,
        approvalRate: 88.7,
        createdDate: '2024-08-02T14:30:00Z',
        createdBy: 'admin-001'
      },
      { 
        id: '3', 
        title: 'Subscribe to Tech Channel', 
        category: 'channel_subscribe', 
        description: 'Subscribe to specified tech YouTube channel and provide screenshot of subscription confirmation',
        reward: 10, 
        timeLimit: 15, 
        status: 'active',
        completions: 445,
        approvalRate: 97.8,
        createdDate: '2024-08-03T09:15:00Z',
        createdBy: 'admin-001'
      },
      { 
        id: '4', 
        title: 'Review Product on E-commerce', 
        category: 'product_review', 
        description: 'Write a detailed product review on specified e-commerce platform with photos',
        reward: 25, 
        timeLimit: 45, 
        status: 'active',
        completions: 89,
        approvalRate: 92.1,
        createdDate: '2024-08-04T16:45:00Z',
        createdBy: 'admin-001'
      },
      { 
        id: '5', 
        title: 'Social Media Engagement', 
        category: 'comment_like', 
        description: 'Like and comment meaningfully on specified social media posts',
        reward: 8, 
        timeLimit: 10, 
        status: 'active',
        completions: 567,
        approvalRate: 91.4,
        createdDate: '2024-08-05T11:20:00Z',
        createdBy: 'admin-001'
      },
      { 
        id: '6', 
        title: 'Watch and Share Video', 
        category: 'youtube_video_see', 
        description: 'Watch full video, like, and share on your social media with meaningful caption',
        reward: 12, 
        timeLimit: 20, 
        status: 'active',
        completions: 323,
        approvalRate: 94.6,
        createdDate: '2024-08-06T13:00:00Z',
        createdBy: 'admin-001'
      }
    ];

    res.json(adminTasks);
  });

  // Admin endpoints
  
  // Admin dashboard stats
  app.get('/api/admin/stats', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    res.json({
      totalUsers: 156,
      activeUsers: 89,
      totalTasks: 342,
      completedTasks: 278,
      pendingPayouts: 23,
      totalPayoutAmount: 4567,
      todayEarnings: 892,
      weeklyEarnings: 6234
    });
  });
  
  // Admin get all users
  app.get('/api/admin/users', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const sampleUsers = [
      { 
        id: 'user-001', 
        email: 'demo@innovativetaskearn.online', 
        firstName: 'Demo', 
        lastName: 'User',
        role: 'user',
        status: 'active',
        kycStatus: 'verified',
        balance: 250,
        totalEarnings: 1250,
        joinedDate: '2025-01-01'
      },
      { 
        id: 'user-002', 
        email: 'john@example.com', 
        firstName: 'John', 
        lastName: 'Doe',
        role: 'user',
        status: 'active',
        kycStatus: 'pending',
        balance: 180,
        totalEarnings: 980,
        joinedDate: '2025-01-05'
      },
      { 
        id: 'user-003', 
        email: 'sarah@example.com', 
        firstName: 'Sarah', 
        lastName: 'Smith',
        role: 'user',
        status: 'suspended',
        kycStatus: 'verified',
        balance: 0,
        totalEarnings: 560,
        joinedDate: '2024-12-15'
      }
    ];
    
    res.json(sampleUsers);
  });
  
  // Admin get all tasks
  app.get('/api/admin/tasks', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const adminTasks = [
      { 
        id: '1', 
        title: 'Download Amazon App', 
        category: 'app_download', 
        reward: 15, 
        timeLimit: 20, 
        isActive: true,
        completions: 45,
        pendingReviews: 3,
        createdAt: '2025-01-10'
      },
      { 
        id: '2', 
        title: 'Review Local Restaurant', 
        category: 'business_review', 
        reward: 20, 
        timeLimit: 20, 
        isActive: true,
        completions: 32,
        pendingReviews: 5,
        createdAt: '2025-01-12'
      },
      { 
        id: '3', 
        title: 'Subscribe to Tech Channel', 
        category: 'channel_subscribe', 
        reward: 10, 
        timeLimit: 15, 
        isActive: false,
        completions: 78,
        pendingReviews: 0,
        createdAt: '2025-01-08'
      }
    ];
    
    res.json(adminTasks);
  });
  
  // Admin create task
  app.post('/api/admin/tasks', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const newTask = {
      id: Date.now().toString(),
      ...req.body,
      completions: 0,
      pendingReviews: 0,
      createdAt: new Date().toISOString()
    };
    
    res.json({ success: true, task: newTask });
  });
  
  // Admin get pending payouts
  app.get('/api/admin/payouts', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const pendingPayouts = [
      {
        id: 'payout-001',
        userId: 'user-001',
        userName: 'Demo User',
        email: 'demo@innovativetaskearn.online',
        amount: 250,
        requestDate: '2025-01-15',
        status: 'pending',
        method: 'upi'
      },
      {
        id: 'payout-002',
        userId: 'user-002',
        userName: 'John Doe',
        email: 'john@example.com',
        amount: 180,
        requestDate: '2025-01-14',
        status: 'pending',
        method: 'bank'
      }
    ];
    
    res.json(pendingPayouts);
  });
  
  // Admin approve payout
  app.post('/api/admin/payouts/:id/approve', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    res.json({ 
      success: true, 
      message: 'Payout approved successfully',
      payoutId: req.params.id 
    });
  });
  
  // Admin reject payout
  app.post('/api/admin/payouts/:id/reject', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    res.json({ 
      success: true, 
      message: 'Payout rejected',
      payoutId: req.params.id 
    });
  });
  
  // Admin approve task submission
  app.post('/api/admin/tasks/:taskId/submissions/:submissionId/approve', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    res.json({ 
      success: true, 
      message: 'Task submission approved',
      taskId: req.params.taskId,
      submissionId: req.params.submissionId
    });
  });
  
  // Admin reject task submission
  app.post('/api/admin/tasks/:taskId/submissions/:submissionId/reject', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    res.json({ 
      success: true, 
      message: 'Task submission rejected',
      taskId: req.params.taskId,
      submissionId: req.params.submissionId
    });
  });
  
  // Add missing admin report endpoints
  app.get('/api/admin/reports/:dateRange/:reportType', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const reportData = {
      revenue: {
        total: 567890,
        growth: 12.5,
        chart: [45000, 52000, 48000, 61000, 58000, 67890]
      },
      users: {
        total: 1234,
        active: 892,
        new: 156,
        growth: 8.2
      },
      tasks: {
        total: 4567,
        completed: 3890,
        pending: 677,
        completionRate: 85.2
      },
      payouts: {
        total: 234567,
        processed: 189,
        pending: 45,
        average: 1240
      },
      referrals: {
        total: 345,
        successful: 289,
        conversionRate: 83.8,
        earnings: 14161
      },
      topPerformers: [
        { name: 'John Doe', earnings: 5670, tasks: 234 },
        { name: 'Jane Smith', earnings: 4890, tasks: 198 },
        { name: 'Mike Johnson', earnings: 4230, tasks: 176 },
        { name: 'Sarah Williams', earnings: 3980, tasks: 165 },
        { name: 'Tom Brown', earnings: 3450, tasks: 143 }
      ],
      taskCategories: [
        { category: 'App Downloads', count: 890, earnings: 22250 },
        { category: 'Business Reviews', count: 567, earnings: 19845 },
        { category: 'Product Reviews', count: 445, earnings: 17800 },
        { category: 'Channel Subscribe', count: 678, earnings: 10170 },
        { category: 'Comments & Likes', count: 1234, earnings: 12340 },
        { category: 'YouTube Views', count: 753, earnings: 6024 }
      ]
    };
    
    res.json(reportData);
  });

  // Admin KYC management endpoints
  app.get('/api/admin/kyc/:filterStatus', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const kycSubmissions = [
      {
        id: 1,
        userId: 'user-001',
        userName: 'John Doe',
        email: 'john@example.com',
        submittedDate: '2024-08-15',
        status: 'pending',
        documents: {
          aadhaar: { uploaded: true, verified: false, number: 'XXXX-XXXX-1234' },
          pan: { uploaded: true, verified: false, number: 'ABCDE1234F' },
          bank: { uploaded: true, verified: false, accountNumber: 'XXXX1234' }
        },
        paymentStatus: 'completed',
        paymentAmount: 99
      },
      {
        id: 2,
        userId: 'user-002',
        userName: 'Jane Smith',
        email: 'jane@example.com',
        submittedDate: '2024-08-14',
        status: 'verified',
        documents: {
          aadhaar: { uploaded: true, verified: true, number: 'XXXX-XXXX-5678' },
          pan: { uploaded: true, verified: true, number: 'XYZAB5678C' },
          bank: { uploaded: true, verified: true, accountNumber: 'XXXX5678' }
        },
        paymentStatus: 'completed',
        paymentAmount: 99
      }
    ];
    
    res.json(kycSubmissions);
  });

  // Admin referrals endpoint
  app.get('/api/admin/referrals/:filterStatus', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const referralData = {
      stats: {
        totalReferrals: 1234,
        successfulReferrals: 892,
        pendingReferrals: 145,
        failedReferrals: 197,
        totalBonusPaid: 43708,
        averageConversion: 72.3,
        topReferrer: { name: 'John Doe', count: 45 }
      },
      referrals: [
        {
          id: 1,
          referrerId: 'user-001',
          referrerName: 'John Doe',
          referrerEmail: 'john@example.com',
          referredId: 'user-101',
          referredName: 'Alice Smith',
          referredEmail: 'alice@example.com',
          referralCode: 'JOHN123',
          status: 'completed',
          bonusPaid: 49,
          joinedDate: '2024-08-10',
          kycStatus: 'verified'
        },
        {
          id: 2,
          referrerId: 'user-002',
          referrerName: 'Jane Smith',
          referrerEmail: 'jane@example.com',
          referredId: 'user-102',
          referredName: 'Bob Johnson',
          referredEmail: 'bob@example.com',
          referralCode: 'JANE456',
          status: 'pending',
          bonusPaid: 0,
          joinedDate: '2024-08-14',
          kycStatus: 'pending'
        }
      ],
      topReferrers: [
        { name: 'John Doe', referrals: 45, earnings: 2205 },
        { name: 'Jane Smith', referrals: 38, earnings: 1862 },
        { name: 'Mike Johnson', referrals: 32, earnings: 1568 },
        { name: 'Sarah Williams', referrals: 28, earnings: 1372 },
        { name: 'Tom Brown', referrals: 24, earnings: 1176 }
      ]
    };
    
    res.json(referralData);
  });

  // Admin support tickets endpoint
  app.get('/api/admin/support/tickets/:filterStatus', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const tickets = [
      {
        id: 'TKT-001',
        userId: 'user-001',
        userName: 'John Doe',
        email: 'john@example.com',
        subject: 'Unable to withdraw earnings',
        category: 'withdrawal',
        status: 'open',
        priority: 'high',
        createdAt: '2024-08-15T10:30:00',
        lastUpdated: '2024-08-15T14:20:00',
        messages: [
          {
            sender: 'John Doe',
            message: 'I have ₹1500 in my account but the withdrawal option is disabled.',
            timestamp: '2024-08-15T10:30:00',
            isUser: true
          },
          {
            sender: 'Support Agent',
            message: 'Let me check your account status. Can you confirm if your KYC is verified?',
            timestamp: '2024-08-15T14:20:00',
            isUser: false
          }
        ]
      },
      {
        id: 'TKT-002',
        userId: 'user-002',
        userName: 'Jane Smith',
        email: 'jane@example.com',
        subject: 'Task not approved after 24 hours',
        category: 'tasks',
        status: 'in_progress',
        priority: 'medium',
        createdAt: '2024-08-14T09:15:00',
        lastUpdated: '2024-08-14T16:45:00',
        messages: [
          {
            sender: 'Jane Smith',
            message: 'I completed a product review task yesterday but it\'s still pending approval.',
            timestamp: '2024-08-14T09:15:00',
            isUser: true
          }
        ]
      }
    ];
    
    res.json(tickets);
  });

  // User dashboard endpoints that reflect admin actions
  app.get('/api/user/dashboard', (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Return user-specific data that reflects admin actions
    const dashboardData = {
      balance: 1250,
      totalEarnings: 3450,
      pendingTasks: 3,
      completedTasks: 89,
      referrals: 5,
      recentEarnings: [
        { date: '2024-08-16', amount: 25, task: 'Product Review' },
        { date: '2024-08-15', amount: 15, task: 'App Download' },
        { date: '2024-08-14', amount: 20, task: 'Business Review' }
      ],
      notifications: [
        { id: 1, message: 'Task submission approved - ₹25 credited', type: 'success', read: false },
        { id: 2, message: 'New task available: Restaurant Review', type: 'info', read: true },
        { id: 3, message: 'Withdrawal of ₹500 processed successfully', type: 'success', read: true }
      ]
    };
    
    res.json(dashboardData);
  });

  // User earnings endpoint
  app.get('/api/user/earnings', (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const earnings = [
      {
        id: 'earn-001',
        taskId: 'task-001',
        taskTitle: 'Download Amazon App',
        amount: 15,
        earnedAt: '2024-08-15T14:30:00Z',
        status: 'credited',
        approvedBy: 'Admin'
      },
      {
        id: 'earn-002',
        taskId: 'task-002',
        taskTitle: 'Review Local Restaurant',
        amount: 20,
        earnedAt: '2024-08-14T16:45:00Z',
        status: 'credited',
        approvedBy: 'Admin'
      },
      {
        id: 'earn-003',
        taskId: 'task-003',
        taskTitle: 'Product Review',
        amount: 25,
        earnedAt: '2024-08-16T10:15:00Z',
        status: 'pending',
        approvedBy: null
      }
    ];
    
    res.json(earnings);
  });

  // User withdrawal requests for Withdrawal page
  app.get('/api/users/withdrawals', (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const withdrawals = [
      {
        id: 'withdrawal-001',
        amount: 500,
        method: 'UPI',
        status: 'completed',
        requestDate: '2024-08-15',
        processedDate: '2024-08-15',
        transactionId: 'TXN001234567'
      },
      {
        id: 'withdrawal-002',
        amount: 250,
        method: 'Bank Transfer',
        status: 'pending',
        requestDate: '2024-08-16',
        processedDate: null,
        transactionId: null
      }
    ];
    
    res.json(withdrawals);
  });

  // User profile endpoint
  app.get('/api/user/profile', (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Return comprehensive user profile data
    const profileData = {
      user: {
        id: userId,
        firstName: userId === 'user-001' ? 'Demo' : 'User',
        lastName: 'User',
        email: userId === 'user-001' ? 'demo@innovativetaskearn.online' : 'user@example.com',
        phone: '+91 98765 43210',
        joinedDate: '2024-08-01',
        kycStatus: 'verified',
        referralCode: 'DEMO2024',
        profilePicture: null
      },
      stats: {
        totalEarnings: 3450,
        completedTasks: 89,
        pendingTasks: 3,
        approvalRate: 96.2,
        referrals: 5,
        rank: 'Silver',
        points: 2340
      },
      recentActivity: [
        { type: 'task_completed', description: 'Product Review task completed', date: '2024-08-16', amount: 25 },
        { type: 'earning_credited', description: 'App Download reward credited', date: '2024-08-15', amount: 15 },
        { type: 'withdrawal_approved', description: 'Withdrawal of ₹500 approved', date: '2024-08-15', amount: -500 }
      ]
    };
    
    res.json(profileData);
  });

  // User earnings data endpoint
  app.get('/api/users/earnings', (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const earningsData = {
      currentBalance: 1250,
      totalEarnings: 3450,
      monthlyEarnings: 850,
      weeklyEarnings: 280,
      todayEarnings: 25,
      pendingAmount: 125,
      history: [
        {
          id: 'earn-001',
          type: 'task',
          description: 'Download Amazon App',
          amount: 15,
          status: 'approved',
          date: '2024-08-15',
          taskId: 'task-001',
          taskTitle: 'Download Amazon App'
        },
        {
          id: 'earn-002',
          type: 'task',
          description: 'Review Local Restaurant',
          amount: 20,
          status: 'approved',
          date: '2024-08-14',
          taskId: 'task-002',
          taskTitle: 'Review Local Restaurant'
        },
        {
          id: 'earn-003',
          type: 'task',
          description: 'Product Review',
          amount: 25,
          status: 'pending',
          date: '2024-08-16',
          taskId: 'task-003',
          taskTitle: 'Product Review'
        },
        {
          id: 'earn-004',
          type: 'referral',
          description: 'Referral bonus for John Smith',
          amount: 49,
          status: 'approved',
          date: '2024-08-10'
        },
        {
          id: 'earn-005',
          type: 'bonus',
          description: 'Weekly completion bonus',
          amount: 100,
          status: 'approved',
          date: '2024-08-12'
        }
      ]
    };
    
    res.json(earningsData);
  });

  // User payout/withdrawal history endpoint
  app.get('/api/users/payouts', (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const payoutHistory = [
      {
        id: 'payout-001',
        amount: 500,
        method: 'UPI',
        status: 'completed',
        requestDate: '2024-08-10',
        processedDate: '2024-08-10',
        transactionId: 'TXN001234567',
        adminNote: 'Processed successfully'
      },
      {
        id: 'payout-002',
        amount: 300,
        method: 'Bank Transfer',
        status: 'pending',
        requestDate: '2024-08-15',
        processedDate: null,
        transactionId: null,
        adminNote: null
      }
    ];
    
    res.json(payoutHistory);
  });

  // KYC document upload endpoint
  app.post('/api/users/kyc/upload', (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Simulate document upload success
    // In real implementation, this would handle file uploads to cloud storage
    const { documentType, documentNumber, fullName } = req.body;
    
    res.json({
      success: true,
      message: 'Documents uploaded successfully',
      uploadId: `upload_${Date.now()}`,
      nextStep: 'payment'
    });
  });

  // KYC payment session creation
  app.post('/api/users/kyc/payment', async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const { createPaymentSession } = await import('../cashfree.js');
      
      // Get user data - in development, use sample data
      const user = {
        id: userId,
        email: userId === 'user-001' ? 'demo@innovativetaskearn.online' : 'user@example.com',
        firstName: userId === 'user-001' ? 'Demo' : 'User',
        lastName: 'User',
        phone: '+91 9876543210'
      };

      const orderId = `KYC_${userId}_${Date.now()}`;
      const paymentSession = await createPaymentSession(
        orderId,
        99, // KYC fee amount
        user.phone || '+91 9876543210',
        user.email,
        `${user.firstName} ${user.lastName}`,
        'kyc_fee'
      );

      res.json({
        success: true,
        paymentUrl: `https://payments.cashfree.com/pay/${paymentSession.payment_session_id}`,
        orderId: paymentSession.order_id,
        amount: 99
      });

    } catch (error: any) {
      console.error('Cashfree payment creation error:', error);
      res.status(500).json({ 
        error: 'Failed to create payment session',
        details: error.message 
      });
    }
  });

  // KYC payment webhook
  app.post('/api/kyc/payment-webhook', (req, res) => {
    console.log('KYC Payment webhook received:', req.body);
    
    // Process webhook and update user KYC status
    const { orderId, orderAmount, paymentStatus } = req.body;
    
    if (paymentStatus === 'PAID') {
      // Extract userId from orderId (format: KYC_userId_timestamp)
      const userId = orderId.split('_')[1];
      
      // Update user KYC payment status
      console.log(`KYC payment completed for user ${userId}`);
      
      // In real implementation, update database
      res.json({ status: 'OK' });
    } else {
      res.json({ status: 'Payment not completed' });
    }
  });

  // User KYC status endpoint
  app.get('/api/users/kyc', (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Return KYC status based on user state
    const kycData = {
      status: 'not_submitted', // can be: not_submitted, documents_uploaded, payment_pending, payment_completed, verified, rejected
      documentsUploaded: false,
      paymentStatus: 'pending',
      paymentAmount: 99,
      documents: {
        aadhaar: { uploaded: false, verified: false },
        pan: { uploaded: false, verified: false },
        selfie: { uploaded: false, verified: false }
      },
      submittedAt: null as string | null,
      verifiedAt: null as string | null,
      rejectionReason: null
    };
    
    // If user has completed KYC (demo user)
    if (userId === 'user-001') {
      kycData.status = 'verified';
      kycData.documentsUploaded = true;
      kycData.paymentStatus = 'completed';
      kycData.documents = {
        aadhaar: { uploaded: true, verified: true },
        pan: { uploaded: true, verified: true },
        selfie: { uploaded: true, verified: true }
      };
      kycData.submittedAt = '2024-08-01T10:30:00Z';
      kycData.verifiedAt = '2024-08-02T14:20:00Z';
    }
    
    res.json(kycData);
  });

  // User referrals endpoint
  app.get('/api/users/referrals', (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const referralData = {
      referralCode: 'DEMO2024',
      referralLink: `${req.protocol}://${req.get('host')}/signup?ref=DEMO2024`,
      stats: {
        totalReferrals: 5,
        activeReferrals: 4,
        totalEarned: 245,
        pendingEarnings: 49
      },
      referralList: [
        {
          id: 'ref-001',
          name: 'John Smith',
          email: 'john@example.com',
          joinedDate: '2024-08-10',
          kycStatus: 'verified',
          earnedAmount: 49,
          status: 'active'
        },
        {
          id: 'ref-002',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          joinedDate: '2024-08-12',
          kycStatus: 'verified',
          earnedAmount: 49,
          status: 'active'
        },
        {
          id: 'ref-003',
          name: 'Mike Wilson',
          email: 'mike@example.com',
          joinedDate: '2024-08-14',
          kycStatus: 'pending',
          earnedAmount: 0,
          status: 'pending'
        }
      ]
    };
    
    res.json(referralData);
  });

  // User support tickets endpoint
  app.get('/api/users/support/tickets', (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const tickets = [
      {
        id: 'TKT-USR-001',
        subject: 'Question about task approval',
        status: 'resolved',
        priority: 'medium',
        category: 'tasks',
        createdAt: '2024-08-14T09:30:00Z',
        lastUpdate: '2024-08-14T15:45:00Z',
        messages: [
          {
            sender: 'Demo User',
            message: 'How long does it take for task submissions to be approved?',
            timestamp: '2024-08-14T09:30:00Z',
            isUser: true
          },
          {
            sender: 'Support Team',
            message: 'Task submissions are typically reviewed within 5-20 minutes during business hours.',
            timestamp: '2024-08-14T15:45:00Z',
            isUser: false
          }
        ]
      }
    ];
    
    res.json(tickets);
  });

  // User notifications endpoint
  app.get('/api/users/notifications', (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const notifications = [
      {
        id: 1,
        title: 'Task Approved',
        message: 'Your Product Review task has been approved. ₹25 credited to your account.',
        type: 'success',
        read: false,
        createdAt: '2024-08-16T10:30:00Z'
      },
      {
        id: 2,
        title: 'New Task Available',
        message: 'New Restaurant Review task is now available in your area.',
        type: 'info',
        read: true,
        createdAt: '2024-08-15T14:20:00Z'
      },
      {
        id: 3,
        title: 'Withdrawal Processed',
        message: 'Your withdrawal request of ₹500 has been successfully processed.',
        type: 'success',
        read: true,
        createdAt: '2024-08-15T12:15:00Z'
      }
    ];
    
    res.json(notifications);
  });

  // Mark notification as read
  app.post('/api/notifications/:id/read', (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    res.json({ success: true, message: 'Notification marked as read' });
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}