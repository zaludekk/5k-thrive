import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, RunningActivity } from '@/types/activity';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Ruler } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface DistanceEvolutionProps {
  activities: Activity[];
}

export const DistanceEvolution = ({ activities }: DistanceEvolutionProps) => {
  const runningActivities = activities
    .filter((a): a is RunningActivity => a.type === 'running' && a.distance > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (runningActivities.length < 2) {
    return (
      <Card className="glass-panel border-neon-cyan/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-neon-cyan neon-text-cyan flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Distance Evolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            <p>Need at least 2 running activities to show distance evolution</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const distanceData = runningActivities.map((activity) => ({
    date: activity.date,
    dateLabel: format(parseISO(activity.date), 'MMM d'),
    distance: Math.round(activity.distance * 1000), // km to meters
  }));

  const firstDist = distanceData[0].distance;
  const lastDist = distanceData[distanceData.length - 1].distance;
  const distChange = lastDist - firstDist;
  const percentChange = ((distChange / firstDist) * 100).toFixed(1);

  const getTrendIcon = () => {
    if (distChange > 100) return <TrendingUp className="h-4 w-4 text-neon-green" />;
    if (distChange < -100) return <TrendingDown className="h-4 w-4 text-neon-orange" />;
    return <Minus className="h-4 w-4 text-neon-cyan" />;
  };

  const getTrendText = () => {
    if (distChange > 100) return `+${percentChange}%`;
    if (distChange < -100) return `${percentChange}%`;
    return 'Stable';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel border border-neon-cyan/30 px-3 py-2 rounded-lg">
          <p className="text-neon-cyan text-sm font-medium">{label}</p>
          <p className="text-foreground text-lg font-bold">
            {payload[0].value.toLocaleString()} <span className="text-xs text-muted-foreground">m</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const distances = distanceData.map(d => d.distance);
  const minDist = Math.max(0, Math.min(...distances) - 500);
  const maxDist = Math.max(...distances) + 500;

  return (
    <Card className="glass-panel border-neon-cyan/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-neon-cyan neon-text-cyan flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Distance Evolution
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            {getTrendIcon()}
            <span className={`${distChange > 100 ? 'text-neon-green' : distChange < -100 ? 'text-neon-orange' : 'text-neon-cyan'}`}>
              {getTrendText()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={distanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="distGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--neon-green))" />
                  <stop offset="50%" stopColor="hsl(var(--neon-cyan))" />
                  <stop offset="100%" stopColor="hsl(var(--neon-purple))" />
                </linearGradient>
                <filter id="distGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--neon-cyan) / 0.1)" vertical={false} />
              <XAxis dataKey="dateLabel" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                domain={[minDist, maxDist]}
                tickFormatter={(v) => `${v}m`}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="distance"
                stroke="url(#distGradient)"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--neon-green))', strokeWidth: 2, r: 4, stroke: 'hsl(var(--background))' }}
                activeDot={{ r: 6, fill: 'hsl(var(--neon-green))', stroke: 'hsl(var(--neon-green))', strokeWidth: 2, filter: 'url(#distGlow)' }}
                filter="url(#distGlow)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-between text-xs text-muted-foreground">
          <div><span className="text-neon-cyan">First:</span> {distanceData[0].distance.toLocaleString()} m</div>
          <div><span className="text-neon-green">Latest:</span> {distanceData[distanceData.length - 1].distance.toLocaleString()} m</div>
        </div>
      </CardContent>
    </Card>
  );
};
