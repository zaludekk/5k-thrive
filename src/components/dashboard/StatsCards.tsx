import { Card, CardContent } from '@/components/ui/card';
import { ActivityStats } from '@/types/activity';
import { Activity, Timer, Trophy } from 'lucide-react';

interface StatsCardsProps {
  stats: ActivityStats;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Km This Month</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalKmThisMonth} km</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/20 rounded-lg">
              <Timer className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Activities</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalActivitiesThisMonth}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-running/10 to-running/5 border-running/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-running/20 rounded-lg">
              <Trophy className="h-5 w-5 text-running" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Best 5K Time</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.best5KTime ? formatTime(stats.best5KTime) : '--:--'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
