import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Button } from '../components/ui/button.tsx';
import { Input } from '../components/ui/input.tsx';
import { Label } from '../components/ui/label.tsx';
import { Alert, AlertDescription } from '../components/ui/alert.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { useAuth } from '../hooks/useAuth.tsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import {
  MessageCircle,
  Send,
  Search,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  FileText,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Users,
  CreditCard,
  Shield,
  Zap
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  lastUpdate: string;
}

export default function Support() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketCategory, setTicketCategory] = useState('general');

  // FAQ Data
  const faqCategories = [
    { id: 'all', name: 'All Topics', icon: BookOpen },
    { id: 'getting_started', name: 'Getting Started', icon: Zap },
    { id: 'tasks', name: 'Tasks & Earnings', icon: CreditCard },
    { id: 'payments', name: 'Payments & KYC', icon: Shield },
    { id: 'account', name: 'Account & Security', icon: Users }
  ];

  const faqs: FAQItem[] = [
    {
      id: '1',
      category: 'getting_started',
      question: 'How do I start earning on Innovative Task Earn?',
      answer: 'To start earning, simply sign up for an account, complete your profile, and browse available tasks. Select tasks that interest you, complete them according to the requirements, and submit proof. Once approved, earnings will be credited to your account.'
    },
    {
      id: '2',
      category: 'tasks',
      question: 'How long does task approval take?',
      answer: 'Task approvals typically take 5-20 minutes. Our admin team reviews submissions promptly to ensure quick earnings credit. Complex tasks may take slightly longer for thorough verification.'
    },
    {
      id: '3',
      category: 'payments',
      question: 'What is KYC and why is it required?',
      answer: 'KYC (Know Your Customer) is a one-time verification process required for withdrawals. It helps us ensure secure payments and prevent fraud. The process involves uploading your ID proof and paying a one-time fee of ₹99.'
    },
    {
      id: '4',
      category: 'payments',
      question: 'When are payouts processed?',
      answer: 'Payouts are processed every Tuesday. Make sure to submit your withdrawal request before Monday midnight to be included in the current week\'s batch. Minimum withdrawal amount is ₹100.'
    },
    {
      id: '5',
      category: 'tasks',
      question: 'What types of tasks are available?',
      answer: 'We offer 6 task categories: App Downloads (₹5-25), Business Reviews (₹5-35), Product Reviews (₹5-40), Channel Subscribe (₹5-20), Comments & Likes (₹5-15), and YouTube Video Views (₹5-30).'
    },
    {
      id: '6',
      category: 'account',
      question: 'How does the referral program work?',
      answer: 'Share your unique referral code with friends. When they sign up and complete KYC verification, you earn ₹49 as a referral bonus. There\'s no limit to how many people you can refer!'
    },
    {
      id: '7',
      category: 'payments',
      question: 'What payment methods are supported for withdrawal?',
      answer: 'We support UPI and bank transfer for withdrawals. Simply add your payment details in the withdrawal section and submit your request. Payments are processed within 24-48 hours after approval.'
    },
    {
      id: '8',
      category: 'account',
      question: 'Why was my account suspended?',
      answer: 'Accounts may be suspended for violating terms of service, submitting fake proofs, or suspicious activity. If you believe this was an error, please contact support with your account details.'
    }
  ];

  // Fetch user tickets
  const { data: tickets } = useQuery({
    queryKey: ['/api/support/tickets'],
    enabled: !!user,
    initialData: []
  });

  // Submit ticket mutation
  const submitTicketMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/support/tickets', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      toast({
        title: 'Ticket Submitted',
        description: 'Your support ticket has been submitted. We\'ll respond within 24 hours.'
      });
      setShowTicketForm(false);
      setTicketSubject('');
      setTicketMessage('');
    },
    onError: () => {
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit ticket. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticketSubject || !ticketMessage) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both subject and message.',
        variant: 'destructive'
      });
      return;
    }

    submitTicketMutation.mutate({
      subject: ticketSubject,
      message: ticketMessage,
      category: ticketCategory
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      open: 'secondary',
      in_progress: 'outline',
      resolved: 'default',
      closed: 'default'
    };
    return <Badge variant={variants[status] || 'outline'}>{status.replace('_', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority}
      </span>
    );
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 flex items-center">
            <HelpCircle className="w-8 h-8 mr-3" />
            Help & Support
          </h1>
          <p className="text-blue-600 mt-2">
            Find answers to common questions or contact our support team
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">Email Support</p>
                  <p className="text-sm text-blue-600">support@innovativetaskearn.online</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">Live Chat</p>
                  <p className="text-sm text-blue-600">Available 9 AM - 6 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">Response Time</p>
                  <p className="text-sm text-blue-600">Within 24 hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Find quick answers to common questions</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                  <Input
                    placeholder="Search FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {faqCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <category.icon className="w-4 h-4 mr-1" />
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* FAQ Items */}
            <div className="space-y-3">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                  <p className="text-blue-600">No FAQs found matching your search</p>
                </div>
              ) : (
                filteredFAQs.map((faq) => (
                  <div key={faq.id} className="border rounded-lg">
                    <button
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center justify-between"
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    >
                      <span className="font-medium">{faq.question}</span>
                      {expandedFAQ === faq.id ? (
                        <ChevronDown className="w-5 h-5 text-blue-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-blue-500" />
                      )}
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-4 py-3 border-t bg-blue-50/50">
                        <p className="text-gray-700">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Support Tickets */}
        {user && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Support Tickets</CardTitle>
                  <CardDescription>Track your support requests</CardDescription>
                </div>
                <Button onClick={() => setShowTicketForm(!showTicketForm)}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  New Ticket
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* New Ticket Form */}
              {showTicketForm && (
                <form onSubmit={handleTicketSubmit} className="mb-6 p-4 border rounded-lg bg-blue-50/30">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="payment">Payment Issue</option>
                        <option value="task">Task Problem</option>
                        <option value="account">Account Issue</option>
                        <option value="technical">Technical Support</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        type="text"
                        placeholder="Brief description of your issue"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        className="mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <textarea
                        id="message"
                        rows={4}
                        placeholder="Provide details about your issue..."
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={submitTicketMutation.isPending}>
                        {submitTicketMutation.isPending ? 'Submitting...' : 'Submit Ticket'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowTicketForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {/* Tickets List */}
              {tickets && tickets.length > 0 ? (
                <div className="space-y-4">
                  {(tickets as Ticket[]).map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4 hover:bg-blue-50/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{ticket.subject}</h3>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(ticket.priority)}
                          {getStatusBadge(ticket.status)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        <span>Last Update: {new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                  <p className="text-blue-600">No support tickets yet</p>
                  <p className="text-sm text-blue-500 mt-2">
                    Click "New Ticket" to submit a support request
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}