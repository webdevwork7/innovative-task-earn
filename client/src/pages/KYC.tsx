import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Input } from '../components/ui/input.tsx';
import { Label } from '../components/ui/label.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { Alert, AlertDescription } from '../components/ui/alert.tsx';
import { useToast } from '../hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { 
  Shield,
  Upload,
  FileText,
  User,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  IndianRupee,
  ChevronRight,
  Info
} from 'lucide-react';

interface KYCData {
  status: 'not_submitted' | 'documents_uploaded' | 'payment_pending' | 'payment_completed' | 'verified' | 'rejected';
  documentsUploaded: boolean;
  paymentStatus: 'pending' | 'completed';
  paymentAmount: number;
  documents: {
    aadhaar: { uploaded: boolean; verified: boolean; maskedNumber?: string };
    pan: { uploaded: boolean; verified: boolean; maskedNumber?: string };
    selfie: { uploaded: boolean; verified: boolean };
  };
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export default function KYC() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [documents, setDocuments] = useState({
    aadhaar: null as File | null,
    pan: null as File | null,
    selfie: null as File | null
  });
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    panNumber: '',
    fullName: ''
  });

  // Fetch KYC status
  const { data: kycData, isLoading } = useQuery({
    queryKey: ['/api/users/kyc'],
    enabled: !!user
  });

  // Safe data with defaults
  const safeKycData = {
    status: kycData?.status || 'not_submitted',
    documentsUploaded: kycData?.documentsUploaded || false,
    paymentStatus: kycData?.paymentStatus || 'pending',
    paymentAmount: kycData?.paymentAmount || 99,
    documents: kycData?.documents || {
      aadhaar: { uploaded: false, verified: false },
      pan: { uploaded: false, verified: false },
      selfie: { uploaded: false, verified: false }
    },
    submittedAt: kycData?.submittedAt || null,
    verifiedAt: kycData?.verifiedAt || null,
    rejectionReason: kycData?.rejectionReason || null
  } as KYCData;

  // Upload KYC documents
  const uploadDocumentsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/users/kyc/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload documents');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/kyc'] });
      toast({
        title: 'Documents Uploaded',
        description: 'Your documents have been uploaded successfully. Please proceed to payment.'
      });
      setStep(3); // Move to payment step
    },
    onError: (error: any) => {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload documents.',
        variant: 'destructive'
      });
    }
  });

  // Create payment session
  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/users/kyc/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.paymentUrl) {
        // Redirect to Cashfree payment page
        window.open(data.paymentUrl, '_blank');
        toast({
          title: 'Payment Session Created',
          description: 'Redirecting to payment gateway. Complete the ₹99 payment to verify your KYC.'
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to create payment session.',
        variant: 'destructive'
      });
    }
  });



  const handleFileChange = (field: string, file: File | null) => {
    setDocuments(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = () => {
    if (!documents.aadhaar || !documents.pan || !documents.selfie) {
      toast({
        title: 'Missing Documents',
        description: 'Please upload all required documents',
        variant: 'destructive'
      });
      return;
    }

    const data = {
      ...formData,
      aadhaarDoc: documents.aadhaar,
      panDoc: documents.pan,
      selfieDoc: documents.selfie
    };

    uploadDocumentsMutation.mutate(data);
  };

  const getStatusDisplay = () => {
    const status = safeKycData.status;
    const configs = {
      verified: {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        title: 'KYC Verified',
        description: 'Your account is fully verified and ready for withdrawals'
      },
      pending: {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        title: 'Verification Pending',
        description: 'Your documents are being reviewed. This usually takes 24-48 hours.'
      },
      rejected: {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        title: 'Verification Rejected',
        description: safeKycData.rejectionReason || 'Your documents were rejected. Please resubmit with valid documents.'
      },
      not_submitted: {
        icon: AlertCircle,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        title: 'KYC Not Submitted',
        description: 'Complete KYC verification to enable withdrawals'
      }
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
      <Card className={`${config.bgColor} border-2`}>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <Icon className={`w-8 h-8 ${config.color} flex-shrink-0`} />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{config.title}</h3>
              <p className="text-gray-600 mt-1">{config.description}</p>
              {status === 'verified' && safeKycData.verifiedAt && (
                <p className="text-sm text-gray-500 mt-2">
                  Verified on: {new Date(safeKycData.verifiedAt).toLocaleDateString()}
                </p>
              )}
              {status === 'pending' && safeKycData.submittedAt && (
                <p className="text-sm text-gray-500 mt-2">
                  Submitted on: {new Date(safeKycData.submittedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading KYC status...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // If already verified
  if (safeKycData.status === 'verified') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">KYC Verification</h1>
          {getStatusDisplay()}
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Verified Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-gray-600" />
                  Aadhaar Card
                </span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                  PAN Card
                </span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-gray-600" />
                  Selfie
                </span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // If pending
  if (safeKycData.status === 'pending') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">KYC Verification</h1>
          {getStatusDisplay()}
          
          <div className="mt-8 text-center">
            <Clock className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <p className="text-gray-600">
              We're reviewing your documents. You'll receive an email once verification is complete.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // KYC submission flow
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">KYC Verification</h1>
        
        {kycData?.status === 'rejected' && (
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {kycData.rejectionReason || 'Your previous KYC submission was rejected. Please resubmit with valid documents.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
            <ChevronRight className="text-gray-400" />
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Upload Documents</span>
            </div>
            <ChevronRight className="text-gray-400" />
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium">Verification</span>
            </div>
          </div>
        </div>

        {/* Step 1: Payment */}
        {step === 1 && kycData?.paymentStatus !== 'completed' && (
          <Card>
            <CardHeader>
              <CardTitle>KYC Verification Fee</CardTitle>
              <CardDescription>One-time processing fee for document verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium">Processing Fee</span>
                  <span className="text-2xl font-bold text-blue-600">₹99</span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    One-time payment
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Fast verification (24-48 hours)
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Secure document processing
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Enable withdrawals
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This fee covers the cost of manual document verification and secure storage.
                  Payment is non-refundable once documents are submitted.
                </AlertDescription>
              </Alert>

              <Button 
                className="w-full" 
                size="lg"
                onClick={() => createPaymentMutation.mutate()}
                disabled={createPaymentMutation.isPending}
              >
                <IndianRupee className="w-5 h-5 mr-2" />
                Pay ₹99 and Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Upload Documents */}
        {(step === 2 || (step === 1 && safeKycData.paymentStatus === 'completed')) && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>Please upload clear photos of your documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                  <Input
                    id="aadhaarNumber"
                    placeholder="XXXX XXXX XXXX"
                    value={formData.aadhaarNumber}
                    onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="panNumber">PAN Number</Label>
                  <Input
                    id="panNumber"
                    placeholder="ABCDE1234F"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fullName">Full Name (as per documents)</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="aadhaar">Aadhaar Card (Front & Back)</Label>
                  <div className="mt-2">
                    <Input
                      id="aadhaar"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('aadhaar', e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Upload both sides in a single file</p>
                </div>

                <div>
                  <Label htmlFor="pan">PAN Card</Label>
                  <div className="mt-2">
                    <Input
                      id="pan"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('pan', e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="selfie">Live Selfie</Label>
                  <div className="mt-2">
                    <Input
                      id="selfie"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('selfie', e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Take a clear selfie with good lighting</p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Ensure all documents are clear and readable. Blurry or incomplete documents will be rejected.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  disabled={uploadDocumentsMutation.isPending}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={uploadDocumentsMutation.isPending || !documents.aadhaar || !documents.pan || !documents.selfie}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadDocumentsMutation.isPending ? 'Uploading...' : 'Upload Documents & Continue to Payment'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Complete Payment</CardTitle>
              <CardDescription>Pay ₹99 KYC verification fee to complete the process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your documents have been uploaded successfully. Complete the payment to submit for verification.
                </AlertDescription>
              </Alert>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium">KYC Verification Fee</span>
                  <span className="text-2xl font-bold text-blue-600">₹99</span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    One-time verification fee
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Secure payment via Cashfree
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Fast verification (24-48 hours)
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Enable withdrawals upon approval
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This payment is non-refundable and covers manual document verification costs. 
                  You will be redirected to Cashfree's secure payment gateway.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(2)}
                  disabled={createPaymentMutation.isPending}
                >
                  Back to Documents
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="lg"
                  onClick={() => createPaymentMutation.mutate()}
                  disabled={createPaymentMutation.isPending}
                >
                  <IndianRupee className="w-5 h-5 mr-2" />
                  {createPaymentMutation.isPending ? 'Creating Payment...' : 'Pay ₹99 via Cashfree'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}