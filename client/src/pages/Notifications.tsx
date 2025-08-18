import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Button } from '../components/ui/button.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { useAuth } from '../hooks/useAuth.tsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  IndianRupee,
  Gift,
  UserCheck,
  FileText,
  Settings,
  Check,
  Trash2,
  Filter
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'task_approved' | 'task_rejected' | 'payout_processed' | 'referral_bonus' | 'kyc_update' | 'system' | 'announcement';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: {
    amount?: number;
    taskId?: string;
    referralName?: string;
  };
}

export default function Notifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState('all');

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    enabled: !!user,
    initialData: [
      {
        id: '1',
        type: 'task_approved',
        title: 'Task Approved!',
        message: 'Your submission for "Download Amazon App" has been approved. ₹15 credited to your account.',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        metadata: { amount: 15, taskId: 'task-1' }
      },
      {
        id: '2',
        type: 'referral_bonus',
        title: 'Referral Bonus Earned!',
        message: 'Your friend John Doe has completed KYC. You earned ₹49 referral bonus!',
        read: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        metadata: { amount: 49, referralName: 'John Doe' }
      },
      {
        id: '3',
        type: 'payout_processed',
        title: 'Payout Processed',
        message: 'Your withdrawal request of ₹250 has been processed successfully.',
        read: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { amount: 250 }
      },
      {
        id: '4',
        type: 'task_rejected',
        title: 'Task Rejected',
        message: 'Your submission for "Product Review" was rejected. Reason: Incomplete proof provided.',
        read: true,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { taskId: 'task-2' }
      },
      {
        id: '5',
        type: 'announcement',
        title: 'New Tasks Available!',
        message: 'Check out 10 new high-paying tasks added today. Earn up to ₹40 per task!',
        read: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiRequest('POST', `/api/notifications/${notificationId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/notifications/read-all');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: 'All Marked as Read',
        description: 'All notifications have been marked as read.'
      });
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiRequest('DELETE', `/api/notifications/${notificationId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: 'Notification Deleted',
        description: 'The notification has been deleted.'
      });
    }
  });

  // Clear all notifications mutation
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/notifications/clear-all');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: 'Notifications Cleared',
        description: 'All notifications have been cleared.'
      });
    }
  });

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, any> = {
      task_approved: CheckCircle,
      task_rejected: XCircle,
      payout_processed: IndianRupee,
      referral_bonus: Gift,
      kyc_update: UserCheck,
      system: Settings,
      announcement: Bell
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      task_approved: 'text-green-600 bg-green-50',
      task_rejected: 'text-red-600 bg-red-50',
      payout_processed: 'text-blue-600 bg-blue-50',
      referral_bonus: 'text-purple-600 bg-purple-50',
      kyc_update: 'text-yellow-600 bg-yellow-50',
      system: 'text-gray-600 bg-gray-50',
      announcement: 'text-indigo-600 bg-indigo-50'
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  const filteredNotifications = (notifications || []).filter((notification: Notification) => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !notification.read;
    return notification.type === filterType;
  });

  const unreadCount = (notifications || []).filter((n: Notification) => !n.read).length;

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-900 flex items-center">
                <Bell className="w-8 h-8 mr-3" />
                Notifications
              </h1>
              <p className="text-blue-600 mt-2">
                Stay updated with your activities and announcements
              </p>
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-blue-600 text-white">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
        </div>

        {/* Actions Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterType === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('unread')}
                >
                  Unread ({unreadCount})
                </Button>
                <Button
                  variant={filterType === 'task_approved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('task_approved')}
                >
                  Approved
                </Button>
                <Button
                  variant={filterType === 'task_rejected' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('task_rejected')}
                >
                  Rejected
                </Button>
                <Button
                  variant={filterType === 'payout_processed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('payout_processed')}
                >
                  Payouts
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Mark All Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearAllMutation.mutate()}
                  disabled={!notifications?.length || clearAllMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                <p className="text-blue-600">No notifications found</p>
                <p className="text-sm text-blue-500 mt-2">
                  {filterType === 'unread' ? 'All notifications are read' : 'You\'re all caught up!'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification: Notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClass = getNotificationColor(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-blue-50/30 transition-colors ${
                        !notification.read ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                {notification.title}
                                {!notification.read && (
                                  <Badge className="ml-2 bg-blue-600 text-white text-xs">New</Badge>
                                )}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              {notification.metadata?.amount && (
                                <div className="flex items-center mt-2 text-sm font-medium text-blue-700">
                                  <IndianRupee className="w-4 h-4 mr-1" />
                                  {notification.metadata.amount}
                                </div>
                              )}
                              <p className="text-xs text-gray-500 mt-2">
                                {formatTimeAgo(notification.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsReadMutation.mutate(notification.id)}
                                  disabled={markAsReadMutation.isPending}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotificationMutation.mutate(notification.id)}
                                disabled={deleteNotificationMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
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
    </Layout>
  );
}