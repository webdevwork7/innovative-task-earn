import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './hooks/useAuth.tsx';
import { Toaster } from './components/ui/toaster.tsx';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import Earnings from './pages/Earnings';
import KYC from './pages/KYC';
import Referrals from './pages/Referrals';
import VerifyEmail from './pages/VerifyEmail';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import About from './pages/About';
import FAQ from './pages/FAQ';
import ForgotPassword from './pages/ForgotPassword';
import Settings from './pages/Settings';
import Withdrawal from './pages/Withdrawal';
import TaskSubmission from './pages/TaskSubmission';
import Support from './pages/Support';
import Notifications from './pages/Notifications';
import Reactivation from './pages/Reactivation';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminTasks from './pages/admin/Tasks';
import AdminPayouts from './pages/admin/Payouts';
import AdminInquiries from './pages/admin/Inquiries';
import AdminKYC from './pages/admin/KYC';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';
import AdminSupport from './pages/admin/Support';
import AdminReferrals from './pages/admin/Referrals';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <div className="min-h-screen">
        <Switch>
          {/* Public Routes */}
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/verify-email" component={VerifyEmail} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reactivation" component={Reactivation} />
          <Route path="/terms" component={Terms} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/contact" component={Contact} />
          <Route path="/about" component={About} />
          <Route path="/faq" component={FAQ} />
          
          {/* Protected User Routes */}
          <Route path="/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/users/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/tasks">
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          </Route>
          <Route path="/tasks/:id/submit">
            {(params) => (
              <ProtectedRoute>
                <TaskSubmission />
              </ProtectedRoute>
            )}
          </Route>
          <Route path="/profile">
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </Route>
          <Route path="/earnings">
            <ProtectedRoute>
              <Earnings />
            </ProtectedRoute>
          </Route>
          <Route path="/kyc">
            <ProtectedRoute>
              <KYC />
            </ProtectedRoute>
          </Route>
          <Route path="/referrals">
            <ProtectedRoute>
              <Referrals />
            </ProtectedRoute>
          </Route>
          <Route path="/withdrawal">
            <ProtectedRoute requireVerified>
              <Withdrawal />
            </ProtectedRoute>
          </Route>
          <Route path="/support">
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          </Route>
          <Route path="/notifications">
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          </Route>
          <Route path="/settings">
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          </Route>
          
          {/* Protected Admin Routes */}
          <Route path="/admin">
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/dashboard">
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/users">
            <ProtectedRoute requireAdmin>
              <AdminUsers />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/tasks">
            <ProtectedRoute requireAdmin>
              <AdminTasks />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/payouts">
            <ProtectedRoute requireAdmin>
              <AdminPayouts />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/inquiries">
            <ProtectedRoute requireAdmin>
              <AdminInquiries />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/kyc">
            <ProtectedRoute requireAdmin>
              <AdminKYC />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/reports">
            <ProtectedRoute requireAdmin>
              <AdminReports />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/settings">
            <ProtectedRoute requireAdmin>
              <AdminSettings />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/support">
            <ProtectedRoute requireAdmin>
              <AdminSupport />
            </ProtectedRoute>
          </Route>
          <Route path="/admin/referrals">
            <ProtectedRoute requireAdmin>
              <AdminReferrals />
            </ProtectedRoute>
          </Route>
          
          {/* 404 Page */}
          <Route>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600">Page not found</p>
                <a href="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
                  Go to Home
                </a>
              </div>
            </div>
          </Route>
        </Switch>
      </div>
      <Toaster />
    </AuthProvider>
    </QueryClientProvider>
  );
}