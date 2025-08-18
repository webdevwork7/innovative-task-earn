import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.tsx';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Label } from '../../components/ui/label.tsx';
import { Badge } from '../../components/ui/badge.tsx';
import { Alert, AlertDescription } from '../../components/ui/alert.tsx';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'wouter';
import { useToast } from '../../hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../lib/queryClient';
import { 
  ListTodo,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Timer,
  MoreVertical,
  Download,
  Upload,
  TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu.tsx';

interface Task {
  id: string;
  title: string;
  category: string;
  description: string;
  reward: number;
  timeLimit: number;
  status: 'active' | 'inactive' | 'pending';
  completions: number;
  approvalRate: number;
  createdDate: string;
  createdBy: string;
}

export default function AdminTasks() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    category: '',
    description: '',
    reward: '',
    timeLimit: '',
    requirements: ''
  });

  // Check admin access with useEffect to avoid render-time updates
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      setLocation('/dashboard');
    }
  }, [user, setLocation]);

  // Show loading while checking auth
  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  // Don't render admin content for non-admin users
  if (user.role !== 'admin') {
    return null;
  }

  // Fetch tasks from API
  const { data: tasks = [], isLoading: tasksLoading, refetch: refetchTasks } = useQuery<Task[]>({
    queryKey: ['/api/admin/tasks'],
    enabled: !!user && user.role === 'admin'
  });

  const categories = [
    { value: 'app_download', label: 'App Downloads' },
    { value: 'business_review', label: 'Business Reviews' },
    { value: 'product_review', label: 'Product Reviews' },
    { value: 'channel_subscribe', label: 'Channel Subscribe' },
    { value: 'comment_like', label: 'Comments & Likes' },
    { value: 'youtube_video_see', label: 'YouTube Video View' }
  ];

  const filteredTasks = (tasks as Task[]).filter((task: Task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || task.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const handleTaskAction = async (taskId: string, action: string) => {
    try {
      // API call would go here
      toast({
        title: 'Action Completed',
        description: `Task ${action} successfully`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} task`,
        variant: 'destructive'
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedTasks.length === 0) {
      toast({
        title: 'No tasks selected',
        description: 'Please select tasks to perform bulk action',
        variant: 'destructive'
      });
      return;
    }

    try {
      // API call would go here
      toast({
        title: 'Bulk Action Completed',
        description: `${selectedTasks.length} tasks ${action} successfully`
      });
      setSelectedTasks([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} tasks`,
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'destructive',
      pending: 'secondary'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create task');
      }

      return response.json();
    },
    onSuccess: () => {
      refetchTasks();
      setShowCreateModal(false);
      setNewTask({
        title: '',
        category: '',
        description: '',
        reward: '',
        timeLimit: '',
        requirements: ''
      });
      toast({
        title: 'Success',
        description: 'Task created successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create task',
        variant: 'destructive'
      });
    }
  });

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.category || !newTask.description || !newTask.reward || !newTask.timeLimit) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    createTaskMutation.mutate(newTask);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900 flex items-center">
            <ListTodo className="w-8 h-8 mr-3" />
            Manage Tasks
          </h1>
          <p className="text-blue-600 mt-2">
            Create and manage platform tasks
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Total Tasks</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
                <ListTodo className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Active Tasks</p>
                  <p className="text-2xl font-bold">124</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Completions Today</p>
                  <p className="text-2xl font-bold">1,234</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Avg Approval Rate</p>
                  <p className="text-2xl font-bold">92.5%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
                {selectedTasks.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Bulk Actions ({selectedTasks.length})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBulkAction('activated')}>
                        Activate Selected
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('deactivated')}>
                        Deactivate Selected
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('deleted')} className="text-red-600">
                        Delete Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Task List</CardTitle>
            <CardDescription>
              {filteredTasks.length} tasks found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTasks(filteredTasks.map(t => t.id));
                          } else {
                            setSelectedTasks([]);
                          }
                        }}
                        checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                      />
                    </th>
                    <th className="text-left p-4">Task</th>
                    <th className="text-left p-4">Category</th>
                    <th className="text-left p-4">Reward</th>
                    <th className="text-left p-4">Time Limit</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Completions</th>
                    <th className="text-left p-4">Approval Rate</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTasks([...selectedTasks, task.id]);
                            } else {
                              setSelectedTasks(selectedTasks.filter(id => id !== task.id));
                            }
                          }}
                        />
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-gray-500">{task.description}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {getCategoryLabel(task.category)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="font-medium">₹{task.reward}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <Timer className="w-4 h-4 text-gray-400 mr-1" />
                          <span>{task.timeLimit} min</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(task.status)}
                      </td>
                      <td className="p-4">
                        <p>{task.completions.toLocaleString()}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${task.approvalRate}%` }}
                            />
                          </div>
                          <span className="text-sm">{task.approvalRate}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Task
                            </DropdownMenuItem>
                            {task.status === 'active' ? (
                              <DropdownMenuItem onClick={() => handleTaskAction(task.id, 'deactivated')}>
                                <XCircle className="w-4 h-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleTaskAction(task.id, 'activated')}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleTaskAction(task.id, 'deleted')}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import Tasks
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Tasks
              </Button>
              <Button variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create Task Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-blue-900">Create New Task</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                    disabled={createTaskMutation.isPending}
                  >
                    ✕
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Task Title *</Label>
                    <Input
                      id="title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Enter task title"
                      disabled={createTaskMutation.isPending}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={createTaskMutation.isPending}
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Enter detailed task description"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={createTaskMutation.isPending}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reward">Reward (₹) *</Label>
                      <Input
                        id="reward"
                        type="number"
                        value={newTask.reward}
                        onChange={(e) => setNewTask({ ...newTask, reward: e.target.value })}
                        placeholder="0"
                        min="1"
                        disabled={createTaskMutation.isPending}
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeLimit">Time Limit (minutes) *</Label>
                      <Input
                        id="timeLimit"
                        type="number"
                        value={newTask.timeLimit}
                        onChange={(e) => setNewTask({ ...newTask, timeLimit: e.target.value })}
                        placeholder="0"
                        min="1"
                        disabled={createTaskMutation.isPending}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="requirements">Requirements (Optional)</Label>
                    <textarea
                      id="requirements"
                      value={newTask.requirements}
                      onChange={(e) => setNewTask({ ...newTask, requirements: e.target.value })}
                      placeholder="Enter specific requirements or instructions"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={createTaskMutation.isPending}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    disabled={createTaskMutation.isPending}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateTask}
                    disabled={createTaskMutation.isPending}
                    className="flex-1"
                  >
                    {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}