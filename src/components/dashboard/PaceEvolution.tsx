import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, RunningActivity } from '@/types/activity';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface PaceEvolutionProps {
  activities: Activity[];
}

interface PaceDataPoint {
  date: string;
  dateLabel: string;
  pace: number;
  paceLabel: string;
}

const formatPace = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const PaceEvolution = ({ activities }: PaceEvolutionProps) => {
  // Filter running activities and calculate pace
  const runningActivities = activities
    .filter((a): a is RunningActivity => a.type === 'running' && a.distance > 0 && a.time > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (runningActivities.length < 2) {
    return (
      <Card className="glass-panel border-neon-cyan/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-neon-cyan neon-text-cyan flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Pace Evolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            <p>Need at least 2 running activities to show pace evolution</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate pace for each activity (seconds per km)
  const paceData: PaceDataPoint[] = runningActivities.map((activity) => {
    const paceSecondsPerKm = activity.time / activity.distance;
    return {
      date: activity.date,
      dateLabel: format(parseISO(activity.date), 'MMM d'),
      pace: paceSecondsPerKm,
      paceLabel: formatPace(paceSecondsPerKm),
    };
  });

  // Calculate trend
  const firstPace = paceData[0].pace;
  const lastPace = paceData[paceData.length - 1].pace;
  const paceChange = firstPace - lastPace; // Positive means improvement (faster)
  const percentChange = ((paceChange / firstPace) * 100).toFixed(1);

  const getTrendIcon = () => {
    if (paceChange > 10) return <TrendingDown className="h-4 w-4 text-neon-green" />;
    if (paceChange < -10) return <TrendingUp className="h-4 w-4 text-neon-orange" />;
    return <Minus className="h-4 w-4 text-neon-cyan" />;
  };

  const getTrendText = () => {
    if (paceChange > 10) return `${percentChange}% faster`;
    if (paceChange < -10) return `${Math.abs(Number(percentChange))}% slower`;
    return 'Stable pace';
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel border border-neon-cyan/30 px-3 py-2 rounded-lg">
          <p className="text-neon-cyan text-sm font-medium">{label}</p>
          <p className="text-foreground text-lg font-bold">
            {formatPace(payload[0].value)} <span className="text-xs text-muted-foreground">min/km</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Get min and max for Y axis (with padding)
  const paces = paceData.map(d => d.pace);
  const minPace = Math.floor(Math.min(...paces) / 60) * 60 - 30;
  const maxPace = Math.ceil(Math.max(...paces) / 60) * 60 + 30;

  return (
    <Card className="glass-panel border-neon-cyan/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-neon-cyan neon-text-cyan flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Pace Evolution
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            {getTrendIcon()}
            <span className={`${paceChange > 10 ? 'text-neon-green' : paceChange < -10 ? 'text-neon-orange' : 'text-neon-cyan'}`}>
              {getTrendText()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={paceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="paceGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--neon-cyan))" />
                  <stop offset="50%" stopColor="hsl(var(--neon-purple))" />
                  <stop offset="100%" stopColor="hsl(var(--neon-green))" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--neon-cyan) / 0.1)" 
                vertical={false}
              />
              <XAxis 
                dataKey="dateLabel" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                domain={[minPace, maxPace]}
                tickFormatter={(value) => formatPace(value)}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                reversed
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="pace"
                stroke="url(#paceGradient)"
                strokeWidth={3}
                dot={{ 
                  fill: 'hsl(var(--neon-cyan))', 
                  strokeWidth: 2, 
                  r: 4,
                  stroke: 'hsl(var(--background))'
                }}
                activeDot={{ 
                  r: 6, 
                  fill: 'hsl(var(--neon-cyan))',
                  stroke: 'hsl(var(--neon-cyan))',
                  strokeWidth: 2,
                  filter: 'url(#glow)'
                }}
                filter="url(#glow)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-between text-xs text-muted-foreground">
          <div>
            <span className="text-neon-cyan">First:</span> {paceData[0].paceLabel} min/km
          </div>
          <div>
            <span className="text-neon-green">Latest:</span> {paceData[paceData.length - 1].paceLabel} min/km
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
