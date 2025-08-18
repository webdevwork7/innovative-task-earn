import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { Layout } from '../components/Layout';
import { Link } from 'wouter';
import { Button } from '../components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Input } from '../components/ui/input.tsx';
import { Badge } from '../components/ui/badge.tsx';
import { useQuery } from '@tanstack/react-query';
import { 
  Search,
  Filter,
  Clock,
  IndianRupee,
  Smartphone,
  Star,
  FileText,
  Youtube,
  MessageCircle,
  Eye,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const categoryIcons: Record<string, any> = {
  app_download: Smartphone,
  business_review: Star,
  product_review: FileText,
  channel_subscribe: Youtube,
  comment_like: MessageCircle,
  youtube_video_see: Eye
};

const categoryColors: Record<string, string> = {
  app_download: 'bg-blue-100 text-blue-800',
  business_review: 'bg-yellow-100 text-yellow-800',
  product_review: 'bg-green-100 text-green-800',
  channel_subscribe: 'bg-red-100 text-red-800',
  comment_like: 'bg-purple-100 text-purple-800',
  youtube_video_see: 'bg-indigo-100 text-indigo-800'
};

export default function Tasks() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Filter tasks based on search and category
  const filteredTasks = tasks.filter((task: any) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || task.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'app_download', name: 'App Downloads', count: 0 },
    { id: 'business_review', name: 'Business Reviews', count: 0 },
    { id: 'product_review', name: 'Product Reviews', count: 0 },
    { id: 'channel_subscribe', name: 'Channel Subscribe', count: 0 },
    { id: 'comment_like', name: 'Comments & Likes', count: 0 },
    { id: 'youtube_video_see', name: 'Video Views', count: 0 }
  ];

  // Count tasks per category
  tasks.forEach((task: any) => {
    const cat = categories.find(c => c.id === task.category);
    if (cat) cat.count++;
  });

  const formatCategory = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Tasks</h1>
          <p className="text-gray-600 mt-2">
            Complete tasks and earn money instantly
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tasks..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Tasks ({tasks.length})
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </div>

        {/* Tasks Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No tasks found matching your criteria</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory(null);
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task: any) => {
              const Icon = categoryIcons[task.category] || TrendingUp;
              const categoryColor = categoryColors[task.category] || 'bg-gray-100 text-gray-800';
              
              return (
                <Card key={task.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className={`p-2 rounded-lg ${categoryColor.split(' ')[0]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge className={categoryColor}>
                        {formatCategory(task.category)}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <CardDescription>
                      {task.description || `Complete this ${formatCategory(task.category)} task`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <IndianRupee className="w-4 h-4 mr-1" />
                          <span>Reward</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          ₹{task.reward}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>Time Limit</span>
                        </div>
                        <span className="text-sm font-medium">
                          {task.timeLimit} mins
                        </span>
                      </div>
                      {task.requirements && task.requirements.length > 0 && (
                        <div className="pt-3 border-t">
                          <p className="text-xs font-medium text-gray-700 mb-1">Requirements:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {task.requirements.slice(0, 2).map((req: string, i: number) => (
                              <li key={i} className="flex items-start">
                                <span className="mr-1">•</span>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {user ? (
                      <Link href={`/tasks/${task.id}/submit`}>
                        <Button className="w-full">
                          Start Task
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    ) : (
                      <Button className="w-full" variant="outline" disabled>
                        Login to Start
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            How to Complete Tasks
          </h3>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="font-medium mr-2">1.</span>
              <span>Choose a task that interests you and click "Start Task"</span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">2.</span>
              <span>Follow the task instructions carefully</span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">3.</span>
              <span>Submit proof of completion (screenshot or description)</span>
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">4.</span>
              <span>Get paid instantly after admin approval (usually within 5-20 minutes)</span>
            </li>
          </ol>
        </div>
      </div>
    </Layout>
  );
}