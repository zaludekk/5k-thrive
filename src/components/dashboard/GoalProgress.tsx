import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="glass-panel border-neon-cyan/20 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 via-neon-purple/5 to-neon-green/5 pointer-events-none" />
      <CardHeader className="pb-2 relative">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-2 bg-neon-cyan/20 rounded-lg border border-neon-cyan/30">
            <Target className="h-5 w-5 text-neon-cyan" />
          </div>
          <span className="text-foreground uppercase tracking-wider font-semibold">5K Goal Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        {/* Neon Progress Bar */}
        <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted/50 border border-white/10">
          <div 
            className="h-full transition-all duration-700 ease-out rounded-full"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, hsl(180 100% 50%), hsl(280 100% 65%), hsl(160 100% 50%))',
              boxShadow: '0 0 20px hsl(180 100% 50% / 0.5), 0 0 40px hsl(280 100% 65% / 0.3)'
            }}
          />
          {/* Animated scanline effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
            style={{ animationDuration: '2s' }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{statusText}</p>
          <span className="text-lg font-bold text-neon-cyan neon-text-cyan">{Math.round(progress)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
