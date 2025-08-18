import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth.tsx';
import { Button } from './ui/button.tsx';
import { 
  Menu, 
  X, 
  Home, 
  ListTodo, 
  Wallet, 
  User, 
  LogOut,
  Shield,
  Users,
  ChevronDown,
  Bell,
  DollarSign,
  FileText,
  Settings,
  BarChart,
  HelpCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu.tsx';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { user, logout, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Primary navigation items (always visible)
  const primaryNavigation = [
    { name: 'Dashboard', href: user?.role === 'admin' ? '/admin/dashboard' : '/users/dashboard', icon: Home, requireAuth: true },
    { name: 'Tasks', href: user?.role === 'admin' ? '/admin/tasks' : '/tasks', icon: ListTodo, requireAuth: false },
  ];

  // Grouped navigation for dropdown menus
  const earningsMenuItems = [
    { name: 'My Earnings', href: '/earnings', icon: DollarSign },
    { name: 'Withdrawal', href: '/withdrawal', icon: Wallet },
    { name: 'Referrals', href: '/referrals', icon: Users },
  ];

  const accountMenuItems = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'KYC Verification', href: '/kyc', icon: Shield },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Support', href: '/support', icon: HelpCircle },
  ];

  const adminMenuItems = [
    { name: 'Manage Users', href: '/admin/users', icon: Users },
    { name: 'KYC Management', href: '/admin/kyc', icon: Shield },
    { name: 'Payouts', href: '/admin/payouts', icon: Wallet },
    { name: 'Referrals', href: '/admin/referrals', icon: Users },
    { name: 'Support Center', href: '/admin/support', icon: HelpCircle },
    { name: 'Inquiries', href: '/admin/inquiries', icon: FileText },
    { name: 'Reports', href: '/admin/reports', icon: BarChart },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  // Mobile navigation - flat list
  const mobileNavigation = user?.role === 'admin' ? [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Tasks', href: '/admin/tasks', icon: ListTodo },
    { name: 'KYC', href: '/admin/kyc', icon: Shield },
    { name: 'Payouts', href: '/admin/payouts', icon: Wallet },
    { name: 'Referrals', href: '/admin/referrals', icon: Users },
    { name: 'Support', href: '/admin/support', icon: HelpCircle },
    { name: 'Reports', href: '/admin/reports', icon: BarChart },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ] : [
    { name: 'Dashboard', href: '/users/dashboard', icon: Home },
    { name: 'Tasks', href: '/tasks', icon: ListTodo },
    { name: 'Earnings', href: '/earnings', icon: DollarSign },
    { name: 'Withdrawal', href: '/withdrawal', icon: Wallet },
    { name: 'Referrals', href: '/referrals', icon: Users },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'KYC', href: '/kyc', icon: Shield },
    { name: 'Support', href: '/support', icon: HelpCircle },
  ];



  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">IT</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  Innovative Task Earn
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {/* Primary Navigation Items */}
              {primaryNavigation.map((item) => {
                if (item.requireAuth && !user) return null;
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location === item.href
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Earnings Dropdown (for regular users) */}
              {user && user.role !== 'admin' && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1 space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>Earnings</span>
                    <ChevronDown className="w-3 h-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {earningsMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem 
                          key={item.name}
                          onClick={() => {
                            setTimeout(() => setLocation(item.href), 0);
                          }}
                          className="cursor-pointer"
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          <span>{item.name}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Account Dropdown (for regular users) */}
              {user && user.role !== 'admin' && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1 space-x-1">
                    <User className="w-4 h-4" />
                    <span>Account</span>
                    <ChevronDown className="w-3 h-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {accountMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem 
                          key={item.name}
                          onClick={() => {
                            setTimeout(() => setLocation(item.href), 0);
                          }}
                          className="cursor-pointer"
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          <span>{item.name}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Admin Menu Dropdown */}
              {user?.role === 'admin' && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1 space-x-1">
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                    <ChevronDown className="w-3 h-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Administration</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {adminMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem 
                          key={item.name}
                          onClick={() => {
                            setTimeout(() => setLocation(item.href), 0);
                          }}
                          className="cursor-pointer"
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          <span>{item.name}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Notifications */}
              {user && (
                <Link href="/notifications" className="relative">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Button>
                </Link>
              )}

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1 space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user.firstName?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden sm:inline">{user.firstName}</span>
                    <ChevronDown className="w-3 h-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.firstName} {user.lastName}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => {
                        setTimeout(() => setLocation('/profile'), 0);
                      }}
                      className="cursor-pointer"
                    >
                      <User className="w-4 h-4 mr-2" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        setTimeout(() => setLocation('/settings'), 0);
                      }}
                      className="cursor-pointer"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <nav className="px-4 py-4 space-y-2">
              {mobileNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
                      location === item.href
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login">
                      <Button variant="outline" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="w-full" onClick={() => setMobileMenuOpen(false)}>
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">About Us</Link></li>
                <li><Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Support</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/faq" className="text-sm text-gray-600 hover:text-gray-900">FAQ</Link></li>
                <li><Link href="/help" className="text-sm text-gray-600 hover:text-gray-900">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Business</h3>
              <p className="mt-4 text-sm text-gray-600">
                INNOVATIVE GROW SOLUTIONS PRIVATE LIMITED<br />
                GST: 06AAGCI9044P1ZZ
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              © 2025 Innovative Task Earn. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}