import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Target, Trophy, Settings2 } from 'lucide-react';
import { z } from 'zod';

interface GoalProgressProps {
  currentBestTime: number | null; // in seconds
}

const GOAL_STORAGE_KEY = '5k-tracker-goal-time';
const DEFAULT_GOAL = 25 * 60; // 25 minutes in seconds

// Validation schema for goal time input
const timeInputSchema = z.string().regex(
  /^([0-9]{1,2}):([0-5][0-9])$/,
  'Please enter time in MM:SS format (e.g., 23:30)'
);

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function parseTimeInput(timeStr: string): number | null {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  if (seconds >= 60) return null;
  return minutes * 60 + seconds;
}

export function GoalProgress({ currentBestTime }: GoalProgressProps) {
  const [goalTime, setGoalTime] = useState<number>(DEFAULT_GOAL);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  // Load goal from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(GOAL_STORAGE_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setGoalTime(parsed);
      }
    }
  }, []);

  // Calculate progress: how close to goal from a baseline (e.g., 35 min)
  const baseline = 35 * 60; // Starting assumption: 35 min
  
  let progress = 0;
  let goalAchieved = false;
  let statusText = "No 5K runs logged yet";
  
  if (currentBestTime !== null) {
    if (currentBestTime <= goalTime) {
      progress = 100;
      goalAchieved = true;
      statusText = `🎉 Goal achieved! Your best: ${formatTime(currentBestTime)}`;
    } else {
      // Progress from baseline to goal
      const totalRange = baseline - goalTime;
      const currentProgress = baseline - currentBestTime;
      progress = Math.max(0, Math.min(100, (currentProgress / totalRange) * 100));
      statusText = `Current best: ${formatTime(currentBestTime)} → Goal: ${formatTime(goalTime)}`;
    }
  }

  const handleOpenDialog = () => {
    setInputValue(formatTime(goalTime));
    setInputError(null);
    setIsDialogOpen(true);
  };

  const handleSaveGoal = () => {
    // Validate input
    const validation = timeInputSchema.safeParse(inputValue.trim());
    if (!validation.success) {
      setInputError(validation.error.errors[0].message);
      return;
    }

    const newGoalSeconds = parseTimeInput(inputValue.trim());
    if (newGoalSeconds === null || newGoalSeconds < 60) {
      setInputError('Goal must be at least 1 minute');
      return;
    }

    if (newGoalSeconds > 60 * 60) {
      setInputError('Goal must be less than 60 minutes');
      return;
    }

    setGoalTime(newGoalSeconds);
    localStorage.setItem(GOAL_STORAGE_KEY, newGoalSeconds.toString());
    setInputError(null);
    setIsDialogOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 5); // Limit to MM:SS format
    setInputValue(value);
    setInputError(null);
  };

  return (
    <Card className="glass-panel border-neon-cyan/20 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 via-neon-purple/5 to-neon-green/5 pointer-events-none" />
      <CardHeader className="pb-2 relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 bg-neon-cyan/20 rounded-lg border border-neon-cyan/30">
              <Target className="h-5 w-5 text-neon-cyan" />
            </div>
            <span className="text-foreground uppercase tracking-wider font-semibold">5K Goal Progress</span>
          </CardTitle>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenDialog}
                className={`gap-1.5 ${goalAchieved ? 'border-neon-green/50 text-neon-green hover:bg-neon-green/10' : 'border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10'}`}
              >
                {goalAchieved ? (
                  <>
                    <Trophy className="h-4 w-4" />
                    Set New Goal
                  </>
                ) : (
                  <>
                    <Settings2 className="h-4 w-4" />
                    Edit Goal
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-neon-cyan/30 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-neon-cyan flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {goalAchieved ? 'Set New 5K Goal' : 'Edit 5K Goal'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {goalAchieved && (
                  <div className="glass-panel p-3 rounded-lg border border-neon-green/30 bg-neon-green/5">
                    <p className="text-sm text-neon-green flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Congratulations! You achieved {formatTime(goalTime)}!
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Set a new goal to keep pushing your limits.
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Target Time (MM:SS)
                  </label>
                  <Input
                    type="text"
                    placeholder="23:30"
                    value={inputValue}
                    onChange={handleInputChange}
                    className={`text-center text-xl font-mono bg-background/50 border-neon-cyan/30 focus:border-neon-cyan ${inputError ? 'border-destructive' : ''}`}
                    maxLength={5}
                  />
                  {inputError && (
                    <p className="text-xs text-destructive">{inputError}</p>
                  )}
                  <p className="text-xs text-muted-foreground text-center">
                    e.g., 23:30 for 23 minutes 30 seconds
                  </p>
                </div>

                {currentBestTime !== null && (
                  <div className="text-center text-sm text-muted-foreground">
                    Your current best: <span className="text-neon-cyan font-semibold">{formatTime(currentBestTime)}</span>
                  </div>
                )}
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button variant="outline" className="border-muted-foreground/30">
                    Cancel
                  </Button>
                </DialogClose>
                <Button 
                  onClick={handleSaveGoal}
                  className="bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/30"
                >
                  Save Goal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        {/* Goal display */}
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Goal</p>
            <p className="text-2xl font-bold text-neon-cyan font-mono">{formatTime(goalTime)}</p>
          </div>
          {currentBestTime !== null && (
            <>
              <div className="h-8 w-px bg-neon-cyan/20" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Best</p>
                <p className={`text-2xl font-bold font-mono ${goalAchieved ? 'text-neon-green' : 'text-foreground'}`}>
                  {formatTime(currentBestTime)}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Neon Progress Bar */}
        <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted/50 border border-white/10">
          <div 
            className="h-full transition-all duration-700 ease-out rounded-full"
            style={{ 
              width: `${progress}%`,
              background: goalAchieved 
                ? 'linear-gradient(90deg, hsl(160 100% 50%), hsl(120 100% 50%))'
                : 'linear-gradient(90deg, hsl(180 100% 50%), hsl(280 100% 65%), hsl(160 100% 50%))',
              boxShadow: goalAchieved
                ? '0 0 20px hsl(160 100% 50% / 0.5), 0 0 40px hsl(120 100% 50% / 0.3)'
                : '0 0 20px hsl(180 100% 50% / 0.5), 0 0 40px hsl(280 100% 65% / 0.3)'
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
          <span className={`text-lg font-bold ${goalAchieved ? 'text-neon-green neon-text-green' : 'text-neon-cyan neon-text-cyan'}`}>
            {Math.round(progress)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
