import React from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Shield, FileText, Users, AlertCircle, Scale, Globe } from 'lucide-react';

export default function Terms() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing and using the Innovative Task Earn platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.`
    },
    {
      title: '2. Eligibility',
      content: `You must be at least 18 years old to use our services. By registering, you represent that you are of legal age and have the legal capacity to enter into this agreement.`
    },
    {
      title: '3. Account Registration',
      content: `You must provide accurate, complete, and current information during registration. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.`
    },
    {
      title: '4. KYC Verification',
      content: `To withdraw earnings, you must complete our Know Your Customer (KYC) verification process. This includes submitting valid government-issued identification documents and paying a one-time verification fee of ₹99.`
    },
    {
      title: '5. Task Completion',
      content: `Tasks must be completed honestly and according to the provided instructions. Any fraudulent activity, including using bots, fake accounts, or providing false information, will result in immediate account termination and forfeiture of earnings.`
    },
    {
      title: '6. Earnings and Payments',
      content: `Earnings are credited to your account upon task approval by our team. Withdrawals require a minimum balance of ₹500 and are processed weekly on Tuesdays. Payment processing may take 24-48 hours.`
    },
    {
      title: '7. Referral Program',
      content: `You earn ₹49 for each referred user who successfully completes KYC verification. Referral earnings are subject to verification and anti-fraud measures. Self-referrals or fraudulent referrals will result in account suspension.`
    },
    {
      title: '8. Prohibited Activities',
      content: `The following activities are strictly prohibited:
      • Creating multiple accounts
      • Using automated tools or bots
      • Providing false or misleading information
      • Sharing account credentials
      • Engaging in any illegal activities
      • Manipulating or gaming the system`
    },
    {
      title: '9. Account Suspension',
      content: `We reserve the right to suspend or terminate accounts that violate these terms. Suspended accounts may forfeit pending earnings. A reactivation fee of ₹49 may be required for suspended accounts, subject to review.`
    },
    {
      title: '10. Intellectual Property',
      content: `All content on the platform, including text, graphics, logos, and software, is the property of Innovative Task Earn or its licensors and is protected by copyright laws.`
    },
    {
      title: '11. Privacy and Data Protection',
      content: `We collect and process your personal data in accordance with our Privacy Policy. By using our services, you consent to such processing and warrant that all data provided is accurate.`
    },
    {
      title: '12. Limitation of Liability',
      content: `To the maximum extent permitted by law, Innovative Task Earn shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the platform.`
    },
    {
      title: '13. Indemnification',
      content: `You agree to indemnify and hold harmless Innovative Task Earn, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your violation of these terms.`
    },
    {
      title: '14. Modifications to Terms',
      content: `We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the modified terms.`
    },
    {
      title: '15. Governing Law',
      content: `These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Haryana, India.`
    },
    {
      title: '16. Contact Information',
      content: `For questions about these Terms of Service, please contact us at:
      Email: support@innovativetaskearn.online
      Address: Innovative Grow Solutions Private Limited, Haryana, India`
    }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Scale className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Introduction Card */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <Shield className="w-5 h-5 mr-2" />
              Legal Agreement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800">
              These Terms of Service constitute a legally binding agreement between you and
              Innovative Grow Solutions Private Limited (operating as "Innovative Task Earn").
              Please read these terms carefully before using our platform.
            </p>
          </CardContent>
        </Card>

        {/* Terms Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{section.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Note */}
        <Card className="mt-8 bg-gray-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Important Note:</p>
                <p>
                  By clicking "I Agree" during registration or by using our services, you acknowledge
                  that you have read, understood, and agree to be bound by these Terms of Service
                  and our Privacy Policy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}