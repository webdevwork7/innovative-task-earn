import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Button } from '../components/ui/button.tsx';
import { 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  DollarSign,
  UserCheck,
  CreditCard,
  Shield,
  Gift,
  Clock,
  AlertCircle
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const faqs: FAQItem[] = [
    // Getting Started
    {
      category: 'Getting Started',
      question: 'How do I start earning on Innovative Task Earn?',
      answer: 'Sign up for a free account, complete your profile, verify your KYC (one-time ₹99 fee), and start completing tasks. Each task has clear instructions and rewards.'
    },
    {
      category: 'Getting Started',
      question: 'What types of tasks are available?',
      answer: 'We offer 6 categories of tasks: App Downloads (₹5-25), Business Reviews (₹5-35), Product Reviews (₹5-40), Channel Subscribe (₹5-20), Comments & Likes (₹5-15), and YouTube Video Views (₹5-30).'
    },
    {
      category: 'Getting Started',
      question: 'Is Innovative Task Earn legitimate?',
      answer: 'Yes! We are operated by Innovative Grow Solutions Private Limited (GST: 06AAGCI9044P1ZZ), a registered company in Haryana, India. All tasks are from verified business partners.'
    },
    
    // Earnings & Payments
    {
      category: 'Earnings & Payments',
      question: 'How much can I earn?',
      answer: 'Earnings depend on task completion. Tasks pay ₹5-40 each, taking 5-30 minutes. Active users typically earn ₹500-5000 per month.'
    },
    {
      category: 'Earnings & Payments',
      question: 'When can I withdraw my earnings?',
      answer: 'You can request a payout once you reach ₹500 minimum balance. Payouts are processed weekly on Tuesdays and take 24-48 hours to reach your account.'
    },
    {
      category: 'Earnings & Payments',
      question: 'What payment methods are supported?',
      answer: 'We support UPI, bank transfer, and popular digital wallets. Payment details are configured during KYC verification.'
    },
    {
      category: 'Earnings & Payments',
      question: 'Are there any hidden fees?',
      answer: 'The only fee is the one-time ₹99 KYC verification fee. There are no withdrawal fees or hidden charges.'
    },
    
    // KYC Verification
    {
      category: 'KYC Verification',
      question: 'Why is KYC verification required?',
      answer: 'KYC verification ensures platform security, prevents fraud, and enables secure payments. It\'s a one-time process required by financial regulations.'
    },
    {
      category: 'KYC Verification',
      question: 'What documents are needed for KYC?',
      answer: 'You need: 1) Aadhaar Card (front & back), 2) PAN Card, and 3) A clear selfie. All documents must be readable and valid.'
    },
    {
      category: 'KYC Verification',
      question: 'How long does KYC verification take?',
      answer: 'KYC verification typically takes 24-48 hours. You\'ll receive an email notification once approved.'
    },
    {
      category: 'KYC Verification',
      question: 'Is the ₹99 KYC fee refundable?',
      answer: 'The KYC fee is non-refundable as it covers manual verification and secure document processing costs.'
    },
    
    // Tasks & Completion
    {
      category: 'Tasks & Completion',
      question: 'How do I complete a task?',
      answer: '1) Select a task from available list, 2) Follow the instructions carefully, 3) Complete the required action, 4) Submit proof (screenshot/photo), 5) Wait for approval (5-20 minutes).'
    },
    {
      category: 'Tasks & Completion',
      question: 'Why was my task rejected?',
      answer: 'Common reasons: Incorrect proof submission, incomplete task, blurry screenshots, or not following instructions. Always read requirements carefully.'
    },
    {
      category: 'Tasks & Completion',
      question: 'How many tasks can I complete daily?',
      answer: 'There\'s no daily limit! Complete as many tasks as you want. New tasks are added regularly throughout the day.'
    },
    {
      category: 'Tasks & Completion',
      question: 'Can I redo a rejected task?',
      answer: 'Yes, you can retry rejected tasks after addressing the rejection reason. Make sure to follow instructions precisely.'
    },
    
    // Referral Program
    {
      category: 'Referral Program',
      question: 'How does the referral program work?',
      answer: 'Share your unique referral code with friends. When they sign up and complete KYC verification, you earn ₹49 instantly.'
    },
    {
      category: 'Referral Program',
      question: 'Is there a limit on referral earnings?',
      answer: 'No limit! Refer as many friends as you want. Each verified referral earns you ₹49.'
    },
    {
      category: 'Referral Program',
      question: 'When do I receive referral bonuses?',
      answer: 'Referral bonuses are credited instantly when your referred friend completes KYC verification.'
    },
    
    // Account & Security
    {
      category: 'Account & Security',
      question: 'Can I have multiple accounts?',
      answer: 'No. Multiple accounts are strictly prohibited and will result in permanent ban and forfeiture of earnings.'
    },
    {
      category: 'Account & Security',
      question: 'What if I forget my password?',
      answer: 'Click "Forgot Password" on the login page. We\'ll send password reset instructions to your registered email.'
    },
    {
      category: 'Account & Security',
      question: 'Why was my account suspended?',
      answer: 'Common reasons: Policy violations, fraudulent activity, or multiple accounts. Suspended accounts may be reactivated after review and ₹49 reactivation fee.'
    },
    {
      category: 'Account & Security',
      question: 'Is my personal data safe?',
      answer: 'Yes! We use industry-standard encryption and security measures. Read our Privacy Policy for detailed information.'
    },
    
    // Technical Issues
    {
      category: 'Technical Issues',
      question: 'The website is not loading properly. What should I do?',
      answer: 'Try: 1) Clear browser cache and cookies, 2) Try a different browser, 3) Check internet connection, 4) Disable ad blockers. If issues persist, contact support.'
    },
    {
      category: 'Technical Issues',
      question: 'I completed a task but didn\'t receive payment.',
      answer: 'Check task status in your dashboard. If approved but not credited, contact support with task ID and screenshots.'
    }
  ];

  const categories = ['all', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      'Getting Started': HelpCircle,
      'Earnings & Payments': DollarSign,
      'KYC Verification': UserCheck,
      'Tasks & Completion': CreditCard,
      'Referral Program': Gift,
      'Account & Security': Shield,
      'Technical Issues': AlertCircle
    };
    return icons[category] || HelpCircle;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about Innovative Task Earn
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Items */}
        {filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No FAQs found matching your search.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => {
              const Icon = getCategoryIcon(faq.category);
              const isExpanded = expandedItems.includes(index);
              
              return (
                <Card key={index} className="overflow-hidden">
                  <CardHeader 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpand(index)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Icon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                          <p className="text-sm text-gray-500 mt-1">{faq.category}</p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="pt-0 pb-6">
                      <p className="text-gray-700 ml-8">{faq.answer}</p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Still Need Help */}
        <Card className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-bold mb-3">Still have questions?</h2>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you 24/7
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.href = '/contact'}>
                Contact Support
              </Button>
              <Button variant="outline">
                <Clock className="w-4 h-4 mr-2" />
                Live Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}