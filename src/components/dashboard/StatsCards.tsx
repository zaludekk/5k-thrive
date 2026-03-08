import { Card, CardContent } from '@/components/ui/card';
import { ActivityStats } from '@/types/activity';
import { Activity, Timer, Trophy, Route } from 'lucide-react';

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Running Km Card - Cyan Neon */}
      <Card className="glass-panel neon-glow-cyan border-neon-cyan/30 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 to-transparent pointer-events-none" />
        <CardContent className="pt-6 relative">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-neon-cyan/20 rounded-xl border border-neon-cyan/30">
              <Activity className="h-5 w-5 text-neon-cyan" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Running Km</p>
              <p className="text-3xl font-bold text-neon-cyan neon-text-cyan">{stats.totalRunningKmThisMonth} km</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total All Km Card - Orange/Walking Neon */}
      <Card className="glass-panel border-walking/30 overflow-hidden relative" style={{ boxShadow: '0 0 15px hsl(var(--walking) / 0.15)' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-walking/10 to-transparent pointer-events-none" />
        <CardContent className="pt-6 relative">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-walking/20 rounded-xl border border-walking/30">
              <Route className="h-5 w-5 text-walking" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Total Km</p>
              <p className="text-3xl font-bold text-walking" style={{ textShadow: '0 0 10px hsl(var(--walking) / 0.5)' }}>
                {stats.totalAllKmThisMonth} km
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Activities Card - Purple Neon */}
      <Card className="glass-panel neon-glow-purple border-neon-purple/30 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent pointer-events-none" />
        <CardContent className="pt-6 relative">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-neon-purple/20 rounded-xl border border-neon-purple/30">
              <Timer className="h-5 w-5 text-neon-purple" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Total Activities</p>
              <p className="text-3xl font-bold text-neon-purple" style={{ textShadow: '0 0 10px hsl(280 100% 65% / 0.5)' }}>
                {stats.totalActivitiesThisMonth}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best 5K Card - Green Neon */}
      <Card className="glass-panel neon-glow-green border-neon-green/30 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 to-transparent pointer-events-none" />
        <CardContent className="pt-6 relative">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-neon-green/20 rounded-xl border border-neon-green/30">
              <Trophy className="h-5 w-5 text-neon-green" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Best 5K Time</p>
              <p className="text-3xl font-bold text-neon-green neon-text-green">
                {stats.best5KTime ? formatTime(stats.best5KTime) : '--:--'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
