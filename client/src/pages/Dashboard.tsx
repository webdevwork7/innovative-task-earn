import React from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Button } from '../components/ui/button.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { WorkTimeDisplay } from '../components/WorkTimeDisplay';
import { 
  DollarSign, 
  ListTodo, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  Bell,
  ArrowRight,
  Star,
  Award
} from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  // Fetch user dashboard data
  const { data: dashboardData = {
    balance: 0,
    totalEarnings: 0,
    pendingTasks: 0,
    completedTasks: 0,
    referrals: 0,
    recentEarnings: [],
    notifications: []
  } } = useQuery({
    queryKey: ['/api/user/dashboard'],
    enabled: !!user && user.role !== 'admin',
    initialData: {
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
    }
  });

  if (!user || user.role === 'admin') {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your earning progress and latest updates
          </p>
        </div>

        {/* Work Time Display for Verified Users */}
        {user?.kycStatus === 'verified' && (
          <div className="mb-6">
            <WorkTimeDisplay userId={user.id} />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Available Balance</p>
                  <p className="text-3xl font-bold">₹{dashboardData.balance.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-100" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">₹{dashboardData.totalEarnings.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Completed Tasks</p>
                  <p className="text-2xl font-bold">{dashboardData.completedTasks}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Active Referrals</p>
                  <p className="text-2xl font-bold">{dashboardData.referrals}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Earnings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Earnings</CardTitle>
                <CardDescription>Your latest approved task completions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentEarnings.map((earning: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Award className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{earning.task}</p>
                          <p className="text-sm text-gray-500">{earning.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+₹{earning.amount}</p>
                        <Badge className="bg-green-100 text-green-800">Credited</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button onClick={() => setLocation('/earnings')} className="w-full" variant="outline">
                    View All Earnings
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Notifications */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => setLocation('/tasks')} className="w-full">
                  <ListTodo className="w-4 h-4 mr-2" />
                  Browse Tasks
                </Button>
                <Button onClick={() => setLocation('/withdrawal')} variant="outline" className="w-full">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Request Withdrawal
                </Button>
                <Button onClick={() => setLocation('/referrals')} variant="outline" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Invite Friends
                </Button>
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.notifications.slice(0, 3).map((notification: any) => (
                    <div key={notification.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm">{notification.message}</p>
                        {!notification.read && (
                          <Badge variant="outline" className="mt-1 text-xs">New</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button onClick={() => setLocation('/notifications')} variant="outline" className="w-full">
                    <Bell className="w-4 h-4 mr-2" />
                    View All Notifications
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tasks Pending</span>
                    <span className="font-medium">{dashboardData.pendingTasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approval Rate</span>
                    <span className="font-medium text-green-600">96%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-medium">₹450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rank</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="font-medium">Silver</span>
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