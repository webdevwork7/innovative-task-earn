import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Input } from '../components/ui/input.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { Alert, AlertDescription } from '../components/ui/alert.tsx';
import { useToast } from '../hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { 
  Users,
  Copy,
  Share2,
  Gift,
  TrendingUp,
  UserPlus,
  CheckCircle,
  Clock,
  IndianRupee,
  Link2,
  MessageCircle,
  Mail,
  Facebook,
  Twitter,
  ArrowRight,
  Trophy,
  Star
} from 'lucide-react';

interface Referral {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  kycStatus: 'pending' | 'verified' | 'not_submitted';
  earnedAmount: number;
}

export default function Referrals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const referralCode = user?.referralCode || 'TASK2024';
  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

  // Fetch referral data
  const { data: referralData, isLoading } = useQuery({
    queryKey: ['/api/users/referrals'],
    enabled: !!user,
    initialData: {
      totalReferrals: 0,
      activeReferrals: 0,
      totalEarned: 0,
      pendingEarnings: 0,
      referralList: []
    }
  });

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: `${type} copied to clipboard`
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnSocial = (platform: string) => {
    const message = `Join Innovative Task Earn and start earning money by completing simple tasks! Use my referral code: ${referralCode}`;
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message + ' ' + referralLink)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`,
      email: `mailto:?subject=Join Innovative Task Earn&body=${encodeURIComponent(message + '\n\n' + referralLink)}`
    };
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank');
    }
  };

  const getKYCBadge = (status: string) => {
    const variants: Record<string, any> = {
      verified: { icon: CheckCircle, className: 'bg-green-100 text-green-800', text: 'Verified' },
      pending: { icon: Clock, className: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      not_submitted: { icon: Clock, className: 'bg-gray-100 text-gray-800', text: 'Not Started' }
    };
    
    const config = variants[status] || variants.not_submitted;
    const Icon = config.icon;
    
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading referrals...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Referral Program</h1>
          <p className="text-gray-600 mt-2">Earn ₹49 for every friend who completes KYC verification</p>
        </div>

        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Referrals</p>
                  <p className="text-2xl font-bold">{referralData?.totalReferrals || 0}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Referrals</p>
                  <p className="text-2xl font-bold text-green-600">
                    {referralData?.activeReferrals || 0}
                  </p>
                </div>
                <UserPlus className="w-8 h-8 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Earned</p>
                  <p className="text-2xl font-bold">₹{referralData?.totalEarned || 0}</p>
                </div>
                <IndianRupee className="w-8 h-8 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    ₹{referralData?.pendingEarnings || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Share Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Referral Link</CardTitle>
                <CardDescription>Share this link with friends to earn rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Referral Code</Label>
                  <div className="flex gap-2">
                    <Input
                      value={referralCode}
                      readOnly
                      className="font-mono text-lg font-bold"
                    />
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(referralCode, 'Referral code')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Referral Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={referralLink}
                      readOnly
                      className="text-sm"
                    />
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(referralLink, 'Referral link')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Share on Social Media</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareOnSocial('whatsapp')}
                      className="flex-1"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareOnSocial('facebook')}
                      className="flex-1"
                    >
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareOnSocial('twitter')}
                      className="flex-1"
                    >
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareOnSocial('email')}
                      className="flex-1"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referral List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Referrals</CardTitle>
                <CardDescription>Track your referred friends and earnings</CardDescription>
              </CardHeader>
              <CardContent>
                {(!referralData?.referralList || referralData.referralList.length === 0) ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No referrals yet</p>
                    <p className="text-sm mt-1">Start sharing your referral link to earn rewards!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {referralData.referralList.map((referral: Referral) => (
                      <div key={referral.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{referral.name}</p>
                          <p className="text-sm text-gray-600">{referral.email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Joined: {new Date(referral.joinedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {getKYCBadge(referral.kycStatus)}
                          {referral.kycStatus === 'verified' && (
                            <p className="text-sm font-semibold text-green-600 mt-1">
                              +₹49
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* How it Works */}
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Share Your Link</p>
                    <p className="text-sm text-gray-600">Send your referral link to friends</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Friend Signs Up</p>
                    <p className="text-sm text-gray-600">They create an account using your code</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Complete KYC</p>
                    <p className="text-sm text-gray-600">Friend completes KYC verification</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    ₹
                  </div>
                  <div>
                    <p className="font-medium">Earn ₹49</p>
                    <p className="text-sm text-gray-600">Get rewarded instantly!</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rewards Info */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-purple-600" />
                  Referral Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Per Referral</span>
                  <span className="font-bold text-purple-600">₹49</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Monthly Limit</span>
                  <span className="font-semibold">Unlimited</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Payment</span>
                  <span className="font-semibold">Instant</span>
                </div>
                <hr className="border-purple-200" />
                <div className="text-sm text-gray-600">
                  <p>✓ No limit on referrals</p>
                  <p>✓ Instant credit to wallet</p>
                  <p>✓ Lifetime earnings</p>
                </div>
              </CardContent>
            </Card>

            {/* Top Referrers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                  Top Referrers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-sm">
                        1
                      </div>
                      <span className="ml-2 font-medium">Rahul K.</span>
                    </div>
                    <span className="text-sm font-semibold">152 referrals</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-sm">
                        2
                      </div>
                      <span className="ml-2 font-medium">Priya S.</span>
                    </div>
                    <span className="text-sm font-semibold">98 referrals</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
                        3
                      </div>
                      <span className="ml-2 font-medium">Amit P.</span>
                    </div>
                    <span className="text-sm font-semibold">87 referrals</span>
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

// Add missing Label component import
const Label = ({ children, className = '', ...props }: any) => (
  <label className={`block text-sm font-medium ${className}`} {...props}>
    {children}
  </label>
);