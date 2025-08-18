import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Input } from '../components/ui/input.tsx';
import { Label } from '../components/ui/label.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { Alert, AlertDescription } from '../components/ui/alert.tsx';
import { useToast } from '../hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { 
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  IndianRupee,
  Key
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });

  // Fetch user profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['/api/users/profile'],
    enabled: !!user,
    initialData: user
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully'
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/users/profile'] });
    },
    onError: () => {
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const getKYCStatusBadge = () => {
    const status = profileData?.kycStatus || 'pending';
    const variants: Record<string, any> = {
      verified: { variant: 'default', icon: CheckCircle, text: 'Verified' },
      pending: { variant: 'secondary', icon: Clock, text: 'Pending' },
      rejected: { variant: 'destructive', icon: X, text: 'Rejected' },
      not_submitted: { variant: 'outline', icon: AlertCircle, text: 'Not Submitted' }
    };
    
    const config = variants[status] || variants.not_submitted;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const getAccountStatusBadge = () => {
    const status = profileData?.status || 'active';
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="destructive">
        <X className="w-3 h-3 mr-1" />
        Suspended
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 XXXXX XXXXX"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={updateProfileMutation.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            firstName: profileData?.firstName || '',
                            lastName: profileData?.lastName || '',
                            phone: profileData?.phone || '',
                            email: profileData?.email || ''
                          });
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">First Name</p>
                        <p className="font-medium">{profileData?.firstName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Name</p>
                        <p className="font-medium">{profileData?.lastName || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        Email Address
                      </p>
                      <p className="font-medium">{profileData?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        Phone Number
                      </p>
                      <p className="font-medium">{profileData?.phone || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Key className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Status Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Account Status</p>
                  {getAccountStatusBadge()}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">KYC Status</p>
                  {getKYCStatusBadge()}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Member Since</p>
                  <p className="font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    {new Date(profileData?.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">User ID</p>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                    {profileData?.id || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Referral Code</p>
                  <p className="font-mono text-sm bg-blue-50 text-blue-700 p-2 rounded">
                    {profileData?.referralCode || 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Earnings Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Earnings Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Balance</span>
                  <span className="font-semibold text-green-600">
                    ₹{profileData?.balance || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Earned</span>
                  <span className="font-medium">₹{profileData?.totalEarnings || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Withdrawn</span>
                  <span className="font-medium">₹{profileData?.totalWithdrawn || 0}</span>
                </div>
                <hr className="my-2" />
                <Button className="w-full" variant="default">
                  <IndianRupee className="w-4 h-4 mr-2" />
                  Request Payout
                </Button>
              </CardContent>
            </Card>

            {/* KYC Alert */}
            {profileData?.kycStatus !== 'verified' && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Complete KYC verification to enable withdrawals
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}