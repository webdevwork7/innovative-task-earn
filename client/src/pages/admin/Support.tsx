import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.tsx';
import { Button } from '../../components/ui/button.tsx';
import { Badge } from '../../components/ui/badge.tsx';
import { Input } from '../../components/ui/input.tsx';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  MessageSquare,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Send,
  Archive,
  Star,
  Reply,
  MoreVertical,
  MessageCircle,
  HelpCircle
} from 'lucide-react';

export default function AdminSupport() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Check admin access
  React.useEffect(() => {
    if (!user) {
      setLocation('/login');
    } else if (user.role !== 'admin') {
      setLocation('/users/dashboard');
    }
  }, [user, setLocation]);

  // Fetch support tickets
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['/api/admin/support/tickets', filterStatus],
    enabled: !!user && user.role === 'admin',
    initialData: [
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
      },
      {
        id: 'TKT-003',
        userId: 'user-003',
        userName: 'Mike Johnson',
        email: 'mike@example.com',
        subject: 'Referral bonus not credited',
        category: 'referrals',
        status: 'resolved',
        priority: 'low',
        createdAt: '2024-08-13T11:00:00',
        lastUpdated: '2024-08-13T15:30:00',
        messages: [
          {
            sender: 'Mike Johnson',
            message: 'My friend joined using my referral code but I didn\'t receive the bonus.',
            timestamp: '2024-08-13T11:00:00',
            isUser: true
          },
          {
            sender: 'Support Agent',
            message: 'The referral bonus has been credited to your account. Please check your earnings.',
            timestamp: '2024-08-13T15:30:00',
            isUser: false
          }
        ]
      }
    ]
  });

  // Live chat stats
  const liveChats = {
    active: 3,
    waiting: 5,
    avgResponseTime: '2 min',
    satisfaction: 4.5
  };

  // Filter tickets
  const filteredTickets = tickets.filter((ticket: any) => {
    const matchesSearch = ticket.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-100 text-blue-800">Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge>Normal</Badge>;
    }
  };

  const handleReply = () => {
    if (replyMessage.trim() && selectedTicket) {
      console.log('Sending reply:', replyMessage);
      setReplyMessage('');
      // API call to send reply
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
          <p className="text-gray-600 mt-2">
            Manage support tickets and live chat conversations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Open Tickets</p>
                  <p className="text-2xl font-bold">
                    {tickets.filter((t: any) => t.status === 'open').length}
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Chats</p>
                  <p className="text-2xl font-bold">{liveChats.active}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Response</p>
                  <p className="text-2xl font-bold">{liveChats.avgResponseTime}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Satisfaction</p>
                  <p className="text-2xl font-bold">⭐ {liveChats.satisfaction}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'open' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('open')}
                >
                  Open
                </Button>
                <Button
                  variant={filterStatus === 'in_progress' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('in_progress')}
                >
                  In Progress
                </Button>
                <Button
                  variant={filterStatus === 'resolved' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('resolved')}
                >
                  Resolved
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1">
            <Card className="h-[600px] overflow-hidden">
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-y-auto h-[520px]">
                  {filteredTickets.map((ticket: any) => (
                    <div
                      key={ticket.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedTicket?.id === ticket.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium text-gray-500">{ticket.id}</span>
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      <p className="font-medium text-sm mb-1">{ticket.subject}</p>
                      <p className="text-xs text-gray-600 mb-2">{ticket.userName}</p>
                      <div className="flex justify-between items-center">
                        {getStatusBadge(ticket.status)}
                        <span className="text-xs text-gray-500">
                          {new Date(ticket.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ticket Details */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] overflow-hidden">
              {selectedTicket ? (
                <>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedTicket.subject}</CardTitle>
                        <CardDescription>
                          {selectedTicket.userName} • {selectedTicket.email}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(selectedTicket.status)}
                        {getPriorityBadge(selectedTicket.priority)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Messages */}
                    <div className="h-[380px] overflow-y-auto p-4 space-y-4">
                      {selectedTicket.messages.map((msg: any, index: number) => (
                        <div
                          key={index}
                          className={`flex ${msg.isUser ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              msg.isUser
                                ? 'bg-gray-100 text-gray-900'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            <p className="text-xs font-medium mb-1">{msg.sender}</p>
                            <p className="text-sm">{msg.message}</p>
                            <p className={`text-xs mt-1 ${
                              msg.isUser ? 'text-gray-500' : 'text-blue-100'
                            }`}>
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reply Box */}
                    <div className="border-t p-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type your reply..."
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                        />
                        <Button onClick={handleReply}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm">
                          Mark Resolved
                        </Button>
                        <Button variant="outline" size="sm">
                          Assign
                        </Button>
                        <Button variant="outline" size="sm">
                          Escalate
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Select a ticket to view details</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}