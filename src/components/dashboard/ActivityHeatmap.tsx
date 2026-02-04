import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from '@/types/activity';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityHeatmapProps {
  activities: Activity[];
}

export function ActivityHeatmap({ activities }: ActivityHeatmapProps) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Count activities per day
  const activityCountByDay = new Map<string, number>();
  activities.forEach(activity => {
    const dateKey = activity.date.split('T')[0];
    activityCountByDay.set(dateKey, (activityCountByDay.get(dateKey) || 0) + 1);
  });

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-muted';
    if (count === 1) return 'bg-primary/30';
    if (count === 2) return 'bg-primary/60';
    return 'bg-primary';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Activity Consistency - {format(now, 'MMMM yyyy')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs text-muted-foreground text-center font-medium py-1">
              {day}
            </div>
          ))}
          
          {/* Empty cells for days before month starts */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {daysInMonth.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const count = activityCountByDay.get(dateKey) || 0;
            const isToday = isSameDay(day, now);
            const isFuture = day > now;
            
            return (
              <div
                key={dateKey}
                className={cn(
                  'aspect-square rounded-md flex flex-col items-center justify-center text-xs transition-colors',
                  isFuture ? 'bg-muted/30' : getIntensityClass(count),
                  isToday && 'ring-2 ring-primary ring-offset-1',
                  count > 0 && !isFuture && 'text-primary-foreground font-medium'
                )}
                title={`${format(day, 'MMM d')}: ${count} ${count === 1 ? 'activity' : 'activities'}`}
              >
                <span className="text-[10px] leading-none">{format(day, 'd')}</span>
                {count > 0 && !isFuture && (
                  <span className="text-[8px] leading-none mt-0.5 opacity-90">{count}×</span>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded bg-muted" />
            <div className="w-3 h-3 rounded bg-primary/30" />
            <div className="w-3 h-3 rounded bg-primary/60" />
            <div className="w-3 h-3 rounded bg-primary" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
