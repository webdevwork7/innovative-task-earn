// Live chat system implementation with development mode fallbacks
import { type Express } from "express";
import { isDevelopment, config } from "./config";

// Sample data for development mode
const sampleFaqCategories = [
  { id: "faq-cat-1", name: "Getting Started", description: "Basic questions about using the platform" },
  { id: "faq-cat-2", name: "Tasks & Earnings", description: "Questions about completing tasks and earning money" },
  { id: "faq-cat-3", name: "KYC & Payments", description: "Questions about verification and withdrawals" },
  { id: "faq-cat-4", name: "Account Issues", description: "Help with account problems and suspension" },
];

// FAQ matching keywords for intelligent responses
const faqKeywords = {
  "faq-1": ["start", "started", "begin", "beginning", "new", "signup", "sign up", "register"],
  "faq-2": ["free", "cost", "price", "payment", "charge", "money"],
  "faq-3": ["earn", "earning", "money", "payment", "task", "reward", "amount"],
  "faq-4": ["approval", "approve", "review", "time", "wait", "long", "minutes"],
  "faq-5": ["kyc", "verification", "verify", "99", "fee", "pay", "why"],
  "faq-6": ["payout", "withdrawal", "withdraw", "when", "tuesday", "process"],
  "faq-7": ["suspend", "suspended", "reactivate", "blocked", "ban", "49"]
};

const sampleFaqs = [
  {
    id: "faq-1",
    categoryId: "faq-cat-1",
    question: "How do I get started on Innovative Task Earn?",
    answer: "Sign up for a free account, verify your email, complete your profile, and start completing tasks to earn money instantly.",
    helpful: 15,
    notHelpful: 2,
    views: 120
  },
  {
    id: "faq-2", 
    categoryId: "faq-cat-1",
    question: "Is Innovative Task Earn free to use?",
    answer: "Yes! Creating an account and completing tasks is completely free. You only pay ₹99 for KYC processing to unlock withdrawals.",
    helpful: 22,
    notHelpful: 1,
    views: 98
  },
  {
    id: "faq-3",
    categoryId: "faq-cat-2", 
    question: "How much can I earn per task?",
    answer: "Task earnings vary by category: App Downloads (₹12-25), Business Reviews (₹22-35), Product Reviews (₹20-40), Channel Subscribe (₹12-20), Comments & Likes (₹8-15), YouTube Video View (₹18-30).",
    helpful: 31,
    notHelpful: 3,
    views: 156
  },
  {
    id: "faq-4",
    categoryId: "faq-cat-2",
    question: "How long does it take to get task approval?",
    answer: "Most tasks are reviewed and approved within 5-20 minutes after submission. Our admin team reviews proof submissions quickly.",
    helpful: 18,
    notHelpful: 1,
    views: 87
  },
  {
    id: "faq-5",
    categoryId: "faq-cat-3",
    question: "Why do I need to pay ₹99 for KYC?",
    answer: "The ₹99 KYC fee covers identity verification processing, compliance costs, and payment gateway fees. This is required by law for financial platforms in India.",
    helpful: 12,
    notHelpful: 8,
    views: 203
  },
  {
    id: "faq-6",
    categoryId: "faq-cat-3",
    question: "When are payouts processed?",
    answer: "Payouts are processed every Tuesday in weekly batches. You need completed KYC and minimum ₹500 balance to request withdrawal.",
    helpful: 25,
    notHelpful: 2,
    views: 134
  },
  {
    id: "faq-7",
    categoryId: "faq-cat-4",
    question: "My account is suspended. How do I reactivate it?",
    answer: "Suspended accounts can be reactivated by paying a ₹49 reactivation fee. This covers account review and reinstatement processing.",
    helpful: 8,
    notHelpful: 3,
    views: 67
  }
];

const sampleSupportTeam = [
  { id: "agent-1", name: "Priya Sharma", email: "priya@innovativetaskearn.online", role: "agent", isActive: true },
  { id: "agent-2", name: "Rahul Patel", email: "rahul@innovativetaskearn.online", role: "supervisor", isActive: true },
  { id: "agent-3", name: "Anita Singh", email: "anita@innovativetaskearn.online", role: "agent", isActive: false },
];

// In-memory storage for development mode
const chatSessions = new Map<string, any>();
const chatMessages = new Map<string, any[]>();

// Function to find matching FAQ based on user message
function findMatchingFaq(userMessage: string) {
  const messageLower = userMessage.toLowerCase();
  const words = messageLower.split(/\s+/);
  
  let bestMatch = null;
  let highestScore = 0;
  
  // Check each FAQ for keyword matches
  for (const [faqId, keywords] of Object.entries(faqKeywords)) {
    let score = 0;
    
    // Count matching keywords
    for (const keyword of keywords) {
      if (messageLower.includes(keyword.toLowerCase())) {
        score += keyword.length; // Longer keywords get higher scores
      }
    }
    
    // Also check if question words match
    const faq = sampleFaqs.find(f => f.id === faqId);
    if (faq) {
      const questionWords = faq.question.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (questionWords.includes(word) && word.length > 3) {
          score += 2; // Bonus for question word matches
        }
      }
    }
    
    if (score > highestScore && score > 2) { // Minimum threshold
      highestScore = score;
      bestMatch = faq;
    }
  }
  
  return bestMatch;
}

// Function to generate automatic FAQ response
function generateFaqResponse(faq: any, userMessage: string) {
  return {
    message: `🤖 I found this answer in our FAQ:\n\n**${faq.question}**\n\n${faq.answer}\n\n---\n\nDid this answer your question? If you need more help, I can transfer you to our support team.`,
    isAutoResponse: true,
    matchedFaq: faq,
    originalQuestion: userMessage
  };
}

export function registerLiveChatRoutes(app: Express) {
  // User-facing FAQ and chat routes
  
  // Get FAQ categories
  app.get("/api/faq-categories", async (req, res) => {
    try {
      // In development mode, return sample data
      res.json(sampleFaqCategories);
    } catch (error) {
      console.error("Error fetching FAQ categories:", error);
      res.status(500).json({ message: "Failed to fetch FAQ categories" });
    }
  });

  // Get FAQs
  app.get("/api/faqs", async (req, res) => {
    try {
      res.json(sampleFaqs);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });

  // Rate FAQ helpful/not helpful
  app.post("/api/faq-rating", async (req, res) => {
    try {
      const { faqId, helpful } = req.body;
      
      // In development mode, just return success
      const faq = sampleFaqs.find(f => f.id === faqId);
      if (faq) {
        if (helpful) {
          faq.helpful += 1;
        } else {
          faq.notHelpful += 1;
        }
      }
      
      res.json({ message: "Rating recorded" });
    } catch (error) {
      console.error("Error rating FAQ:", error);
      res.status(500).json({ message: "Failed to record rating" });
    }
  });

  // Get or create chat session for user
  app.get("/api/chat-session", async (req, res) => {
    const isAuthenticated = req.isAuthenticated() || (req.session?.userId);
    
    if (!isAuthenticated) {
      // Development fallback
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Chat session accessed without authentication, allowing access");
        // Create a demo chat session
        const demoSession = {
          id: "demo-chat-session-001",
          userId: "dev-demo-user",
          status: "waiting" as const,
          subject: "Demo Chat Session",
          startedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        };
        return res.json(demoSession);
      } else {
        return res.status(401).json({ message: "Authentication required" });
      }
    }

    try {
      const userId = (req.user as any).id;
      
      // Check for existing active session
      let session = null;
      for (const sess of chatSessions.values()) {
        if (sess.userId === userId && sess.status !== 'closed') {
          session = sess;
          break;
        }
      }
      
      // If no active session, don't auto-create one
      if (!session) {
        return res.json(null);
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error fetching chat session:", error);
      res.status(500).json({ message: "Failed to fetch chat session" });
    }
  });

  // Create new chat session
  app.post("/api/chat-session", async (req, res) => {
    const isAuthenticated = req.isAuthenticated() || (req.session?.userId);
    
    if (!isAuthenticated) {
      // Development fallback
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Chat session creation accessed without authentication, allowing access");
        const { subject = "Demo Support Request" } = req.body;
        
        // Create a demo chat session
        const demoSession = {
          id: "demo-chat-session-" + Date.now(),
          userId: "dev-demo-user",
          status: "waiting" as const,
          subject,
          startedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        };
        
        chatSessions.set(demoSession.id, demoSession);
        return res.json(demoSession);
      } else {
        return res.status(401).json({ message: "Authentication required" });
      }
    }

    try {
      const userId = (req.user as any).id;
      const { subject } = req.body;
      
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const session = {
        id: sessionId,
        userId,
        assignedAgentId: null,
        status: "waiting",
        priority: "normal",
        subject: subject || "General Support",
        startedAt: new Date(),
        lastActivity: new Date(),
        user: {
          id: userId,
          firstName: (req.user as any).firstName,
          lastName: (req.user as any).lastName,
        }
      };
      
      chatSessions.set(sessionId, session);
      chatMessages.set(sessionId, []);
      
      res.json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });

  // Get chat messages
  app.get("/api/chat-messages/:sessionId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { sessionId } = req.params;
      const messages = chatMessages.get(sessionId) || [];
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send chat message with intelligent FAQ matching
  app.post("/api/chat-message", async (req, res) => {
    const isAuthenticated = req.isAuthenticated() || (req.session?.userId);
    
    if (!isAuthenticated) {
      // Development fallback
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Chat message accessed without authentication, allowing access");
      } else {
        return res.status(401).json({ message: "Authentication required" });
      }
    }

    try {
      const { sessionId, message, faqId } = req.body;
      const userId = isAuthenticated ? (req.user as any)?.id || "dev-demo-user" : "dev-demo-user";
      
      // Create user message
      const userMessageObj = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        senderId: userId,
        senderType: faqId ? "faq" : "user",
        message,
        faqId,
        isRead: false,
        timestamp: new Date(),
      };
      
      const messages = chatMessages.get(sessionId) || [];
      messages.push(userMessageObj);
      
      // If this is a regular user message (not FAQ), check for intelligent FAQ match
      if (!faqId && message.trim().length > 5) {
        const matchedFaq = findMatchingFaq(message);
        
        if (matchedFaq) {
          // Generate automatic FAQ response
          const faqResponse = generateFaqResponse(matchedFaq, message);
          
          // Add FAQ bot response
          const botMessageObj = {
            id: `msg-${Date.now() + 1}-${Math.random().toString(36).substr(2, 9)}`,
            sessionId,
            senderId: "faq-bot",
            senderType: "faq",
            message: faqResponse.message,
            faqId: matchedFaq.id,
            isRead: false,
            timestamp: new Date(Date.now() + 100), // Slightly after user message
            isAutoResponse: true
          };
          
          messages.push(botMessageObj);
          
          console.log(`FAQ auto-response triggered for question: "${message}" -> FAQ: ${matchedFaq.id}`);
        } else {
          // No FAQ match found, suggest transfer to agent
          const noMatchResponse = {
            id: `msg-${Date.now() + 1}-${Math.random().toString(36).substr(2, 9)}`,
            sessionId,
            senderId: "faq-bot",
            senderType: "system",
            message: "🤖 I couldn't find a specific answer in our FAQ for your question. Would you like me to transfer you to our support team for personalized assistance?\n\n👥 Our agents are available to help with any questions not covered in our FAQ.",
            isRead: false,
            timestamp: new Date(Date.now() + 100),
            isAutoResponse: true,
            suggestTransfer: true
          };
          
          messages.push(noMatchResponse);
          console.log(`No FAQ match found for: "${message}", suggesting transfer to support`);
        }
      }
      
      chatMessages.set(sessionId, messages);
      
      // Update session last activity
      const session = chatSessions.get(sessionId);
      if (session) {
        session.lastActivity = new Date();
        chatSessions.set(sessionId, session);
      }
      
      res.json(userMessageObj);
    } catch (error) {
      console.error("Error sending chat message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Transfer to support agent
  app.post("/api/transfer-to-agent", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { sessionId } = req.body;
      
      const session = chatSessions.get(sessionId);
      if (session) {
        session.status = "waiting";
        session.priority = "high";
        session.lastActivity = new Date();
        chatSessions.set(sessionId, session);
        
        // Add system message
        const messages = chatMessages.get(sessionId) || [];
        messages.push({
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sessionId,
          senderId: "system",
          senderType: "system",
          message: "You have been transferred to our support team. An agent will assist you shortly.",
          isRead: false,
          timestamp: new Date(),
        });
        chatMessages.set(sessionId, messages);
      }
      
      res.json({ message: "Transferred to support team" });
    } catch (error) {
      console.error("Error transferring to agent:", error);
      res.status(500).json({ message: "Failed to transfer to agent" });
    }
  });

  // Admin routes for chat management
  
  // Get all chat sessions (admin)
  app.get("/api/admin/chat-sessions", async (req, res) => {
    try {
      const sessions = Array.from(chatSessions.values()).map(session => ({
        ...session,
        assignedAgent: session.assignedAgentId ? 
          sampleSupportTeam.find(agent => agent.id === session.assignedAgentId) : null,
      }));
      
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching admin chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  // Get support team (admin)
  app.get("/api/admin/support-team", async (req, res) => {
    try {
      res.json(sampleSupportTeam);
    } catch (error) {
      console.error("Error fetching support team:", error);
      res.status(500).json({ message: "Failed to fetch support team" });
    }
  });

  // Get FAQ categories (admin)
  app.get("/api/admin/faq-categories", async (req, res) => {
    try {
      res.json(sampleFaqCategories);
    } catch (error) {
      console.error("Error fetching admin FAQ categories:", error);
      res.status(500).json({ message: "Failed to fetch FAQ categories" });
    }
  });

  // Get FAQs (admin)
  app.get("/api/admin/faqs", async (req, res) => {
    try {
      res.json(sampleFaqs);
    } catch (error) {
      console.error("Error fetching admin FAQs:", error);
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });

  // Get chat statistics
  app.get("/api/admin/chat-stats", async (req, res) => {
    try {
      const totalChats = chatSessions.size;
      const waitingChats = Array.from(chatSessions.values()).filter(s => s.status === 'waiting').length;
      const activeChats = Array.from(chatSessions.values()).filter(s => s.status === 'active').length;
      const activeAgents = sampleSupportTeam.filter(agent => agent.isActive).length;
      
      res.json({
        totalChats,
        waitingChats, 
        activeChats,
        activeAgents,
      });
    } catch (error) {
      console.error("Error fetching chat stats:", error);
      res.status(500).json({ message: "Failed to fetch chat statistics" });
    }
  });

  // Assign chat session to agent
  app.post("/api/admin/assign-chat", async (req, res) => {
    try {
      const { sessionId, agentId } = req.body;
      
      const session = chatSessions.get(sessionId);
      if (session) {
        session.assignedAgentId = agentId;
        session.status = "active";
        session.assignedAt = new Date();
        session.lastActivity = new Date();
        chatSessions.set(sessionId, session);
        
        // Add system message
        const agent = sampleSupportTeam.find(a => a.id === agentId);
        const messages = chatMessages.get(sessionId) || [];
        messages.push({
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sessionId,
          senderId: "system",
          senderType: "system", 
          message: `${agent?.name || 'Support agent'} has joined the chat and will assist you.`,
          isRead: false,
          timestamp: new Date(),
        });
        chatMessages.set(sessionId, messages);
      }
      
      res.json({ message: "Chat assigned successfully" });
    } catch (error) {
      console.error("Error assigning chat:", error);
      res.status(500).json({ message: "Failed to assign chat" });
    }
  });

  // Send message as agent
  app.post("/api/admin/chat-message", async (req, res) => {
    try {
      const { sessionId, message } = req.body;
      
      const messageObj = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        senderId: "agent-1", // Default to first agent
        senderType: "agent",
        message,
        isRead: false,
        timestamp: new Date(),
      };
      
      const messages = chatMessages.get(sessionId) || [];
      messages.push(messageObj);
      chatMessages.set(sessionId, messages);
      
      // Update session last activity
      const session = chatSessions.get(sessionId);
      if (session) {
        session.lastActivity = new Date();
        chatSessions.set(sessionId, session);
      }
      
      res.json(messageObj);
    } catch (error) {
      console.error("Error sending agent message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Get messages for admin
  app.get("/api/admin/chat-messages/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = chatMessages.get(sessionId) || [];
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching admin chat messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Close chat session
  app.post("/api/admin/close-chat", async (req, res) => {
    try {
      const { sessionId } = req.body;
      
      const session = chatSessions.get(sessionId);
      if (session) {
        session.status = "closed";
        session.closedAt = new Date();
        session.lastActivity = new Date();
        chatSessions.set(sessionId, session);
        
        // Add system message
        const messages = chatMessages.get(sessionId) || [];
        messages.push({
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sessionId,
          senderId: "system",
          senderType: "system",
          message: "This chat session has been closed. Thank you for contacting support!",
          isRead: false,
          timestamp: new Date(),
        });
        chatMessages.set(sessionId, messages);
      }
      
      res.json({ message: "Chat closed successfully" });
    } catch (error) {
      console.error("Error closing chat:", error);
      res.status(500).json({ message: "Failed to close chat" });
    }
  });

  // Invite team member
  app.post("/api/admin/invite-support", async (req, res) => {
    try {
      const { name, email, role } = req.body;
      
      // In development mode, just simulate the invitation
      const newMember = {
        id: `agent-${Date.now()}`,
        name,
        email,
        role,
        isActive: true,
        lastActive: new Date(),
        createdAt: new Date(),
      };
      
      sampleSupportTeam.push(newMember);
      
      res.json({ message: "Team member invited successfully", member: newMember });
    } catch (error) {
      console.error("Error inviting team member:", error);
      res.status(500).json({ message: "Failed to invite team member" });
    }
  });

  // Create FAQ category
  app.post("/api/admin/faq-category", async (req, res) => {
    try {
      const { name, description } = req.body;
      
      const newCategory = {
        id: `faq-cat-${Date.now()}`,
        name,
        description,
        order: sampleFaqCategories.length,
        isActive: true,
        createdAt: new Date(),
      };
      
      sampleFaqCategories.push(newCategory);
      
      res.json(newCategory);
    } catch (error) {
      console.error("Error creating FAQ category:", error);
      res.status(500).json({ message: "Failed to create FAQ category" });
    }
  });

  // Create FAQ
  app.post("/api/admin/faq", async (req, res) => {
    try {
      const { categoryId, question, answer } = req.body;
      
      const newFaq = {
        id: `faq-${Date.now()}`,
        categoryId,
        question,
        answer,
        order: sampleFaqs.filter(f => f.categoryId === categoryId).length,
        isActive: true,
        views: 0,
        helpful: 0,
        notHelpful: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      sampleFaqs.push(newFaq);
      
      res.json(newFaq);
    } catch (error) {
      console.error("Error creating FAQ:", error);
      res.status(500).json({ message: "Failed to create FAQ" });
    }
  });

  // Update FAQ
  app.put("/api/admin/faq/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { question, answer } = req.body;
      
      const faq = sampleFaqs.find(f => f.id === id);
      if (faq) {
        faq.question = question;
        faq.answer = answer;
        (faq as any).updatedAt = new Date();
      }
      
      res.json(faq);
    } catch (error) {
      console.error("Error updating FAQ:", error);
      res.status(500).json({ message: "Failed to update FAQ" });
    }
  });
}