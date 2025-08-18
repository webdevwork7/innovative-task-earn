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
  CreditCard,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  IndianRupee,
  AlertCircle,
  TrendingUp,
  Calendar,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu.tsx';

interface Payout {
  id: string;
  userId: string;
  userName: string;
  email: string;
  amount: number;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  method: 'upi' | 'bank' | 'paytm';
  upiId?: string;
  bankAccount?: string;
  ifscCode?: string;
}

export default function AdminPayouts() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch payouts
  const { data: payouts, isLoading } = useQuery({
    queryKey: ['/api/admin/payouts'],
    enabled: !!user && user.role === 'admin'
  });

  // Fetch payout stats
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/payouts/stats'],
    enabled: !!user && user.role === 'admin',
    initialData: {
      totalPending: 0,
      totalApproved: 0,
      pendingAmount: 0,
      approvedAmount: 0,
      todayRequests: 0,
      weeklyPaid: 0
    }
  });

  // Approve payout mutation
  const approveMutation = useMutation({
    mutationFn: async (payoutId: string) => {
      const response = await apiRequest('POST', `/api/admin/payouts/${payoutId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payouts'] });
      toast({
        title: 'Payout Approved',
        description: 'The payout has been approved successfully.'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to approve payout.',
        variant: 'destructive'
      });
    }
  });

  // Reject payout mutation
  const rejectMutation = useMutation({
    mutationFn: async (payoutId: string) => {
      const response = await apiRequest('POST', `/api/admin/payouts/${payoutId}/reject`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payouts'] });
      toast({
        title: 'Payout Rejected',
        description: 'The payout has been rejected.'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to reject payout.',
        variant: 'destructive'
      });
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

  const filteredPayouts = (payouts || []).filter((payout: Payout) => {
    const matchesSearch = 
      payout.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || payout.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      processing: 'outline'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      upi: 'bg-blue-100 text-blue-800',
      bank: 'bg-blue-50 text-blue-600',
      paytm: 'bg-blue-200 text-blue-900'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[method] || 'bg-white text-blue-500'}`}>
        {method.toUpperCase()}
      </span>
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 flex items-center">
            <CreditCard className="w-8 h-8 mr-3" />
            Manage Payouts
          </h1>
          <p className="text-blue-600 mt-2">
            Review and process user payout requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Pending Payouts</p>
                  <p className="text-2xl font-bold">{stats?.totalPending || 0}</p>
                  <p className="text-sm text-blue-500 mt-1">₹{stats?.pendingAmount || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Approved Today</p>
                  <p className="text-2xl font-bold">{stats?.totalApproved || 0}</p>
                  <p className="text-sm text-blue-500 mt-1">₹{stats?.approvedAmount || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Today's Requests</p>
                  <p className="text-2xl font-bold">{stats?.todayRequests || 0}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Weekly Paid</p>
                  <p className="text-2xl font-bold">₹{stats?.weeklyPaid || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
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
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="processing">Processing</option>
                </select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payouts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payout Requests</CardTitle>
            <CardDescription>
              Review and process pending payout requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredPayouts.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                <p className="text-blue-600">No payout requests found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">User</th>
                      <th className="text-left p-4">Amount</th>
                      <th className="text-left p-4">Method</th>
                      <th className="text-left p-4">Request Date</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayouts.map((payout: Payout) => (
                      <tr key={payout.id} className="border-b hover:bg-blue-50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{payout.userName}</p>
                            <p className="text-sm text-blue-600">{payout.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <IndianRupee className="w-4 h-4 mr-1" />
                            <span className="font-semibold">{payout.amount}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {getMethodBadge(payout.method)}
                          {payout.upiId && (
                            <p className="text-xs text-blue-500 mt-1">{payout.upiId}</p>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{new Date(payout.requestDate).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(payout.status)}
                        </td>
                        <td className="p-4">
                          {payout.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => approveMutation.mutate(payout.id)}
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectMutation.mutate(payout.id)}
                                disabled={rejectMutation.isPending}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                          {payout.status !== 'pending' && (
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}