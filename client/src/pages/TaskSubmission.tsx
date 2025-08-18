import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Button } from '../components/ui/button.tsx';
import { Input } from '../components/ui/input.tsx';
import { Label } from '../components/ui/label.tsx';
import { Alert, AlertDescription } from '../components/ui/alert.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { useAuth } from '../hooks/useAuth.tsx';
import { useLocation, useRoute } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import {
  Upload,
  Camera,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  IndianRupee,
  Timer,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Send
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  reward: number;
  timeLimit: number;
  requirements: string[];
  proofType: 'screenshot' | 'link' | 'text';
  status?: 'pending' | 'approved' | 'rejected';
}

export default function TaskSubmission() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/tasks/:id/submit');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofLink, setProofLink] = useState('');
  const [proofText, setProofText] = useState('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch task details
  const { data: task, isLoading } = useQuery({
    queryKey: ['/api/tasks', params?.id],
    enabled: !!params?.id,
    queryFn: async () => {
      // Mock task data for development
      return {
        id: params?.id,
        title: 'Download Amazon Shopping App',
        description: 'Download and install the Amazon Shopping app on your mobile device. Open the app and take a screenshot of the home screen showing you are logged in.',
        category: 'app_download',
        reward: 15,
        timeLimit: 20,
        requirements: [
          'Download the app from official store (Play Store/App Store)',
          'Create an account or log in',
          'Take a clear screenshot of the home screen',
          'Screenshot must show your username or profile',
          'Submit within 20 minutes of starting the task'
        ],
        proofType: 'screenshot'
      };
    }
  });

  // Check if user has already submitted this task
  const { data: submission } = useQuery({
    queryKey: ['/api/tasks', params?.id, 'submission'],
    enabled: !!params?.id && !!user,
    queryFn: async () => {
      // Check if user has submitted this task
      return null; // or existing submission
    }
  });

  // Submit task mutation
  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`/api/tasks/${params?.id}/submit`, {
        method: 'POST',
        body: data,
        credentials: 'include'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: 'Task Submitted Successfully',
        description: 'Your submission is under review. You will receive your reward once approved.'
      });
      setLocation('/tasks');
    },
    onError: (error: any) => {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit task. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Check if user is logged in
  React.useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  if (!user || !match) {
    return null;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Task not found</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  if (submission) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              You have already submitted this task. Status: {submission.status || 'Pending Review'}
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File Too Large',
          description: 'Please upload a file smaller than 5MB',
          variant: 'destructive'
        });
        return;
      }
      setProofFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (task.proofType === 'screenshot' && !proofFile) {
      toast({
        title: 'Screenshot Required',
        description: 'Please upload a screenshot as proof',
        variant: 'destructive'
      });
      return;
    }
    
    if (task.proofType === 'link' && !proofLink) {
      toast({
        title: 'Link Required',
        description: 'Please provide a link as proof',
        variant: 'destructive'
      });
      return;
    }
    
    if (task.proofType === 'text' && !proofText) {
      toast({
        title: 'Description Required',
        description: 'Please provide a text description as proof',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    const formData = new FormData();
    if (proofFile) {
      formData.append('proof', proofFile);
    }
    if (proofLink) {
      formData.append('proofLink', proofLink);
    }
    if (proofText) {
      formData.append('proofText', proofText);
    }
    formData.append('comments', comments);
    formData.append('taskId', task.id);

    submitMutation.mutate(formData);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      app_download: 'bg-blue-100 text-blue-800',
      business_review: 'bg-purple-100 text-purple-800',
      product_review: 'bg-green-100 text-green-800',
      channel_subscribe: 'bg-red-100 text-red-800',
      comment_like: 'bg-yellow-100 text-yellow-800',
      youtube_video_see: 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/tasks')}
            className="mb-4"
          >
            ← Back to Tasks
          </Button>
          <h1 className="text-3xl font-bold text-blue-900">Submit Task</h1>
          <p className="text-blue-600 mt-2">Complete the task and submit your proof</p>
        </div>

        {/* Task Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{task.title}</CardTitle>
                <CardDescription className="mt-2">{task.description}</CardDescription>
              </div>
              <div className="text-right">
                <Badge className={getCategoryColor(task.category)}>
                  {task.category.replace('_', ' ')}
                </Badge>
                <div className="flex items-center mt-2 text-2xl font-bold text-blue-700">
                  <IndianRupee className="w-6 h-6 mr-1" />
                  {task.reward}
                </div>
                <div className="flex items-center text-sm text-blue-600 mt-1">
                  <Timer className="w-4 h-4 mr-1" />
                  {task.timeLimit} mins
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="font-semibold mb-2">Requirements:</h3>
              <ul className="space-y-2">
                {task.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit Your Proof</CardTitle>
            <CardDescription>
              Upload your proof to complete this task
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Screenshot Upload */}
              {task.proofType === 'screenshot' && (
                <div>
                  <Label htmlFor="proof">Upload Screenshot</Label>
                  <div className="mt-2">
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        id="proof"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="proof" className="cursor-pointer">
                        {proofFile ? (
                          <div className="space-y-2">
                            <ImageIcon className="w-12 h-12 text-blue-500 mx-auto" />
                            <p className="text-sm font-medium">{proofFile.name}</p>
                            <p className="text-xs text-blue-600">Click to change file</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-12 h-12 text-blue-400 mx-auto" />
                            <p className="text-sm font-medium">Click to upload screenshot</p>
                            <p className="text-xs text-blue-600">PNG, JPG up to 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Link Input */}
              {task.proofType === 'link' && (
                <div>
                  <Label htmlFor="proofLink">Proof Link</Label>
                  <div className="relative mt-2">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <Input
                      id="proofLink"
                      type="url"
                      placeholder="https://example.com/proof"
                      value={proofLink}
                      onChange={(e) => setProofLink(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Text Input */}
              {task.proofType === 'text' && (
                <div>
                  <Label htmlFor="proofText">Proof Description</Label>
                  <textarea
                    id="proofText"
                    rows={4}
                    placeholder="Describe how you completed the task..."
                    value={proofText}
                    onChange={(e) => setProofText(e.target.value)}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              {/* Additional Comments */}
              <div>
                <Label htmlFor="comments">Additional Comments (Optional)</Label>
                <textarea
                  id="comments"
                  rows={3}
                  placeholder="Any additional information..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Important Notes */}
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Important:</strong> Make sure your proof clearly shows task completion. 
                  Incomplete or unclear submissions may be rejected. Approval typically takes 5-20 minutes.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || submitMutation.isPending}
              >
                {isSubmitting || submitMutation.isPending ? (
                  <>Submitting...</>
                ) : (
                  <>
                    Submit Task for Review
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}