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
  Users,
  UserPlus,
  Gift,
  TrendingUp,
  Search,
  Filter,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  XCircle,
  Clock,
  Share2,
  Link
} from 'lucide-react';

export default function AdminReferrals() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Check admin access
  React.useEffect(() => {
    if (!user) {
      setLocation('/login');
    } else if (user.role !== 'admin') {
      setLocation('/users/dashboard');
    }
  }, [user, setLocation]);

  // Fetch referral data
  const { data: referralData = {
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
      },
      {
        id: 3,
        referrerId: 'user-001',
        referrerName: 'John Doe',
        referrerEmail: 'john@example.com',
        referredId: 'user-103',
        referredName: 'Charlie Brown',
        referredEmail: 'charlie@example.com',
        referralCode: 'JOHN123',
        status: 'failed',
        bonusPaid: 0,
        joinedDate: '2024-08-12',
        kycStatus: 'rejected',
        failureReason: 'KYC verification failed'
      }
    ],
    topReferrers: [
      { name: 'John Doe', referrals: 45, earnings: 2205 },
      { name: 'Jane Smith', referrals: 38, earnings: 1862 },
      { name: 'Mike Johnson', referrals: 32, earnings: 1568 },
      { name: 'Sarah Williams', referrals: 28, earnings: 1372 },
      { name: 'Tom Brown', referrals: 24, earnings: 1176 }
    ]
  } } = useQuery({
    queryKey: ['/api/admin/referrals', filterStatus],
    enabled: !!user && user.role === 'admin'
  });

  // Filter referrals
  const filteredReferrals = referralData.referrals.filter((referral: any) => {
    const matchesSearch = 
      referral.referrerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referredName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referralCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || referral.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const approveReferral = (referralId: number) => {
    console.log('Approving referral:', referralId);
    // API call to approve referral
  };

  const rejectReferral = (referralId: number) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      console.log('Rejecting referral:', referralId, reason);
      // API call to reject referral
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
          <h1 className="text-3xl font-bold text-gray-900">Referral Management</h1>
          <p className="text-gray-600 mt-2">
            Track and manage referral program performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Referrals</p>
                  <p className="text-2xl font-bold">{referralData.stats.totalReferrals}</p>
                  <div className="flex items-center mt-1">
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">+12% this month</span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Successful</p>
                  <p className="text-2xl font-bold text-green-600">{referralData.stats.successfulReferrals}</p>
                  <p className="text-sm text-gray-500">{referralData.stats.averageConversion}% conversion</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{referralData.stats.pendingReferrals}</p>
                  <p className="text-sm text-gray-500">Awaiting KYC</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bonus Paid</p>
                  <p className="text-2xl font-bold">₹{referralData.stats.totalBonusPaid.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">₹49 per referral</p>
                </div>
                <Gift className="w-8 h-8 text-blue-600" />
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
                    placeholder="Search by name or referral code..."
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
                  variant={filterStatus === 'completed' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('completed')}
                >
                  Completed
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={filterStatus === 'failed' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('failed')}
                >
                  Failed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Referrals Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Referrals</CardTitle>
                <CardDescription>Track referral activity and bonuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-3 px-4">Referrer</th>
                        <th className="text-left py-3 px-4">Referred User</th>
                        <th className="text-left py-3 px-4">Code</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Bonus</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReferrals.map((referral: any) => (
                        <tr key={referral.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-sm">{referral.referrerName}</p>
                              <p className="text-xs text-gray-500">{referral.referrerEmail}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-sm">{referral.referredName}</p>
                              <p className="text-xs text-gray-500">{referral.referredEmail}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="font-mono">
                              {referral.referralCode}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(referral.status)}
                          </td>
                          <td className="py-3 px-4">
                            {referral.bonusPaid > 0 ? (
                              <span className="text-green-600 font-medium">₹{referral.bonusPaid}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {referral.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600"
                                  onClick={() => approveReferral(referral.id)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600"
                                  onClick={() => rejectReferral(referral.id)}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Referrers */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Top Referrers</CardTitle>
                <CardDescription>Highest performing referrers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referralData.topReferrers.map((referrer: any, index: number) => (
                    <div key={referrer.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{referrer.name}</p>
                          <p className="text-sm text-gray-500">{referrer.referrals} referrals</p>
                        </div>
                      </div>
                      <span className="font-medium">₹{referrer.earnings.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Top Referrer</span>
                      <span className="font-medium">
                        {referralData.stats.topReferrer.name} ({referralData.stats.topReferrer.count})
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Average per User</span>
                      <span className="font-medium">
                        {(referralData.stats.totalReferrals / 100).toFixed(1)} referrals
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Conversion Rate</span>
                      <span className="font-medium text-green-600">
                        {referralData.stats.averageConversion}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}