import { Mountain, Dumbbell } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Activity, SquatsActivity, PushupActivity } from '@/types/activity';

interface StrengthMetricsProps {
  activities: Activity[];
  bodyWeight?: number; // in kg, default 70kg
}

// Landmarks heights in meters
const LANDMARKS = [
  { name: 'Statue of Liberty', height: 93, icon: '🗽' },
  { name: 'Big Ben', height: 96, icon: '🕰️' },
  { name: 'Leaning Tower of Pisa', height: 56, icon: '🏛️' },
  { name: 'Empire State Building', height: 443, icon: '🏙️' },
  { name: 'Eiffel Tower', height: 330, icon: '🗼' },
  { name: 'Mount Everest', height: 8849, icon: '🏔️' },
];

// Weight comparisons in kg
const WEIGHT_COMPARISONS = [
  { name: 'bowling ball', weight: 7, icon: '🎳' },
  { name: 'large dog', weight: 40, icon: '🐕' },
  { name: 'adult panda', weight: 100, icon: '🐼' },
  { name: 'grand piano', weight: 500, icon: '🎹' },
  { name: 'small car', weight: 1000, icon: '🚗' },
  { name: 'elephant', weight: 5000, icon: '🐘' },
];

function getNextLandmark(currentHeight: number) {
  for (const landmark of LANDMARKS) {
    if (currentHeight < landmark.height) {
      return landmark;
    }
  }
  return LANDMARKS[LANDMARKS.length - 1];
}

function getCurrentLandmark(currentHeight: number) {
  for (let i = LANDMARKS.length - 1; i >= 0; i--) {
    if (currentHeight >= LANDMARKS[i].height) {
      return LANDMARKS[i];
    }
  }
  return null;
}

function getWeightComparison(totalWeight: number) {
  let count = 0;
  let comparison = WEIGHT_COMPARISONS[0];
  
  for (const item of WEIGHT_COMPARISONS) {
    if (totalWeight >= item.weight) {
      count = Math.floor(totalWeight / item.weight);
      comparison = item;
    }
  }
  
  return { count, comparison };
}

export function StrengthMetrics({ activities, bodyWeight = 70 }: StrengthMetricsProps) {
  // Calculate squats metrics
  const squatActivities = activities.filter(a => a.type === 'squats') as SquatsActivity[];
  const totalSquats = squatActivities.reduce((sum, a) => {
    const reps = a.reps || 0;
    const sets = a.sets || 1;
    return sum + (reps * sets);
  }, 0);
  
  const heightPerSquat = 0.5; // meters
  const totalHeight = totalSquats * heightPerSquat;
  const nextLandmark = getNextLandmark(totalHeight);
  const currentLandmark = getCurrentLandmark(totalHeight);
  const squatsToNextLandmark = Math.ceil((nextLandmark.height - totalHeight) / heightPerSquat);
  const progressToNext = currentLandmark 
    ? ((totalHeight - currentLandmark.height) / (nextLandmark.height - currentLandmark.height)) * 100
    : (totalHeight / nextLandmark.height) * 100;

  // Calculate push-up metrics
  const pushupActivities = activities.filter(a => a.type === 'pushup') as PushupActivity[];
  const totalPushups = pushupActivities.reduce((sum, a) => {
    const reps = a.reps || 0;
    const sets = a.sets || 1;
    return sum + (reps * sets);
  }, 0);
  
  const weightPerPushup = bodyWeight * 0.6; // 60% of body weight
  const totalWeightLifted = totalPushups * weightPerPushup;
  const { count, comparison } = getWeightComparison(totalWeightLifted);

  if (totalSquats === 0 && totalPushups === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Squats Metrics */}
      {totalSquats > 0 && (
        <div className="glass-panel p-4 rounded-xl border border-neon-green/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
              <Mountain className="h-5 w-5 text-neon-green" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Squat Climb Challenge</h4>
              <p className="text-xs text-muted-foreground">
                {totalSquats} squats = {totalHeight.toFixed(1)}m climbed
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {currentLandmark ? `${currentLandmark.icon} ${currentLandmark.name}` : 'Start'}
              </span>
              <span className="text-neon-green font-medium">
                {nextLandmark.icon} {nextLandmark.name}
              </span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/30">
              <div 
                className="h-full transition-all duration-500 rounded-full"
                style={{ 
                  width: `${Math.min(progressToNext, 100)}%`,
                  background: 'linear-gradient(90deg, hsl(var(--neon-green)), hsl(var(--neon-cyan)))'
                }}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              🔥 <span className="text-neon-green font-semibold">{squatsToNextLandmark}</span> more squats to reach {nextLandmark.name}!
            </p>
          </div>
        </div>
      )}

      {/* Push-up Metrics */}
      {totalPushups > 0 && (
        <div className="glass-panel p-4 rounded-xl border border-neon-purple/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-neon-purple/20 flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-neon-purple" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Push-up Power</h4>
              <p className="text-xs text-muted-foreground">
                {totalPushups} push-ups = {(totalWeightLifted / 1000).toFixed(2)} tonnes lifted
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 py-2">
              <span className="text-3xl">{comparison.icon}</span>
              <div className="text-center">
                <p className="text-lg font-bold text-neon-purple">
                  {count > 0 ? `${count}×` : '<1×'}
                </p>
                <p className="text-xs text-muted-foreground">{comparison.name}</p>
              </div>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/30">
              <div 
                className="h-full transition-all duration-500 rounded-full animate-pulse"
                style={{ 
                  width: `${Math.min((totalWeightLifted % comparison.weight) / comparison.weight * 100, 100)}%`,
                  background: 'linear-gradient(90deg, hsl(var(--neon-purple)), hsl(var(--neon-pink)))'
                }}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              💪 You've lifted the equivalent of <span className="text-neon-purple font-semibold">{count} {comparison.name}{count !== 1 ? 's' : ''}</span>!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
