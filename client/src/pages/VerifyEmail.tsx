import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '../components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Alert, AlertDescription } from '../components/ui/alert.tsx';
import { useToast } from '../hooks/use-toast';
import { 
  Mail,
  CheckCircle,
  Clock,
  RefreshCw,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Start countdown when component mounts
  useEffect(() => {
    setCountdown(60);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    setIsResending(true);
    
    try {
      // API call to resend verification email
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: 'Email Sent',
          description: 'Verification email has been resent to your inbox'
        });
        setCountdown(60); // Reset countdown
      } else {
        throw new Error('Failed to resend email');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend verification email. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-10 h-10 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
            <CardDescription className="text-base">
              We've sent a verification link to your email address
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Please check your inbox and click the verification link to activate your account.
                The link will expire in 24 hours.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Check your inbox</p>
                  <p className="text-sm text-gray-600">
                    We sent an email to your registered email address
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">Click the link</p>
                  <p className="text-sm text-gray-600">
                    Open the email and click the verification button
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Start earning</p>
                  <p className="text-sm text-gray-600">
                    Once verified, you can log in and start completing tasks
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-gray-600 text-center mb-4">
                Didn't receive the email? Check your spam folder or
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResendEmail}
                disabled={isResending || countdown > 0}
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  `Resend email in ${countdown}s`
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend verification email
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <Button
                className="w-full"
                onClick={() => setLocation('/login')}
              >
                Go to Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                You can login after verifying your email
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}