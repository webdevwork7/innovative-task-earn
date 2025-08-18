import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.tsx';
import { Button } from '../../components/ui/button.tsx';
import { Badge } from '../../components/ui/badge.tsx';
import { Input } from '../../components/ui/input.tsx';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Search,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  Filter,
  RefreshCw,
  User,
  Calendar,
  Shield
} from 'lucide-react';

export default function AdminKYC() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Check admin access
  React.useEffect(() => {
    if (!user) {
      setLocation('/login');
    } else if (user.role !== 'admin') {
      setLocation('/users/dashboard');
    }
  }, [user, setLocation]);

  // Fetch KYC submissions
  const { data: kycSubmissions = [], isLoading } = useQuery({
    queryKey: ['/api/admin/kyc', filterStatus],
    enabled: !!user && user.role === 'admin',
    initialData: [
      {
        id: 1,
        userId: 'user-001',
        userName: 'John Doe',
        email: 'john@example.com',
        submittedDate: '2024-08-15',
        status: 'pending',
        documents: {
          aadhaar: { uploaded: true, verified: false, number: 'XXXX-XXXX-1234' },
          pan: { uploaded: true, verified: false, number: 'ABCDE1234F' },
          bank: { uploaded: true, verified: false, accountNumber: 'XXXX1234' }
        },
        paymentStatus: 'completed',
        paymentAmount: 99
      },
      {
        id: 2,
        userId: 'user-002',
        userName: 'Jane Smith',
        email: 'jane@example.com',
        submittedDate: '2024-08-14',
        status: 'verified',
        documents: {
          aadhaar: { uploaded: true, verified: true, number: 'XXXX-XXXX-5678' },
          pan: { uploaded: true, verified: true, number: 'XYZAB5678C' },
          bank: { uploaded: true, verified: true, accountNumber: 'XXXX5678' }
        },
        paymentStatus: 'completed',
        paymentAmount: 99
      },
      {
        id: 3,
        userId: 'user-003',
        userName: 'Mike Johnson',
        email: 'mike@example.com',
        submittedDate: '2024-08-13',
        status: 'rejected',
        documents: {
          aadhaar: { uploaded: true, verified: false, number: 'XXXX-XXXX-9012' },
          pan: { uploaded: true, verified: false, number: 'PQRST9012D' },
          bank: { uploaded: false, verified: false, accountNumber: '' }
        },
        paymentStatus: 'completed',
        paymentAmount: 99,
        rejectionReason: 'Bank statement not uploaded'
      }
    ]
  });

  // Filter submissions
  const filteredSubmissions = kycSubmissions.filter((submission: any) => {
    const matchesSearch = submission.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || submission.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const handleApprove = (submissionId: number) => {
    console.log('Approving KYC:', submissionId);
    // API call to approve KYC
  };

  const handleReject = (submissionId: number) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      console.log('Rejecting KYC:', submissionId, reason);
      // API call to reject KYC
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">KYC Management</h1>
          <p className="text-gray-600 mt-2">
            Review and verify user KYC documents for payout eligibility
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold">{kycSubmissions.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {kycSubmissions.filter((s: any) => s.status === 'pending').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verified</p>
                  <p className="text-2xl font-bold text-green-600">
                    {kycSubmissions.filter((s: any) => s.status === 'verified').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {kycSubmissions.filter((s: any) => s.status === 'rejected').length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('pending')}
                >
                  Pending
                </Button>
                <Button
                  variant={filterStatus === 'verified' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('verified')}
                >
                  Verified
                </Button>
                <Button
                  variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('rejected')}
                >
                  Rejected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KYC Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>KYC Submissions</CardTitle>
            <CardDescription>Review and manage user KYC documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Documents</th>
                    <th className="text-left py-3 px-4">Submitted</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Payment</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission: any) => (
                    <tr key={submission.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{submission.userName}</p>
                          <p className="text-sm text-gray-500">{submission.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {submission.documents.aadhaar.uploaded && (
                            <Badge variant="outline" className="text-xs">Aadhaar</Badge>
                          )}
                          {submission.documents.pan.uploaded && (
                            <Badge variant="outline" className="text-xs">PAN</Badge>
                          )}
                          {submission.documents.bank.uploaded && (
                            <Badge variant="outline" className="text-xs">Bank</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {new Date(submission.submittedDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(submission.status)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="bg-green-100 text-green-800">
                          ₹{submission.paymentAmount}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUser(submission)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {submission.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleApprove(submission.id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleReject(submission.id)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}