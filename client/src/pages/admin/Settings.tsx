import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.tsx';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Label } from '../../components/ui/label.tsx';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'wouter';
import { useToast } from '../../hooks/use-toast';
import { 
  Settings as SettingsIcon,
  Save,
  Shield,
  DollarSign,
  Bell,
  Users,
  Globe,
  Clock,
  AlertCircle,
  CheckCircle,
  Mail,
  MessageSquare,
  Zap
} from 'lucide-react';

export default function AdminSettings() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    general: {
      platformName: 'Innovative Task Earn',
      supportEmail: 'support@innovativetaskearn.online',
      contactPhone: '+91 98765 43210',
      address: 'Haryana, India',
      gstNumber: '06AAGCI9044P1ZZ'
    },
    payments: {
      minPayout: 500,
      maxPayout: 50000,
      payoutDay: 'Tuesday',
      kycFee: 99,
      reactivationFee: 49,
      referralBonus: 49
    },
    tasks: {
      dailyTaskLimit: 50,
      taskApprovalTime: 20,
      appDownloadReward: { min: 5, max: 25 },
      businessReviewReward: { min: 5, max: 35 },
      productReviewReward: { min: 5, max: 40 },
      channelSubscribeReward: { min: 5, max: 20 },
      commentLikeReward: { min: 5, max: 15 },
      youtubeViewReward: { min: 5, max: 30 }
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      weeklyReports: true,
      lowBalanceAlert: true,
      alertThreshold: 1000
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireSpecialChar: true
    }
  });

  // Check admin access
  React.useEffect(() => {
    if (!user) {
      setLocation('/login');
    } else if (user.role !== 'admin') {
      setLocation('/users/dashboard');
    }
  }, [user, setLocation]);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      toast({
        title: 'Settings Saved',
        description: 'Platform settings have been updated successfully.'
      });
    }, 1000);
  };

  const updateSetting = (category: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: value
      }
    }));
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure platform settings and business parameters
          </p>
        </div>

        {/* Settings Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {[
            { id: 'general', label: 'General', icon: Globe },
            { id: 'payments', label: 'Payments', icon: DollarSign },
            { id: 'tasks', label: 'Tasks', icon: Zap },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform information and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Platform Name</Label>
                  <Input
                    value={settings.general.platformName}
                    onChange={(e) => updateSetting('general', 'platformName', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Support Email</Label>
                  <Input
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input
                    value={settings.general.contactPhone}
                    onChange={(e) => updateSetting('general', 'contactPhone', e.target.value)}
                  />
                </div>
                <div>
                  <Label>GST Number</Label>
                  <Input
                    value={settings.general.gstNumber}
                    onChange={(e) => updateSetting('general', 'gstNumber', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Business Address</Label>
                  <Input
                    value={settings.general.address}
                    onChange={(e) => updateSetting('general', 'address', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Settings */}
        {activeTab === 'payments' && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure payment and payout parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Minimum Payout (₹)</Label>
                  <Input
                    type="number"
                    value={settings.payments.minPayout}
                    onChange={(e) => updateSetting('payments', 'minPayout', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Maximum Payout (₹)</Label>
                  <Input
                    type="number"
                    value={settings.payments.maxPayout}
                    onChange={(e) => updateSetting('payments', 'maxPayout', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Payout Day</Label>
                  <Input
                    value={settings.payments.payoutDay}
                    onChange={(e) => updateSetting('payments', 'payoutDay', e.target.value)}
                  />
                </div>
                <div>
                  <Label>KYC Fee (₹)</Label>
                  <Input
                    type="number"
                    value={settings.payments.kycFee}
                    onChange={(e) => updateSetting('payments', 'kycFee', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Reactivation Fee (₹)</Label>
                  <Input
                    type="number"
                    value={settings.payments.reactivationFee}
                    onChange={(e) => updateSetting('payments', 'reactivationFee', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Referral Bonus (₹)</Label>
                  <Input
                    type="number"
                    value={settings.payments.referralBonus}
                    onChange={(e) => updateSetting('payments', 'referralBonus', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task Settings */}
        {activeTab === 'tasks' && (
          <Card>
            <CardHeader>
              <CardTitle>Task Settings</CardTitle>
              <CardDescription>Configure task rewards and limitations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Daily Task Limit</Label>
                  <Input
                    type="number"
                    value={settings.tasks.dailyTaskLimit}
                    onChange={(e) => updateSetting('tasks', 'dailyTaskLimit', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Task Approval Time (minutes)</Label>
                  <Input
                    type="number"
                    value={settings.tasks.taskApprovalTime}
                    onChange={(e) => updateSetting('tasks', 'taskApprovalTime', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Task Reward Ranges (₹)</h3>
                <div className="space-y-3">
                  {Object.entries(settings.tasks).filter(([key]) => key.includes('Reward')).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 gap-4 items-center">
                      <Label className="text-sm">{key.replace('Reward', '').replace(/([A-Z])/g, ' $1').trim()}</Label>
                      <Input
                        type="number"
                        placeholder="Min"
                        value={(value as any).min}
                        onChange={(e) => updateSetting('tasks', key, { ...(value as any), min: parseInt(e.target.value) })}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={(value as any).max}
                        onChange={(e) => updateSetting('tasks', key, { ...(value as any), max: parseInt(e.target.value) })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure platform notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">Send email updates to users</p>
                  </div>
                  <Button
                    variant={settings.notifications.emailNotifications ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSetting('notifications', 'emailNotifications', !settings.notifications.emailNotifications)}
                  >
                    {settings.notifications.emailNotifications ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-gray-500">Send SMS alerts for important updates</p>
                  </div>
                  <Button
                    variant={settings.notifications.smsNotifications ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSetting('notifications', 'smsNotifications', !settings.notifications.smsNotifications)}
                  >
                    {settings.notifications.smsNotifications ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-500">Browser push notifications</p>
                  </div>
                  <Button
                    variant={settings.notifications.pushNotifications ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSetting('notifications', 'pushNotifications', !settings.notifications.pushNotifications)}
                  >
                    {settings.notifications.pushNotifications ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Reports</p>
                    <p className="text-sm text-gray-500">Send weekly performance reports</p>
                  </div>
                  <Button
                    variant={settings.notifications.weeklyReports ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSetting('notifications', 'weeklyReports', !settings.notifications.weeklyReports)}
                  >
                    {settings.notifications.weeklyReports ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Low Balance Alert</p>
                      <p className="text-sm text-gray-500">Alert when platform balance is low</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={settings.notifications.alertThreshold}
                        onChange={(e) => updateSetting('notifications', 'alertThreshold', parseInt(e.target.value))}
                        className="w-24"
                      />
                      <Button
                        variant={settings.notifications.lowBalanceAlert ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateSetting('notifications', 'lowBalanceAlert', !settings.notifications.lowBalanceAlert)}
                      >
                        {settings.notifications.lowBalanceAlert ? 'On' : 'Off'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure platform security parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                  </div>
                  <Button
                    variant={settings.security.twoFactorAuth ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSetting('security', 'twoFactorAuth', !settings.security.twoFactorAuth)}
                  >
                    {settings.security.twoFactorAuth ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Session Timeout (minutes)</Label>
                    <Input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Max Login Attempts</Label>
                    <Input
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Minimum Password Length</Label>
                    <Input
                      type="number"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Special Characters</Label>
                    <Button
                      variant={settings.security.requireSpecialChar ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateSetting('security', 'requireSpecialChar', !settings.security.requireSpecialChar)}
                    >
                      {settings.security.requireSpecialChar ? 'Yes' : 'No'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
}