import React from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Button } from '../components/ui/button.tsx';
import { 
  Target,
  Users,
  Shield,
  TrendingUp,
  Award,
  Globe,
  Heart,
  CheckCircle,
  Star,
  Briefcase
} from 'lucide-react';

export default function About() {
  const stats = [
    { label: 'Active Users', value: '10,000+', icon: Users },
    { label: 'Tasks Completed', value: '50,000+', icon: CheckCircle },
    { label: 'Total Paid Out', value: '₹5,00,000+', icon: TrendingUp },
    { label: 'Countries', value: '5+', icon: Globe }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'We prioritize user security with KYC verification and secure payment processing'
    },
    {
      icon: Heart,
      title: 'User First',
      description: 'Our platform is designed with users in mind, ensuring easy navigation and earning'
    },
    {
      icon: Award,
      title: 'Quality Tasks',
      description: 'We partner with reputable companies to provide legitimate, high-quality tasks'
    },
    {
      icon: Target,
      title: 'Transparency',
      description: 'Clear terms, instant earnings visibility, and straightforward payout process'
    }
  ];

  const team = [
    {
      name: 'Rajesh Kumar',
      role: 'Founder & CEO',
      description: 'Visionary leader with 10+ years in digital marketing'
    },
    {
      name: 'Priya Sharma',
      role: 'Chief Operations Officer',
      description: 'Operations expert ensuring smooth platform functionality'
    },
    {
      name: 'Amit Patel',
      role: 'Chief Technology Officer',
      description: 'Tech innovator building secure and scalable solutions'
    },
    {
      name: 'Neha Gupta',
      role: 'Head of Customer Success',
      description: 'Dedicated to ensuring user satisfaction and success'
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Innovative Task Earn</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering individuals to earn money through simple online tasks, 
            creating opportunities for financial growth across India.
          </p>
        </div>

        {/* Company Info Card */}
        <Card className="mb-12 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-gray-700 mb-4">
                  At Innovative Task Earn, we believe everyone deserves the opportunity to earn 
                  extra income through legitimate online work. Our platform connects users with 
                  simple tasks from verified businesses, ensuring fair compensation for every 
                  completed task.
                </p>
                <p className="text-gray-700">
                  Founded in 2023, we've grown to become one of India's most trusted task-earning 
                  platforms, helping thousands of users supplement their income from the comfort 
                  of their homes.
                </p>
              </div>
              <div className="text-center">
                <div className="w-48 h-48 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold text-6xl">ITE</span>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  Innovative Grow Solutions Private Limited<br />
                  GST: 06AAGCI9044P1ZZ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6 text-center">
                <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Our Values */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Our Core Values</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <value.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{value.title}</h3>
                    <p className="text-sm text-gray-600">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How We Work */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">How We Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p>We partner with legitimate businesses needing online task completion</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p>Tasks are verified and categorized based on difficulty and time required</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p>Users complete tasks and submit proof for verification</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p>Earnings are credited instantly upon task approval</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p>Weekly payouts ensure users receive their earnings promptly</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Our Leadership Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Users className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-blue-600 mb-1">{member.role}</p>
                  <p className="text-xs text-gray-600">{member.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Why Choose Us */}
        <Card className="mb-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Why Choose Innovative Task Earn?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Star className="w-12 h-12 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Verified Tasks</h3>
                <p className="text-sm opacity-90">All tasks are from legitimate businesses</p>
              </div>
              <div className="text-center">
                <Shield className="w-12 h-12 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Secure Platform</h3>
                <p className="text-sm opacity-90">KYC verified accounts with secure payments</p>
              </div>
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Regular Earnings</h3>
                <p className="text-sm opacity-90">Consistent task availability and weekly payouts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of users who are already earning money with simple tasks
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => window.location.href = '/signup'}>
              Get Started Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.location.href = '/contact'}>
              <Briefcase className="w-4 h-4 mr-2" />
              Business Inquiries
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}