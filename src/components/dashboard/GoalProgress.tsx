import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';

interface GoalProgressProps {
  currentBestTime: number | null; // in seconds
  goalTime?: number; // in seconds, default 25 minutes
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function GoalProgress({ currentBestTime, goalTime = 25 * 60 }: GoalProgressProps) {
  // Calculate progress: how close to goal from a baseline (e.g., 35 min)
  const baseline = 35 * 60; // Starting assumption: 35 min
  
  let progress = 0;
  let statusText = "No 5K runs logged yet";
  
  if (currentBestTime !== null) {
    if (currentBestTime <= goalTime) {
      progress = 100;
      statusText = `🎉 Goal achieved! Your best: ${formatTime(currentBestTime)}`;
    } else {
      // Progress from baseline to goal
      const totalRange = baseline - goalTime;
      const currentProgress = baseline - currentBestTime;
      progress = Math.max(0, Math.min(100, (currentProgress / totalRange) * 100));
      statusText = `Current best: ${formatTime(currentBestTime)} → Goal: ${formatTime(goalTime)}`;
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          5K Goal Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={progress} className="h-3" />
        <p className="text-sm text-muted-foreground">{statusText}</p>
      </CardContent>
    </Card>
  );
}
