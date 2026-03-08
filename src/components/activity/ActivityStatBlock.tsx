import { Mountain, Dumbbell, Clock, Repeat, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SquatsActivity, PushupActivity, PlankActivity, GripActivity } from '@/types/activity';

interface ActivityStatBlockProps {
  activity: SquatsActivity | PushupActivity | PlankActivity | GripActivity;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function ActivityStatBlock({ activity }: ActivityStatBlockProps) {
  const isSquats = activity.type === 'squats';
  const isPushup = activity.type === 'pushup';
  const isPlank = activity.type === 'plank';
  const isGrip = activity.type === 'grip';

  const getIcon = () => {
    if (isSquats) return <Mountain className="h-5 w-5" />;
    if (isPushup) return <Dumbbell className="h-5 w-5" />;
    if (isGrip) return <Repeat className="h-5 w-5" />;
    return <Clock className="h-5 w-5" />;
  };

  const getGradientClass = () => {
    if (isSquats) return 'from-neon-green/20 to-neon-cyan/10 border-neon-green/40';
    if (isPushup) return 'from-neon-purple/20 to-neon-pink/10 border-neon-purple/40';
    if (isGrip) return 'from-neon-cyan/20 to-neon-green/10 border-neon-cyan/40';
    return 'from-neon-orange/20 to-neon-pink/10 border-neon-orange/40';
  };

  const getIconBgClass = () => {
    if (isSquats) return 'bg-neon-green/20 text-neon-green';
    if (isPushup) return 'bg-neon-purple/20 text-neon-purple';
    if (isGrip) return 'bg-neon-cyan/20 text-neon-cyan';
    return 'bg-neon-orange/20 text-neon-orange';
  };

  const getAccentColor = () => {
    if (isSquats) return 'text-neon-green';
    if (isPushup) return 'text-neon-purple';
    if (isGrip) return 'text-neon-cyan';
    return 'text-neon-orange';
  };

  const getImpactMetric = () => {
    if (isSquats && activity.reps && activity.sets) {
      const totalReps = activity.reps * activity.sets;
      const heightClimbed = totalReps * 0.5; // 0.5m per squat
      return {
        label: 'Height Climbed',
        value: `${heightClimbed.toFixed(1)}m`,
        icon: '⬆️',
      };
    }
    if (isPushup && activity.reps && activity.sets) {
      const totalReps = activity.reps * activity.sets;
      const weightLifted = totalReps * 70 * 0.6; // 60% of 70kg
      return {
        label: 'Weight Lifted',
        value: `${weightLifted.toFixed(0)}kg`,
        icon: '🏋️',
      };
    }
    if (isPlank) {
      const plankActivity = activity as PlankActivity;
      const calories = Math.round(plankActivity.duration / 60 * 3.5); // ~3.5 cal per minute
      return {
        label: 'Est. Calories',
        value: `${calories} cal`,
        icon: '🔥',
      };
    }
    return null;
  };

  const impactMetric = getImpactMetric();

  return (
    <div 
      className={cn(
        "flex items-stretch gap-4 p-4 rounded-xl border bg-gradient-to-r transition-all hover:scale-[1.02]",
        getGradientClass()
      )}
    >
      {/* Icon */}
      <div className={cn("flex items-center justify-center w-12 h-12 rounded-lg shrink-0", getIconBgClass())}>
        {getIcon()}
      </div>

      {/* Main Stats */}
      <div className="flex-1 min-w-0">
        <h4 className={cn("font-semibold text-sm mb-1", getAccentColor())}>
          {isSquats ? 'Squats' : isPushup ? 'Push-Ups' : 'Plank'}
        </h4>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {(isSquats || isPushup) && activity.reps && activity.sets && (
            <>
              <div className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-foreground font-medium">{activity.sets}</span>
                <span className="text-muted-foreground">sets</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-foreground font-medium">{activity.reps}</span>
                <span className="text-muted-foreground">reps</span>
              </div>
              <div className="text-muted-foreground">
                = <span className="font-medium text-foreground">{activity.sets * activity.reps}</span> total
              </div>
            </>
          )}
          {isPlank && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-foreground font-medium">{formatTime((activity as PlankActivity).duration)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Impact Metric */}
      {impactMetric && (
        <div className="flex flex-col items-end justify-center shrink-0 text-right">
          <span className="text-lg">{impactMetric.icon}</span>
          <span className={cn("font-bold text-lg", getAccentColor())}>{impactMetric.value}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{impactMetric.label}</span>
        </div>
      )}
    </div>
  );
}
