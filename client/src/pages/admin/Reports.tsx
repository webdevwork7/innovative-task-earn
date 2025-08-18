import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.tsx';
import { Button } from '../../components/ui/button.tsx';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function AdminReports() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('overview');

  // Check admin access
  React.useEffect(() => {
    if (!user) {
      setLocation('/login');
    } else if (user.role !== 'admin') {
      setLocation('/users/dashboard');
    }
  }, [user, setLocation]);

  // Fetch report data
  const { data: reportData = {
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
  } } = useQuery({
    queryKey: ['/api/admin/reports', dateRange, reportType],
    enabled: !!user && user.role === 'admin'
  });

  const exportReport = (format: string) => {
    console.log(`Exporting report as ${format}`);
    // Implement export functionality
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive platform analytics and performance metrics
          </p>
        </div>

        {/* Date Range and Export */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex gap-2">
            {['today', 'week', 'month', 'year'].map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportReport('excel')}>
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{reportData.revenue.total.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">+{reportData.revenue.growth}%</span>
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
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold">{reportData.users.active}</p>
                  <div className="flex items-center mt-1">
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">+{reportData.users.growth}%</span>
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
                  <p className="text-sm text-gray-600">Task Completion</p>
                  <p className="text-2xl font-bold">{reportData.tasks.completionRate}%</p>
                  <p className="text-sm text-gray-500">{reportData.tasks.completed} completed</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Payouts</p>
                  <p className="text-2xl font-bold">₹{reportData.payouts.total.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{reportData.payouts.processed} processed</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue progression</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {reportData.revenue.chart.map((value: number, index: number) => (
                  <div
                    key={index}
                    className="flex-1 bg-blue-600 rounded-t"
                    style={{ height: `${(value / Math.max(...reportData.revenue.chart)) * 100}%` }}
                  >
                    <div className="text-xs text-center text-white mt-2">
                      ₹{(value / 1000).toFixed(0)}k
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Task Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Task Categories Performance</CardTitle>
              <CardDescription>Tasks by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.taskCategories.map((category: any) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{category.category}</span>
                        <span className="text-sm text-gray-500">{category.count} tasks</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(category.count / 1234) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="ml-4 text-sm font-medium">₹{category.earnings.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Highest earning users this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.topPerformers.map((performer: any, index: number) => (
                  <div key={performer.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{performer.name}</p>
                        <p className="text-sm text-gray-500">{performer.tasks} tasks</p>
                      </div>
                    </div>
                    <span className="font-medium">₹{performer.earnings.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Referral Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Referral Program</CardTitle>
              <CardDescription>Referral performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Referrals</span>
                  <span className="font-medium">{reportData.referrals.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Successful Conversions</span>
                  <span className="font-medium">{reportData.referrals.successful}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Conversion Rate</span>
                  <span className="font-medium text-green-600">{reportData.referrals.conversionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Earnings</span>
                  <span className="font-medium">₹{reportData.referrals.earnings.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg. Bonus per Referral</span>
                    <span className="font-medium">₹49</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}