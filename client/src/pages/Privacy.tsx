import React from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Lock, Eye, Shield, Database, Globe, Mail, FileText } from 'lucide-react';

export default function Privacy() {
  const sections = [
    {
      title: '1. Information We Collect',
      icon: Database,
      content: `We collect the following types of information:
      
      Personal Information:
      • Name and contact details (email, phone number)
      • Government-issued ID documents (for KYC verification)
      • Payment information
      • Profile information
      
      Usage Information:
      • Task completion data
      • Platform interaction data
      • Device and browser information
      • IP address and location data`
    },
    {
      title: '2. How We Use Your Information',
      icon: Eye,
      content: `We use your information to:
      • Provide and maintain our services
      • Process your account registration and KYC verification
      • Track and credit your earnings
      • Process payments and withdrawals
      • Send important notifications about your account
      • Prevent fraud and ensure platform security
      • Improve our services and user experience
      • Comply with legal obligations`
    },
    {
      title: '3. Information Sharing',
      icon: Globe,
      content: `We do not sell your personal information. We may share your information with:
      • Payment processors for transaction processing
      • KYC verification partners
      • Law enforcement when required by law
      • Service providers who assist in platform operations
      
      All third parties are required to maintain confidentiality and use your information only for specified purposes.`
    },
    {
      title: '4. Data Security',
      icon: Shield,
      content: `We implement industry-standard security measures to protect your information:
      • Encryption of sensitive data in transit and at rest
      • Secure servers and databases
      • Regular security audits and updates
      • Limited access to personal information
      • Two-factor authentication options
      
      However, no method of transmission over the internet is 100% secure.`
    },
    {
      title: '5. Data Retention',
      icon: Database,
      content: `We retain your information for as long as necessary to:
      • Maintain your account
      • Comply with legal obligations
      • Resolve disputes
      • Enforce our agreements
      
      Inactive accounts may be deleted after 2 years of inactivity.`
    },
    {
      title: '6. Your Rights',
      icon: FileText,
      content: `You have the right to:
      • Access your personal information
      • Correct inaccurate information
      • Request deletion of your account
      • Opt-out of marketing communications
      • Download your data
      • Lodge a complaint with data protection authorities
      
      To exercise these rights, contact us at privacy@innovativetaskearn.online`
    },
    {
      title: '7. Cookies and Tracking',
      content: `We use cookies and similar technologies to:
      • Keep you logged in
      • Remember your preferences
      • Analyze platform usage
      • Prevent fraud
      
      You can control cookies through your browser settings, but some features may not work properly without them.`
    },
    {
      title: '8. Children\'s Privacy',
      content: `Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we discover that a child has provided us with personal information, we will delete it immediately.`
    },
    {
      title: '9. International Data Transfers',
      content: `Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this privacy policy.`
    },
    {
      title: '10. Changes to Privacy Policy',
      content: `We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of our services after changes constitutes acceptance.`
    },
    {
      title: '11. Contact Us',
      icon: Mail,
      content: `If you have questions about this Privacy Policy or our data practices, contact us at:
      
      Data Protection Officer
      Innovative Grow Solutions Private Limited
      Email: privacy@innovativetaskearn.online
      Address: Haryana, India
      GST: 06AAGCI9044P1ZZ`
    }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Lock className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
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
              Your Privacy Matters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800">
              At Innovative Task Earn, we are committed to protecting your privacy and ensuring
              the security of your personal information. This Privacy Policy explains how we
              collect, use, share, and protect your information when you use our platform.
            </p>
          </CardContent>
        </Card>

        {/* Privacy Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  {section.icon && <section.icon className="w-5 h-5 mr-2 text-blue-600" />}
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{section.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* GDPR Compliance Note */}
        <Card className="mt-8 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">GDPR Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-800">
              We comply with the General Data Protection Regulation (GDPR) for users in the
              European Union. This includes providing you with rights to access, correct,
              delete, and port your data, as well as the right to object to certain processing.
            </p>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            For more information, see our{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
              Terms of Service
            </a>
            {' '}or{' '}
            <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact Us
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}