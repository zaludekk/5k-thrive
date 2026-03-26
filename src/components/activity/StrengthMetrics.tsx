import { Mountain, Dumbbell } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Activity, SquatsActivity, PushupActivity } from '@/types/activity';

interface StrengthMetricsProps {
  activities: Activity[];
  bodyWeight?: number; // in kg, default 70kg
}

// Squat Climb Challenge landmarks (progressive order)
const SQUAT_LANDMARKS = [
  { name: 'Leaning Tower of Pisa', height: 56, icon: '🏛️' },
  { name: 'Statue of Liberty', height: 93, icon: '🗽' },
  { name: 'Big Ben', height: 96, icon: '🕰️' },
  { name: 'Eiffel Tower', height: 330, icon: '🗼' },
  { name: 'Empire State Building', height: 443, icon: '🏙️' },
  { name: 'Burj Khalifa', height: 828, icon: '🏗️' },
  { name: 'Mount Fuji', height: 3776, icon: '🗻' },
  { name: 'Mont Blanc', height: 4808, icon: '⛰️' },
  { name: 'Kilimanjaro', height: 5895, icon: '🌋' },
  { name: 'Mount Everest', height: 8849, icon: '🏔️' },
].sort((a, b) => a.height - b.height);

// Weight comparisons in kg
const WEIGHT_COMPARISONS = [
  { name: 'bowling ball', weight: 7, icon: '🎳' },
  { name: 'large dog', weight: 40, icon: '🐕' },
  { name: 'adult panda', weight: 100, icon: '🐼' },
  { name: 'grand piano', weight: 500, icon: '🎹' },
  { name: 'small car', weight: 1000, icon: '🚗' },
  { name: 'elephant', weight: 5000, icon: '🐘' },
];

// Get the current active landmark (the one we're climbing towards)
function getActiveLandmark(currentHeight: number) {
  for (const landmark of SQUAT_LANDMARKS) {
    if (currentHeight < landmark.height) {
      return landmark;
    }
  }
  // If we've conquered all, return the last one (Everest)
  return SQUAT_LANDMARKS[SQUAT_LANDMARKS.length - 1];
}

// Get the previous landmark (what we just completed)
function getPreviousLandmark(currentHeight: number) {
  let previous = null;
  for (const landmark of SQUAT_LANDMARKS) {
    if (currentHeight >= landmark.height) {
      previous = landmark;
    } else {
      break;
    }
  }
  return previous;
}

// Check if all landmarks are conquered
function hasConqueredAll(currentHeight: number) {
  return currentHeight >= SQUAT_LANDMARKS[SQUAT_LANDMARKS.length - 1].height;
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
  const activeLandmark = getActiveLandmark(totalHeight);
  const previousLandmark = getPreviousLandmark(totalHeight);
  const conqueredAll = hasConqueredAll(totalHeight);
  
  // Calculate progress relative to current landmark segment
  const segmentStart = previousLandmark ? previousLandmark.height : 0;
  const segmentEnd = activeLandmark.height;
  const segmentProgress = segmentEnd > segmentStart 
    ? ((totalHeight - segmentStart) / (segmentEnd - segmentStart)) * 100
    : 100;
  
  const squatsToComplete = Math.ceil((segmentEnd - totalHeight) / heightPerSquat);
  const conqueredLandmarks = SQUAT_LANDMARKS.filter(l => totalHeight >= l.height);

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
      {/* Squats Metrics - Climb Challenge */}
      {totalSquats > 0 && (
        <div className="glass-panel p-4 rounded-xl border border-neon-green/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
              <Mountain className="h-5 w-5 text-neon-green" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">Squat Climb Challenge</h4>
                {conqueredLandmarks.length > 0 && (
                  <div className="flex -space-x-1">
                    {conqueredLandmarks.slice(-3).map((l, i) => (
                      <span key={l.name} className="text-lg" title={`${l.name} ✓`}>
                        {l.icon}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalSquats} squats = {totalHeight.toFixed(1)}m climbed
              </p>
            </div>
          </div>
          
          {conqueredAll ? (
            // Victory state - conquered all landmarks!
            <div className="text-center py-4 space-y-2">
              <div className="text-4xl animate-bounce">🏆</div>
              <p className="text-neon-green font-bold text-lg neon-text-green">
                LEGENDARY CLIMBER!
              </p>
              <p className="text-sm text-muted-foreground">
                You've conquered Mount Everest! ({totalHeight.toFixed(0)}m)
              </p>
              <div className="flex justify-center gap-2 mt-2">
                {SQUAT_LANDMARKS.map(l => (
                  <span key={l.name} className="text-xl" title={l.name}>
                    {l.icon}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            // Active challenge state
            <div className="space-y-3">
              {/* Current target landmark */}
              <div className="text-center py-2">
                <span className="text-4xl">{activeLandmark.icon}</span>
                <p className="text-sm font-semibold text-neon-green mt-1">
                  Climbing: {activeLandmark.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeLandmark.height}m tall
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{previousLandmark ? `${previousLandmark.icon} ${previousLandmark.height}m` : '🏁 0m'}</span>
                  <span className="text-neon-green font-medium">
                    {activeLandmark.icon} {activeLandmark.height}m
                  </span>
                </div>
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted/30">
                  <div 
                    className="h-full transition-all duration-500 rounded-full relative"
                    style={{ 
                      width: `${Math.min(segmentProgress, 100)}%`,
                      background: 'linear-gradient(90deg, hsl(var(--neon-green)), hsl(var(--neon-cyan)))'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {totalHeight.toFixed(1)}m climbed
                  </span>
                  <span className="text-neon-green font-semibold">
                    {segmentProgress.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Motivation message */}
              <p className="text-xs text-center text-muted-foreground">
                🔥 <span className="text-neon-green font-semibold">{squatsToComplete}</span> more squats to reach {activeLandmark.name}!
              </p>

              {/* Conquered landmarks */}
              {conqueredLandmarks.length > 0 && (
                <div className="pt-2 border-t border-neon-green/10">
                  <p className="text-xs text-muted-foreground text-center mb-2">Conquered:</p>
                  <div className="flex justify-center gap-3 flex-wrap">
                    {conqueredLandmarks.map(l => (
                      <div key={l.name} className="flex items-center gap-1 text-xs text-neon-green/70">
                        <span>{l.icon}</span>
                        <span className="hidden sm:inline">{l.name}</span>
                        <span className="text-neon-green">✓</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
