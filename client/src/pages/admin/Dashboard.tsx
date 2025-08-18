import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.tsx';
import { Button } from '../../components/ui/button.tsx';
import { Alert, AlertDescription } from '../../components/ui/alert.tsx';
import { useAuth } from '../../hooks/useAuth';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Users,
  DollarSign,
  ListTodo,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Activity,
  CreditCard,
  FileText,
  UserCheck,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [timeRange, setTimeRange] = useState('today');

  // Fetch admin stats from API - must be called before any returns
  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalUsers: number;
    activeUsers: number;
    totalEarnings?: number;
    pendingPayouts: number;
    completedTasks: number;
    pendingTasks?: number;
    todayEarnings: number;
    weeklyEarnings: number;
    totalTasks: number;
    totalPayoutAmount: number;
  }>({
    queryKey: ['/api/admin/stats'],
    enabled: !!user && user.role === 'admin'
  });

  // Check admin access with useEffect to avoid render-time updates
  React.useEffect(() => {
    if (!user) {
      setLocation('/login');
    } else if (user.role !== 'admin') {
      setLocation('/users/dashboard');
    }
  }, [user, setLocation]);

  // Show loading while checking auth
  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  // Don't render admin content for non-admin users
  if (user.role !== 'admin') {
    return null;
  }

  // Default stats if data is loading
  const displayStats = {
    totalUsers: stats?.totalUsers || 0,
    activeUsers: stats?.activeUsers || 0,
    totalEarnings: stats?.totalEarnings || 0,
    pendingPayouts: stats?.pendingPayouts || 0,
    completedTasks: stats?.completedTasks || 0,
    pendingTasks: stats?.pendingTasks || 0,
    todayEarnings: stats?.todayEarnings || 0,
    weeklyEarnings: stats?.weeklyEarnings || 0,
    totalTasks: stats?.totalTasks || 0,
    totalPayoutAmount: stats?.totalPayoutAmount || 0
  };

  const recentActivities = [
    { type: 'user', message: 'New user registered: John Doe', time: '5 minutes ago', icon: UserCheck },
    { type: 'task', message: 'Task #12345 approved', time: '10 minutes ago', icon: CheckCircle },
    { type: 'payment', message: 'Payout of ₹5,000 processed', time: '15 minutes ago', icon: CreditCard },
    { type: 'kyc', message: 'KYC verification completed for user #567', time: '20 minutes ago', icon: FileText },
    { type: 'alert', message: 'Suspicious activity detected for user #890', time: '30 minutes ago', icon: AlertCircle }
  ];

  const pendingActions = [
    { title: '45 KYC Verifications', description: 'Pending document reviews', action: '/admin/kyc' },
    { title: '123 Task Approvals', description: 'Tasks awaiting verification', action: '/admin/tasks' },
    { title: '23 Payout Requests', description: 'Users requesting withdrawal', action: '/admin/payouts' },
    { title: '12 Support Tickets', description: 'Unresolved user inquiries', action: '/admin/support' }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.firstName}. Here's what's happening on your platform.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex space-x-2 mb-6">
          {['today', 'week', 'month', 'year'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Total Users</p>
                  <p className="text-2xl font-bold">{displayStats.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <ArrowUp className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-sm text-blue-500">+12% this week</span>
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
                  <p className="text-sm text-blue-600">Total Earnings</p>
                  <p className="text-2xl font-bold">₹{displayStats.weeklyEarnings.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-sm text-blue-500">₹{displayStats.todayEarnings} today</span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Completed Tasks</p>
                  <p className="text-2xl font-bold">{displayStats.completedTasks.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <Activity className="w-4 h-4 text-blue-600 mr-1" />
                    <span className="text-sm text-blue-600">{displayStats.totalTasks} total</span>
                  </div>
                </div>
                <ListTodo className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Pending Payouts</p>
                  <p className="text-2xl font-bold">₹{displayStats.totalPayoutAmount.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="w-4 h-4 text-blue-400 mr-1" />
                    <span className="text-sm text-blue-400">{displayStats.pendingPayouts} requests</span>
                  </div>
                </div>
                <CreditCard className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'alert' ? 'bg-blue-200' :
                        activity.type === 'payment' ? 'bg-blue-100' :
                        activity.type === 'task' ? 'bg-blue-50' :
                        'bg-white border border-blue-200'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          activity.type === 'alert' ? 'text-blue-700' :
                          activity.type === 'payment' ? 'text-blue-600' :
                          activity.type === 'task' ? 'text-blue-500' :
                          'text-blue-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-blue-400">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Activity
              </Button>
            </CardContent>
          </Card>

          {/* Pending Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Actions</CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingActions.map((action, index) => (
                  <Link key={index} href={action.action} className="block p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{action.title}</p>
                        <p className="text-sm text-blue-400">{action.description}</p>
                      </div>
                      <AlertCircle className="w-5 h-5 text-blue-500" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/tasks">
                <Button variant="outline" className="w-full">
                  <ListTodo className="w-4 h-4 mr-2" />
                  Manage Tasks
                </Button>
              </Link>
              <Link href="/admin/payouts">
                <Button variant="outline" className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Process Payouts
                </Button>
              </Link>
              <Link href="/admin/reports">
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Alert className="mt-8 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>System Status:</strong> All systems operational. Platform is running smoothly.
          </AlertDescription>
        </Alert>
      </div>
    </Layout>
  );
}