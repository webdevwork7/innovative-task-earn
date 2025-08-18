import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  ArrowRight, 
  CheckCircle, 
  Coins, 
  ListTodo, 
  Shield, 
  Users,
  Smartphone,
  Star,
  FileText,
  Youtube,
  MessageCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Play,
  Award,
  Clock,
  TrendingUp,
  Globe,
  Zap
} from 'lucide-react';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const heroSlides = [
    {
      title: "Earn Money by Completing Simple Online Tasks",
      subtitle: "Join thousands of users earning real money daily",
      description: "Complete tasks, get instant payments, and build your income stream.",
      buttonText: "Start Earning Now",
      gradient: "from-blue-600 to-blue-800",
      accent: "text-blue-100"
    },
    {
      title: "6 Different Ways to Earn Money",
      subtitle: "Multiple earning opportunities",
      description: "From app downloads to product reviews - choose tasks that suit you best.",
      buttonText: "Browse Tasks",
      gradient: "from-blue-700 to-blue-900",
      accent: "text-blue-200"
    },
    {
      title: "Secure KYC Verified Platform",
      subtitle: "Your earnings are safe with us",
      description: "Complete KYC verification and enjoy secure, instant payments to your account.",
      buttonText: "Get Verified",
      gradient: "from-blue-800 to-blue-950",
      accent: "text-blue-100"
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isPlaying, heroSlides.length]);

  const features = [
    {
      icon: ListTodo,
      title: 'Simple Tasks',
      description: 'Complete easy tasks like app downloads, reviews, and social media activities',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Coins,
      title: 'Instant Earnings',
      description: 'Get paid immediately after task approval - no waiting periods',
      color: 'from-blue-600 to-blue-700'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'KYC verified accounts with secure payment processing',
      color: 'from-blue-700 to-blue-800'
    },
    {
      icon: Users,
      title: 'Referral Bonus',
      description: 'Earn ₹49 for every friend who joins and completes KYC',
      color: 'from-blue-500 to-blue-700'
    }
  ];

  const taskCategories = [
    { icon: Smartphone, name: 'App Downloads', reward: '₹5-25', color: 'bg-blue-500' },
    { icon: Star, name: 'Business Reviews', reward: '₹5-35', color: 'bg-blue-600' },
    { icon: FileText, name: 'Product Reviews', reward: '₹5-40', color: 'bg-blue-500' },
    { icon: Youtube, name: 'Channel Subscribe', reward: '₹5-20', color: 'bg-blue-600' },
    { icon: MessageCircle, name: 'Comments & Likes', reward: '₹5-15', color: 'bg-blue-500' },
    { icon: Eye, name: 'Video Views', reward: '₹5-30', color: 'bg-blue-600' }
  ];

  const stats = [
    { label: 'Active Users', value: '10,000+' },
    { label: 'Tasks Completed', value: '50,000+' },
    { label: 'Total Paid Out', value: '₹5,00,000+' },
    { label: 'Average Rating', value: '4.8/5' }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <Layout>
      {/* Modern Hero Slider Section */}
      <section className="relative h-screen overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : 
              index < currentSlide ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            <div className={`h-full bg-gradient-to-br ${slide.gradient} text-white relative`}>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-4xl">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                      {slide.title}
                    </h1>
                    <h2 className={`text-2xl md:text-3xl font-medium mb-6 ${slide.accent}`}>
                      {slide.subtitle}
                    </h2>
                    <p className="text-xl md:text-2xl mb-8 max-w-2xl opacity-90">
                      {slide.description}
                    </p>
                    <div className="flex justify-center sm:justify-start">
                      <Link href="/signup" className="w-full sm:w-auto max-w-sm sm:max-w-none">
                        <Button 
                          size="lg" 
                          className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 border-0 px-8 sm:px-10 py-4 sm:py-6 text-base sm:text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          {slide.buttonText}
                          <ArrowRight className="ml-2 w-5 h-5 sm:w-6 sm:h-6" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        

      </section>

      {/* Enhanced Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Platform Success Metrics</h2>
            <p className="text-xl text-blue-600">Real numbers from our growing community</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center group">
                <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col items-center justify-center min-h-[160px] md:min-h-[180px]">
                  <div className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full bg-gradient-to-br ${
                    index === 0 ? 'from-blue-500 to-blue-600' :
                    index === 1 ? 'from-blue-600 to-blue-700' :
                    index === 2 ? 'from-blue-700 to-blue-800' :
                    'from-blue-800 to-blue-900'
                  } flex items-center justify-center`}>
                    {index === 0 && <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />}
                    {index === 1 && <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-white" />}
                    {index === 2 && <Coins className="w-6 h-6 md:w-8 md:h-8 text-white" />}
                    {index === 3 && <Star className="w-6 h-6 md:w-8 md:h-8 text-white" />}
                  </div>
                  <div className="text-2xl md:text-4xl lg:text-5xl font-bold text-blue-900 mb-2 group-hover:scale-110 transition-transform leading-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm font-medium text-blue-600 text-center leading-tight px-1">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Task Categories with Animations */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-blue-100 rounded-full text-blue-600 font-medium mb-4">
              Earning Opportunities
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
              6 Ways to Earn Money
            </h2>
            <p className="text-xl text-blue-600 max-w-3xl mx-auto">
              Choose from multiple task categories and start earning immediately with our innovative platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {taskCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={category.name} className="group">
                  <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-gradient-to-br from-white to-blue-50">
                    <CardHeader className="pb-4">
                      <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold text-blue-900 group-hover:text-blue-700 transition-colors">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="text-2xl font-bold text-green-600 flex items-center">
                        <Coins className="w-5 h-5 mr-2" />
                        {category.reward}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-blue-600 leading-relaxed mb-4">
                        Complete {category.name.toLowerCase()} tasks and earn rewards instantly
                      </p>
                      <div className="flex items-center text-sm text-blue-500">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>5-30 minutes per task</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section with Modern Cards */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200 rounded-full -translate-x-32 -translate-y-32 opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full translate-x-48 translate-y-48 opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium mb-6">
              <Award className="w-4 h-4 mr-2" />
              Why Choose Us
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
              Why Choose Innovative Task Earn?
            </h2>
            <p className="text-xl text-blue-600 max-w-4xl mx-auto leading-relaxed">
              We make earning money online simple, secure, and rewarding with cutting-edge technology and user-first approach
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="group">
                  <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-blue-100 h-full">
                    <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-900 mb-4 text-center group-hover:text-blue-700 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-blue-600 text-center leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="mt-6 flex justify-center">
                      <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full group-hover:w-16 transition-all duration-300"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modern How It Works with Interactive Steps */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4 mr-2" />
              Getting Started
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-blue-600 max-w-3xl mx-auto">
              Start earning in 4 simple steps - it's easier than you think
            </p>
          </div>
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 transform -translate-x-1/2 -translate-y-1/2 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {[
                { 
                  step: '1', 
                  title: 'Sign Up', 
                  description: 'Create your free account in seconds with just your email',
                  icon: Users,
                  color: 'from-blue-500 to-blue-600'
                },
                { 
                  step: '2', 
                  title: 'Complete KYC', 
                  description: 'Verify your identity with secure ₹99 verification fee',
                  icon: Shield,
                  color: 'from-blue-600 to-blue-700'
                },
                { 
                  step: '3', 
                  title: 'Complete Tasks', 
                  description: 'Choose and complete tasks that match your interests',
                  icon: ListTodo,
                  color: 'from-blue-700 to-blue-800'
                },
                { 
                  step: '4', 
                  title: 'Get Paid', 
                  description: 'Receive instant payments directly to your bank account',
                  icon: Zap,
                  color: 'from-blue-800 to-blue-900'
                }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="text-center group">
                    <div className="relative">
                      <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-all duration-300`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-4 border-blue-600 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm shadow-lg">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-blue-900 mb-4 group-hover:text-blue-700 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-blue-600 leading-relaxed group-hover:text-blue-700 transition-colors">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Modern CTA Section with Gradient Animation */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-purple-600/30 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-20 left-32 w-12 h-12 bg-white/10 rounded-full animate-bounce delay-500"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium mb-6">
              <Globe className="w-5 h-5 mr-2" />
              Join Our Global Community
            </div>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Ready to Start Earning?
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-4xl mx-auto leading-relaxed">
            Join thousands of users who are already earning money daily through our innovative platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 px-4">
            <Link href="/signup" className="w-full sm:w-auto max-w-sm sm:max-w-none">
              <Button 
                size="lg" 
                className="w-full bg-white text-blue-600 hover:bg-blue-50 border-0 px-6 sm:px-10 py-4 sm:py-6 text-base sm:text-lg font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Create Free Account
                <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto max-w-sm sm:max-w-none">
              <Button 
                size="lg" 
                className="w-full bg-white/20 border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 sm:px-10 py-4 sm:py-6 text-base sm:text-lg font-bold backdrop-blur-sm transition-all duration-300"
              >
                Login to Dashboard
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300">
              <CheckCircle className="w-8 h-8 mb-3 text-green-300" />
              <span className="font-semibold text-lg">No Hidden Fees</span>
              <span className="text-blue-200 text-sm mt-1">100% Transparent Pricing</span>
            </div>
            <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300">
              <Zap className="w-8 h-8 mb-3 text-yellow-300" />
              <span className="font-semibold text-lg">Instant Payments</span>
              <span className="text-blue-200 text-sm mt-1">Get Paid Immediately</span>
            </div>
            <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300">
              <Shield className="w-8 h-8 mb-3 text-blue-300" />
              <span className="font-semibold text-lg">24/7 Support</span>
              <span className="text-blue-200 text-sm mt-1">Always Here to Help</span>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}