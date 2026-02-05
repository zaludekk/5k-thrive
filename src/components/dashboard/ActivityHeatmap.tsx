import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from '@/types/activity';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subDays } from 'date-fns';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityHeatmapProps {
  activities: Activity[];
}

export function ActivityHeatmap({ activities }: ActivityHeatmapProps) {
  const now = new Date();
  // Show last 12 weeks (84 days) like GitHub contribution graph
  const startDate = subDays(now, 83);
  const days = eachDayOfInterval({ start: startDate, end: now });

  // Count activities per day
  const activityCountByDay = new Map<string, number>();
  activities.forEach(activity => {
    const dateKey = activity.date.split('T')[0];
    activityCountByDay.set(dateKey, (activityCountByDay.get(dateKey) || 0) + 1);
  });

  // Calculate streak (consecutive days with activity)
  const calculateStreak = (): number => {
    let streak = 0;
    let currentDate = now;
    
    while (true) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      if (activityCountByDay.get(dateKey) && activityCountByDay.get(dateKey)! > 0) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  const getIntensityStyle = (count: number) => {
    if (count === 0) return { background: 'hsl(222 30% 15%)', border: '1px solid hsl(222 30% 20%)' };
    if (count === 1) return { 
      background: 'hsl(160 100% 50% / 0.3)', 
      border: '1px solid hsl(160 100% 50% / 0.5)',
      boxShadow: '0 0 8px hsl(160 100% 50% / 0.3)'
    };
    if (count === 2) return { 
      background: 'hsl(160 100% 50% / 0.5)', 
      border: '1px solid hsl(160 100% 50% / 0.7)',
      boxShadow: '0 0 12px hsl(160 100% 50% / 0.4)'
    };
    return { 
      background: 'hsl(160 100% 50%)', 
      border: '1px solid hsl(160 100% 50%)',
      boxShadow: '0 0 16px hsl(160 100% 50% / 0.6)'
    };
  };

  // Organize days into weeks (columns) for GitHub-style layout
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  days.forEach((day, index) => {
    if (index === 0) {
      // Add empty cells for days before the start
      const dayOfWeek = day.getDay();
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push(null as any);
      }
    }
    currentWeek.push(day);
    if (day.getDay() === 6 || index === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <Card className="glass-panel border-neon-green/20 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 to-transparent pointer-events-none" />
      <CardHeader className="pb-2 relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 bg-neon-green/20 rounded-lg border border-neon-green/30">
              <Flame className="h-5 w-5 text-neon-orange" />
            </div>
            <span className="text-foreground uppercase tracking-wider font-semibold">Activity Grid</span>
          </CardTitle>
          
          {/* Streak Counter */}
          {currentStreak > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-orange/20 border border-neon-orange/40">
              <span className="text-xl">🔥</span>
              <span className="text-neon-orange font-bold" style={{ textShadow: '0 0 10px hsl(25 100% 55% / 0.5)' }}>
                {currentStreak} day streak!
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative">
        {/* GitHub-style contribution graph */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-2 text-[10px] text-muted-foreground justify-around py-1">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>
          
          {/* Weeks grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const day = week.find(d => d && d.getDay() === dayIndex);
                  if (!day) {
                    return <div key={dayIndex} className="w-3 h-3" />;
                  }
                  
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const count = activityCountByDay.get(dateKey) || 0;
                  const isToday = isSameDay(day, now);
                  const isStreak = count > 0;
                  
                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        'w-3 h-3 rounded-sm transition-all duration-200 hover:scale-125 cursor-pointer relative group',
                        isToday && 'ring-1 ring-neon-cyan ring-offset-1 ring-offset-background'
                      )}
                      style={getIntensityStyle(count)}
                      title={`${format(day, 'MMM d, yyyy')}: ${count} ${count === 1 ? 'activity' : 'activities'}`}
                    >
                      {/* Fire emoji for streak days with 2+ activities */}
                      {count >= 2 && (
                        <span className="absolute -top-1 -right-1 text-[8px] z-10">🔥</span>
                      )}
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card border border-white/20 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        {format(day, 'MMM d')}: {count} {count === 1 ? 'activity' : 'activities'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm" style={getIntensityStyle(0)} />
            <div className="w-3 h-3 rounded-sm" style={getIntensityStyle(1)} />
            <div className="w-3 h-3 rounded-sm" style={getIntensityStyle(2)} />
            <div className="w-3 h-3 rounded-sm" style={getIntensityStyle(3)} />
          </div>
          <span>More</span>
          <span className="ml-2">🔥 = 2+ activities</span>
        </div>
      </CardContent>
    </Card>
  );
}
