import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Button } from '../components/ui/button.tsx';
import { Input } from '../components/ui/input.tsx';
import { Label } from '../components/ui/label.tsx';
import { Alert, AlertDescription } from '../components/ui/alert.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { useAuth } from '../hooks/useAuth.tsx';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import {
  Wallet,
  IndianRupee,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Info,
  ArrowRight,
  History,
  Shield
} from 'lucide-react';

interface WithdrawalHistory {
  id: string;
  amount: number;
  method: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestDate: string;
  processedDate?: string;
  transactionId?: string;
}

export default function Withdrawal() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  // Fetch user balance and stats from earnings data
  const { data: balanceData } = useQuery({
    queryKey: ['/api/users/earnings'],
    enabled: !!user,
    select: (data: any) => ({
      availableBalance: data?.currentBalance || 0,
      pendingEarnings: data?.pendingAmount || 0,
      totalWithdrawn: 0,
      minWithdrawal: 100,
      processingFee: 0
    })
  });

  // Safe balance data with defaults
  const safeBalanceData = {
    availableBalance: balanceData?.availableBalance || 0,
    pendingEarnings: balanceData?.pendingEarnings || 0,
    totalWithdrawn: balanceData?.totalWithdrawn || 0,
    minWithdrawal: balanceData?.minWithdrawal || 100,
    processingFee: balanceData?.processingFee || 0
  };

  // Fetch withdrawal history
  const { data: history = [] } = useQuery({
    queryKey: ['/api/users/withdrawals'],
    enabled: !!user
  });

  // Submit withdrawal request
  const withdrawMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/users/withdraw', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/balance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/withdrawals'] });
      toast({
        title: 'Withdrawal Request Submitted',
        description: 'Your withdrawal request has been submitted successfully. It will be processed within 24-48 hours.'
      });
      // Reset form
      setAmount('');
      setUpiId('');
      setBankAccount('');
      setIfscCode('');
      setAccountHolder('');
    },
    onError: (error: any) => {
      toast({
        title: 'Request Failed',
        description: error.message || 'Failed to submit withdrawal request.',
        variant: 'destructive'
      });
    }
  });

  // Check if user is logged in
  React.useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  if (!user) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const withdrawAmount = parseFloat(amount);
    
    // Validation
    if (withdrawAmount < safeBalanceData.minWithdrawal) {
      toast({
        title: 'Invalid Amount',
        description: `Minimum withdrawal amount is ₹${safeBalanceData.minWithdrawal}`,
        variant: 'destructive'
      });
      return;
    }
    
    if (withdrawAmount > safeBalanceData.availableBalance) {
      toast({
        title: 'Insufficient Balance',
        description: 'You do not have enough balance for this withdrawal.',
        variant: 'destructive'
      });
      return;
    }

    const withdrawalData: any = {
      amount: withdrawAmount,
      method
    };

    if (method === 'upi') {
      if (!upiId) {
        toast({
          title: 'UPI ID Required',
          description: 'Please enter your UPI ID.',
          variant: 'destructive'
        });
        return;
      }
      withdrawalData.upiId = upiId;
    } else if (method === 'bank') {
      if (!bankAccount || !ifscCode || !accountHolder) {
        toast({
          title: 'Bank Details Required',
          description: 'Please enter all bank account details.',
          variant: 'destructive'
        });
        return;
      }
      withdrawalData.bankAccount = bankAccount;
      withdrawalData.ifscCode = ifscCode;
      withdrawalData.accountHolder = accountHolder;
    }

    withdrawMutation.mutate(withdrawalData);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      approved: 'default',
      completed: 'default',
      rejected: 'destructive'
    };
    const icons: Record<string, any> = {
      pending: Clock,
      approved: CheckCircle,
      completed: CheckCircle,
      rejected: AlertCircle
    };
    const Icon = icons[status] || Clock;
    
    return (
      <Badge variant={variants[status] || 'outline'} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Withdrawal</h1>
          <p className="text-blue-600 mt-2">Request payout of your earnings</p>
        </div>

        {/* KYC Warning */}
        {user.kycStatus !== 'verified' && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>KYC Verification Required:</strong> You need to complete KYC verification before you can withdraw funds.
              <Button 
                variant="link" 
                className="text-blue-600 p-0 h-auto ml-2"
                onClick={() => setLocation('/kyc')}
              >
                Complete KYC →
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Cards */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Available Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-2xl font-bold text-blue-700">
                    <IndianRupee className="w-6 h-6 mr-1" />
                    {safeBalanceData.availableBalance}
                  </div>
                  <Wallet className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Withdrawal Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Minimum Withdrawal:</span>
                  <span className="font-medium">₹{safeBalanceData.minWithdrawal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Processing Fee:</span>
                  <span className="font-medium">₹{safeBalanceData.processingFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Processing Time:</span>
                  <span className="font-medium">24-48 hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Total Withdrawn:</span>
                  <span className="font-medium">₹{safeBalanceData.totalWithdrawn}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Withdrawal Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Request Withdrawal</CardTitle>
                <CardDescription>
                  Enter your withdrawal details below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Amount */}
                  <div>
                    <Label htmlFor="amount">Withdrawal Amount</Label>
                    <div className="relative mt-2">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-9"
                        min={safeBalanceData.minWithdrawal}
                        max={safeBalanceData.availableBalance}
                        disabled={user.kycStatus !== 'verified'}
                      />
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Min: ₹{safeBalanceData.minWithdrawal} | Max: ₹{safeBalanceData.availableBalance}
                    </p>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <Label>Payment Method</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Button
                        type="button"
                        variant={method === 'upi' ? 'default' : 'outline'}
                        onClick={() => setMethod('upi')}
                        disabled={user.kycStatus !== 'verified'}
                      >
                        UPI
                      </Button>
                      <Button
                        type="button"
                        variant={method === 'bank' ? 'default' : 'outline'}
                        onClick={() => setMethod('bank')}
                        disabled={user.kycStatus !== 'verified'}
                      >
                        Bank Transfer
                      </Button>
                    </div>
                  </div>

                  {/* UPI Details */}
                  {method === 'upi' && (
                    <div>
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input
                        id="upiId"
                        type="text"
                        placeholder="example@paytm"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="mt-2"
                        disabled={user.kycStatus !== 'verified'}
                      />
                    </div>
                  )}

                  {/* Bank Details */}
                  {method === 'bank' && (
                    <>
                      <div>
                        <Label htmlFor="accountHolder">Account Holder Name</Label>
                        <Input
                          id="accountHolder"
                          type="text"
                          placeholder="Enter account holder name"
                          value={accountHolder}
                          onChange={(e) => setAccountHolder(e.target.value)}
                          className="mt-2"
                          disabled={user.kycStatus !== 'verified'}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bankAccount">Account Number</Label>
                        <Input
                          id="bankAccount"
                          type="text"
                          placeholder="Enter account number"
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                          className="mt-2"
                          disabled={user.kycStatus !== 'verified'}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ifscCode">IFSC Code</Label>
                        <Input
                          id="ifscCode"
                          type="text"
                          placeholder="Enter IFSC code"
                          value={ifscCode}
                          onChange={(e) => setIfscCode(e.target.value)}
                          className="mt-2"
                          disabled={user.kycStatus !== 'verified'}
                        />
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={user.kycStatus !== 'verified' || withdrawMutation.isPending}
                  >
                    {withdrawMutation.isPending ? (
                      <>Processing...</>
                    ) : (
                      <>
                        Submit Withdrawal Request
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  {/* Info Alert */}
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Withdrawals are processed every Tuesday. Make sure your payment details are correct to avoid delays.
                    </AlertDescription>
                  </Alert>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Withdrawal History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="w-5 h-5 mr-2" />
              Withdrawal History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history && history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Date</th>
                      <th className="text-left p-4">Amount</th>
                      <th className="text-left p-4">Method</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Transaction ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(history as WithdrawalHistory[]).map((item) => (
                      <tr key={item.id} className="border-b hover:bg-blue-50">
                        <td className="p-4">
                          <p className="text-sm">{new Date(item.requestDate).toLocaleDateString()}</p>
                          {item.processedDate && (
                            <p className="text-xs text-blue-600">
                              Processed: {new Date(item.processedDate).toLocaleDateString()}
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center font-medium">
                            <IndianRupee className="w-4 h-4 mr-1" />
                            {item.amount}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm uppercase">{item.method}</span>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-mono">
                            {item.transactionId || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                <p className="text-blue-600">No withdrawal history</p>
                <p className="text-sm text-blue-500 mt-2">
                  Your withdrawal requests will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}