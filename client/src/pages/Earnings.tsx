import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { Alert, AlertDescription } from '../components/ui/alert.tsx';
import { useQuery } from '@tanstack/react-query';
import { 
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Wallet
} from 'lucide-react';

interface EarningRecord {
  id: string;
  type: 'task' | 'referral' | 'bonus';
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  taskId?: string;
  taskTitle?: string;
}

export default function Earnings() {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch earnings data
  const { data: earningsData, isLoading } = useQuery({
    queryKey: ['/api/users/earnings'],
    enabled: !!user
  });

  // Safe data access with defaults
  const safeEarningsData = {
    currentBalance: earningsData?.currentBalance || 0,
    totalEarnings: earningsData?.totalEarnings || 0,
    monthlyEarnings: earningsData?.monthlyEarnings || 0,
    weeklyEarnings: earningsData?.weeklyEarnings || 0,
    todayEarnings: earningsData?.todayEarnings || 0,
    pendingAmount: earningsData?.pendingAmount || 0,
    history: earningsData?.history || []
  };

  // Fetch payout history
  const { data: payoutHistory = [] } = useQuery({
    queryKey: ['/api/users/payouts'],
    enabled: !!user
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      approved: { variant: 'default', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      pending: { variant: 'secondary', icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
      rejected: { variant: 'destructive', icon: XCircle, className: 'bg-red-100 text-red-800' }
    };
    
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      task: 'bg-blue-100 text-blue-800',
      referral: 'bg-purple-100 text-purple-800',
      bonus: 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge className={variants[type] || 'bg-gray-100 text-gray-800'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  // Filter earnings history
  const filteredHistory = safeEarningsData.history.filter((earning: EarningRecord) => {
    if (filterType !== 'all' && earning.type !== filterType) return false;
    if (filterStatus !== 'all' && earning.status !== filterStatus) return false;
    return true;
  });

  // Calculate statistics
  const stats = {
    totalApproved: filteredHistory.filter((e: EarningRecord) => e.status === 'approved').length,
    totalPending: filteredHistory.filter((e: EarningRecord) => e.status === 'pending').length,
    totalRejected: filteredHistory.filter((e: EarningRecord) => e.status === 'rejected').length,
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading earnings...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Earnings</h1>
          <p className="text-gray-600 mt-2">Track your earnings and payout history</p>
        </div>

        {/* KYC Alert */}
        {user?.kycStatus !== 'verified' && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Complete KYC verification to enable withdrawals. 
              <a href="/kyc" className="font-medium underline ml-1">Complete KYC</a>
            </AlertDescription>
          </Alert>
        )}

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Balance</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{safeEarningsData.currentBalance}
                  </p>
                </div>
                <Wallet className="w-8 h-8 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Earnings</p>
                  <p className="text-2xl font-bold">₹{safeEarningsData.todayEarnings}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12% from yesterday
                  </p>
                </div>
                <ArrowUpRight className="w-8 h-8 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">₹{earningsData?.monthlyEarnings || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date().toLocaleString('default', { month: 'long' })}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Amount</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    ₹{earningsData?.pendingAmount || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Earnings History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Earnings History</CardTitle>
                  <div className="flex gap-2">
                    <select
                      className="text-sm border rounded-md px-3 py-1"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="task">Tasks</option>
                      <option value="referral">Referrals</option>
                      <option value="bonus">Bonus</option>
                    </select>
                    <select
                      className="text-sm border rounded-md px-3 py-1"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <IndianRupee className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No earnings history found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredHistory.slice(0, 10).map((earning: EarningRecord) => (
                      <div key={earning.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getTypeBadge(earning.type)}
                            {getStatusBadge(earning.status)}
                          </div>
                          <p className="font-medium text-gray-900">{earning.description}</p>
                          {earning.taskTitle && (
                            <p className="text-sm text-gray-600">Task: {earning.taskTitle}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(earning.date).toLocaleDateString()} at {new Date(earning.date).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${
                            earning.status === 'approved' ? 'text-green-600' : 
                            earning.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {earning.status === 'rejected' ? '-' : '+'}₹{earning.amount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {filteredHistory.length > 10 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" size="sm">
                      Load More
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Payout Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payout Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Minimum Payout</p>
                  <p className="font-semibold">₹500</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payout Schedule</p>
                  <p className="font-semibold">Every Tuesday</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Processing Time</p>
                  <p className="font-semibold">24-48 hours</p>
                </div>
                <Button 
                  className="w-full" 
                  disabled={earningsData?.currentBalance < 500 || user?.kycStatus !== 'verified'}
                >
                  <IndianRupee className="w-4 h-4 mr-2" />
                  Request Payout
                </Button>
                {earningsData?.currentBalance < 500 && (
                  <p className="text-xs text-gray-500 text-center">
                    You need ₹{500 - earningsData?.currentBalance} more to request payout
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Approved</span>
                  <span className="font-semibold text-green-600">{stats.totalApproved}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">{stats.totalPending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rejected</span>
                  <span className="font-semibold text-red-600">{stats.totalRejected}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Payouts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                {(!payoutHistory || payoutHistory.length === 0) ? (
                  <p className="text-sm text-gray-500 text-center py-4">No payouts yet</p>
                ) : (
                  <div className="space-y-3">
                    {payoutHistory.slice(0, 3).map((payout: any) => (
                      <div key={payout.id} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">₹{payout.amount}</p>
                          <p className="text-xs text-gray-500">{payout.date}</p>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Paid
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}