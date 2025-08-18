import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface WorkTimeData {
  hoursWorked: number;
  hoursRemaining: number;
  isRequirementMet: boolean;
  lastActiveTime?: string;
}

export function WorkTimeDisplay({ userId }: { userId?: string }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch work time data
  const { data: workTime, refetch } = useQuery<WorkTimeData>({
    queryKey: ['/api/user/work-time'],
    enabled: !!userId,
    refetchInterval: 60000 // Refresh every minute
  });

  // Update current time every second for live timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update activity every 30 seconds
  useEffect(() => {
    if (!userId) return;

    const updateActivity = async () => {
      try {
        await fetch('/api/user/update-activity', {
          method: 'POST',
          credentials: 'include'
        });
        refetch();
      } catch (error) {
        console.error('Failed to update activity:', error);
      }
    };

    const interval = setInterval(updateActivity, 30000); // Every 30 seconds
    updateActivity(); // Initial update

    return () => clearInterval(interval);
  }, [userId, refetch]);

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getProgressPercentage = () => {
    if (!workTime) return 0;
    return Math.min((workTime.hoursWorked / 8) * 100, 100);
  };

  const getStatusColor = () => {
    if (!workTime) return 'text-gray-500';
    if (workTime.isRequirementMet) return 'text-green-500';
    if (workTime.hoursWorked >= 4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIcon = () => {
    if (!workTime) return <Clock className="w-5 h-5" />;
    if (workTime.isRequirementMet) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (workTime.hoursWorked < 4) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-yellow-500" />;
  };

  if (!userId) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-white border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <h3 className="font-semibold text-gray-900">Daily Work Requirement</h3>
          </div>
          <span className="text-sm text-gray-500">
            {currentTime.toLocaleTimeString()}
          </span>
        </div>

        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="relative">
            <div className="flex justify-between text-sm mb-1">
              <span className={getStatusColor()}>
                {workTime ? formatTime(workTime.hoursWorked) : '0h 0m'} worked
              </span>
              <span className="text-gray-500">
                {workTime ? formatTime(workTime.hoursRemaining) : '8h 0m'} remaining
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  workTime?.isRequirementMet 
                    ? 'bg-green-500' 
                    : workTime?.hoursWorked >= 4 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                }`}
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>0h</span>
              <span>4h</span>
              <span className="font-semibold">8h (Required)</span>
            </div>
          </div>

          {/* Status Message */}
          <div className={`text-sm p-2 rounded-lg ${
            workTime?.isRequirementMet 
              ? 'bg-green-100 text-green-700' 
              : workTime?.hoursWorked >= 4
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {workTime?.isRequirementMet ? (
              <p className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Daily requirement completed! Great job!
              </p>
            ) : workTime?.hoursWorked >= 4 ? (
              <p className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Halfway there! Keep working to avoid suspension.
              </p>
            ) : (
              <p className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                <strong>Warning:</strong> Complete 8 hours daily or account will be suspended!
              </p>
            )}
          </div>

          {/* Additional Info for Verified Users */}
          <div className="text-xs text-gray-500 border-t pt-2">
            <p>• Verified users must work 8 hours daily</p>
            <p>• Work time resets at midnight</p>
            <p>• Activity tracked automatically while you work</p>
            {workTime?.lastActiveTime && (
              <p>• Last active: {new Date(workTime.lastActiveTime).toLocaleTimeString()}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}