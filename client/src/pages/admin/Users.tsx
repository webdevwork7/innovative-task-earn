import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.tsx';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Label } from '../../components/ui/label.tsx';
import { Badge } from '../../components/ui/badge.tsx';
import { Alert, AlertDescription } from '../../components/ui/alert.tsx';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'wouter';
import { useToast } from '../../hooks/use-toast';
import { 
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Ban,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu.tsx';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended' | 'pending';
  kycStatus: 'verified' | 'pending' | 'rejected' | 'none';
  earnings: number;
  referrals: number;
  joinedDate: string;
  lastActive: string;
}

export default function AdminUsers() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Check admin access with useEffect to avoid render-time updates
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      setLocation('/dashboard');
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

  // Mock users data
  const users: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+91 98765 43210',
      status: 'active',
      kycStatus: 'verified',
      earnings: 5420,
      referrals: 12,
      joinedDate: '2024-01-15',
      lastActive: '2 hours ago'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+91 98765 43211',
      status: 'active',
      kycStatus: 'pending',
      earnings: 3200,
      referrals: 5,
      joinedDate: '2024-02-20',
      lastActive: '1 day ago'
    },
    {
      id: '3',
      name: 'Alex Kumar',
      email: 'alex@example.com',
      phone: '+91 98765 43212',
      status: 'suspended',
      kycStatus: 'verified',
      earnings: 8900,
      referrals: 23,
      joinedDate: '2023-12-10',
      lastActive: '1 week ago'
    },
    {
      id: '4',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+91 98765 43213',
      status: 'active',
      kycStatus: 'none',
      earnings: 1200,
      referrals: 2,
      joinedDate: '2024-03-01',
      lastActive: '10 minutes ago'
    },
    {
      id: '5',
      name: 'Rahul Patel',
      email: 'rahul@example.com',
      phone: '+91 98765 43214',
      status: 'pending',
      kycStatus: 'rejected',
      earnings: 0,
      referrals: 0,
      joinedDate: '2024-03-10',
      lastActive: 'Never'
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleUserAction = async (userId: string, action: string) => {
    try {
      // API call would go here
      toast({
        title: 'Action Completed',
        description: `User ${action} successfully`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} user`,
        variant: 'destructive'
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'No users selected',
        description: 'Please select users to perform bulk action',
        variant: 'destructive'
      });
      return;
    }

    try {
      // API call would go here
      toast({
        title: 'Bulk Action Completed',
        description: `${selectedUsers.length} users ${action} successfully`
      });
      setSelectedUsers([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} users`,
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      suspended: 'destructive',
      pending: 'secondary'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getKYCBadge = (status: string) => {
    const colors: Record<string, string> = {
      verified: 'bg-blue-100 text-blue-800',
      pending: 'bg-blue-50 text-blue-600',
      rejected: 'bg-blue-200 text-blue-900',
      none: 'bg-white text-blue-500 border border-blue-200'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>{status}</span>;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 flex items-center">
            <Users className="w-8 h-8 mr-3" />
            Manage Users
          </h1>
          <p className="text-blue-600 mt-2">
            View and manage all platform users
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Total Users</p>
                  <p className="text-2xl font-bold">10,423</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Active Users</p>
                  <p className="text-2xl font-bold">8,567</p>
                </div>
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">KYC Verified</p>
                  <p className="text-2xl font-bold">6,234</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Suspended</p>
                  <p className="text-2xl font-bold">234</p>
                </div>
                <UserX className="w-8 h-8 text-blue-700" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
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
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
                {selectedUsers.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Bulk Actions ({selectedUsers.length})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBulkAction('approved')}>
                        Approve Selected
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('suspended')}>
                        Suspend Selected
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('deleted')} className="text-red-600">
                        Delete Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>User List</CardTitle>
            <CardDescription>
              {filteredUsers.length} users found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map(u => u.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      />
                    </th>
                    <th className="text-left p-4">User</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">KYC</th>
                    <th className="text-left p-4">Earnings</th>
                    <th className="text-left p-4">Referrals</th>
                    <th className="text-left p-4">Last Active</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                        />
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">{user.phone}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="p-4">
                        {getKYCBadge(user.kycStatus)}
                      </td>
                      <td className="p-4">
                        <p className="font-medium">₹{user.earnings.toLocaleString()}</p>
                      </td>
                      <td className="p-4">
                        <p>{user.referrals}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-600">{user.lastActive}</p>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            {user.status === 'suspended' ? (
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, 'reactivated')}>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Reactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, 'suspended')}>
                                <Ban className="w-4 h-4 mr-2" />
                                Suspend
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleUserAction(user.id, 'deleted')}>
                              <XCircle className="w-4 h-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}