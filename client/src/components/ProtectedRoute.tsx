import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireVerified?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireVerified = false 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated - redirect to login
      if (!user) {
        setLocation('/login');
        return;
      }

      // Check if user is suspended
      if (user.status === 'suspended') {
        setLocation('/reactivation');
        return;
      }

      // Check admin requirement
      if (requireAdmin && user.role !== 'admin') {
        setLocation('/dashboard');
        return;
      }

      // Check verification requirement
      if (requireVerified && user.verificationStatus !== 'verified') {
        setLocation('/kyc');
        return;
      }
    }
  }, [user, isLoading, requireAdmin, requireVerified, setLocation]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or doesn't meet requirements
  if (!user || 
      (requireAdmin && user.role !== 'admin') || 
      (requireVerified && user.verificationStatus !== 'verified') ||
      user.status === 'suspended') {
    return null; // Return null while redirecting
  }

  // User is authenticated and meets all requirements
  return <>{children}</>;
}