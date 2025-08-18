import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.tsx';
import { Button } from '../../components/ui/button.tsx';
import { Badge } from '../../components/ui/badge.tsx';
import { Input } from '../../components/ui/input.tsx';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../hooks/use-toast';
import { apiRequest } from '../../lib/queryClient';
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Building,
  User,
  FileText,
  Trash2,
  Reply
} from 'lucide-react';

interface Inquiry {
  id: string;
  type: 'advertiser' | 'contact' | 'support';
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  category?: string;
  budget?: number;
}

export default function AdminInquiries() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Fetch inquiries
  const { data: inquiries, isLoading } = useQuery({
    queryKey: ['/api/admin/inquiries'],
    enabled: !!user && user.role === 'admin',
    initialData: [
      {
        id: '1',
        type: 'advertiser',
        name: 'Tech Corp',
        email: 'marketing@techcorp.com',
        phone: '+91 98765 43210',
        company: 'Tech Corp Ltd',
        subject: 'App Download Campaign',
        message: 'We want to run an app download campaign for our new mobile app. Looking for 10,000+ downloads with genuine users.',
        status: 'new',
        priority: 'high',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        category: 'app_download',
        budget: 50000
      },
      {
        id: '2',
        type: 'contact',
        name: 'John Smith',
        email: 'john@example.com',
        subject: 'Payment Issue',
        message: 'I have completed tasks worth ₹500 but unable to withdraw. My KYC is verified. Please help.',
        status: 'in_progress',
        priority: 'medium',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        type: 'advertiser',
        name: 'E-Commerce Plus',
        email: 'ads@ecomplus.com',
        phone: '+91 88888 99999',
        company: 'E-Commerce Plus',
        subject: 'Product Review Campaign',
        message: 'Need genuine product reviews for our new product line. Budget flexible based on volume.',
        status: 'resolved',
        priority: 'medium',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'product_review',
        budget: 25000
      }
    ]
  });

  // Update inquiry status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/inquiries/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/inquiries'] });
      toast({
        title: 'Status Updated',
        description: 'Inquiry status has been updated successfully.'
      });
    }
  });

  // Delete inquiry
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin/inquiries/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/inquiries'] });
      toast({
        title: 'Inquiry Deleted',
        description: 'The inquiry has been deleted.'
      });
      setSelectedInquiry(null);
    }
  });

  // Check admin access
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      setLocation('/dashboard');
    }
  }, [user, setLocation]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const filteredInquiries = (inquiries || []).filter((inquiry: Inquiry) => {
    const matchesSearch = 
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || inquiry.type === filterType;
    const matchesStatus = filterStatus === 'all' || inquiry.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      new: 'destructive',
      in_progress: 'secondary',
      resolved: 'default'
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

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      advertiser: Building,
      contact: User,
      support: MessageSquare
    };
    return icons[type] || MessageSquare;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 flex items-center">
            <MessageSquare className="w-8 h-8 mr-3" />
            Manage Inquiries
          </h1>
          <p className="text-blue-600 mt-2">
            Review and respond to advertiser and contact inquiries
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">New Inquiries</p>
                  <p className="text-2xl font-bold">
                    {inquiries?.filter((i: Inquiry) => i.status === 'new').length || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Advertiser Inquiries</p>
                  <p className="text-2xl font-bold">
                    {inquiries?.filter((i: Inquiry) => i.type === 'advertiser').length || 0}
                  </p>
                </div>
                <Building className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">In Progress</p>
                  <p className="text-2xl font-bold">
                    {inquiries?.filter((i: Inquiry) => i.status === 'in_progress').length || 0}
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
                  <p className="text-sm text-blue-600">Resolved</p>
                  <p className="text-2xl font-bold">
                    {inquiries?.filter((i: Inquiry) => i.status === 'resolved').length || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                  <Input
                    placeholder="Search by name, email, or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="advertiser">Advertisers</option>
                  <option value="contact">Contact</option>
                  <option value="support">Support</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inquiries List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Inquiries</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredInquiries.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                    <p className="text-blue-600">No inquiries found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredInquiries.map((inquiry: Inquiry) => {
                      const TypeIcon = getTypeIcon(inquiry.type);
                      return (
                        <div
                          key={inquiry.id}
                          className={`border rounded-lg p-4 hover:bg-blue-50 cursor-pointer transition-colors ${
                            selectedInquiry?.id === inquiry.id ? 'bg-blue-50 border-blue-400' : ''
                          }`}
                          onClick={() => setSelectedInquiry(inquiry)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <TypeIcon className="w-5 h-5 text-blue-600 mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{inquiry.name}</h3>
                                  {getPriorityBadge(inquiry.priority)}
                                  {getStatusBadge(inquiry.status)}
                                </div>
                                <p className="text-sm text-blue-600">{inquiry.email}</p>
                                <p className="font-medium mt-1">{inquiry.subject}</p>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {inquiry.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {new Date(inquiry.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Inquiry Details */}
          <div className="lg:col-span-1">
            {selectedInquiry ? (
              <Card>
                <CardHeader>
                  <CardTitle>Inquiry Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-blue-600">Type</p>
                    <p className="font-medium capitalize">{selectedInquiry.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Name</p>
                    <p className="font-medium">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Email</p>
                    <p className="font-medium">{selectedInquiry.email}</p>
                  </div>
                  {selectedInquiry.phone && (
                    <div>
                      <p className="text-sm text-blue-600">Phone</p>
                      <p className="font-medium">{selectedInquiry.phone}</p>
                    </div>
                  )}
                  {selectedInquiry.company && (
                    <div>
                      <p className="text-sm text-blue-600">Company</p>
                      <p className="font-medium">{selectedInquiry.company}</p>
                    </div>
                  )}
                  {selectedInquiry.budget && (
                    <div>
                      <p className="text-sm text-blue-600">Budget</p>
                      <p className="font-medium">₹{selectedInquiry.budget}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-blue-600">Subject</p>
                    <p className="font-medium">{selectedInquiry.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Message</p>
                    <p className="text-gray-700">{selectedInquiry.message}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Status</p>
                    <div className="mt-2 space-y-2">
                      <select
                        value={selectedInquiry.status}
                        onChange={(e) => updateStatusMutation.mutate({
                          id: selectedInquiry.id,
                          status: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-md"
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">
                      <Reply className="w-4 h-4 mr-2" />
                      Reply
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => deleteMutation.mutate(selectedInquiry.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Eye className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                  <p className="text-blue-600">Select an inquiry to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}