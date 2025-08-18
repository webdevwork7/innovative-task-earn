import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Layout } from '@/components/Layout';
import { AlertTriangle, CreditCard, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Reactivation() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentVerified, setPaymentVerified] = useState(false);
  
  // Check for payment success in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      handlePaymentSuccess();
    } else if (params.get('payment') === 'failed') {
      setError('Payment failed. Please try again.');
    }
  }, []);

  const handlePaymentSuccess = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/reactivation/verify', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setPaymentVerified(true);
        toast({
          title: 'Account Reactivated!',
          description: 'Your account has been successfully reactivated. Redirecting to login...'
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to verify payment');
      }
    } catch (error) {
      setError('Failed to verify payment. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');
    
    try {
      // Get user session data from localStorage or session
      const userEmail = localStorage.getItem('suspendedUserEmail');
      const userPhone = localStorage.getItem('suspendedUserPhone');
      const userName = localStorage.getItem('suspendedUserName');
      
      if (!userEmail) {
        setError('Session expired. Please login again.');
        navigate('/login');
        return;
      }

      const response = await fetch('/api/reactivation/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userEmail,
          phone: userPhone,
          name: userName
        })
      });

      const data = await response.json();
      
      if (data.paymentUrl) {
        // Redirect to Cashfree payment page
        window.location.href = data.paymentUrl;
      } else {
        setError(data.error || 'Failed to initiate payment');
      }
    } catch (error) {
      setError('Failed to initiate payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentVerified) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
          <Card className="max-w-md w-full shadow-xl border-0">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Reactivated!</h2>
              <p className="text-gray-600">
                Your account has been successfully reactivated. You can now login and continue earning.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
        <Card className="max-w-lg w-full shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Account Suspended
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Your account has been suspended due to inactivity or policy violations.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">Why was my account suspended?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Not meeting daily task completion requirements
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Prolonged account inactivity
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Violation of platform terms and conditions
                </li>
              </ul>
            </div>

            <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-semibold text-gray-900">
                  Reactivation Fee
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹49
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Pay a one-time reactivation fee to restore your account and continue earning.
              </p>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Instant account restoration</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Access to all platform features</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Retain all previous earnings</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-200"
              data-testid="button-pay-reactivation"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay ₹49 with Cashfree
                  <ArrowRight className="w-4 h-4 ml-2" />
                </span>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Secure payment powered by Cashfree
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Your payment information is encrypted and secure
              </p>
            </div>

            <div className="border-t pt-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="w-full text-gray-600 hover:text-gray-900"
                data-testid="button-back-login"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}