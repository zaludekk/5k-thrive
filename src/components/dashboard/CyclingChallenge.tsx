import { Bike } from 'lucide-react';
import { Activity, CyclingActivity } from '@/types/activity';

interface CyclingChallengeProps {
  activities: Activity[];
}

const TOTAL_DISTANCE_KM = 1300; // Zlín to Rome

const MILESTONES = [
  { name: 'Munich', distance: 300, icon: '🍻' },
  { name: 'Crossing the Alps', distance: 600, icon: '🏔️' },
  { name: 'Verona', distance: 850, icon: '🏛️' },
  { name: 'Florence', distance: 1050, icon: '🎨' },
  { name: 'Rome', distance: 1300, icon: '🏟️' },
];

export function CyclingChallenge({ activities }: CyclingChallengeProps) {
  const cyclingActivities = activities.filter(a => a.type === 'cycling') as CyclingActivity[];
  const totalKm = cyclingActivities.reduce((sum, a) => sum + (a.distance || 0), 0);
  const roundedKm = Math.round(totalKm * 10) / 10;
  const remaining = Math.max(0, Math.round((TOTAL_DISTANCE_KM - totalKm) * 10) / 10);
  const percentage = Math.min((totalKm / TOTAL_DISTANCE_KM) * 100, 100);
  const completed = totalKm >= TOTAL_DISTANCE_KM;

  const reachedMilestones = MILESTONES.filter(m => totalKm >= m.distance);
  const nextMilestone = MILESTONES.find(m => totalKm < m.distance);

  if (cyclingActivities.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel p-4 rounded-xl border border-cycling/30">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-cycling/20 flex items-center justify-center">
          <Bike className="h-5 w-5 text-cycling" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground">Ride to Rome</h4>
            {reachedMilestones.length > 0 && (
              <div className="flex -space-x-1">
                {reachedMilestones.slice(-3).map((m) => (
                  <span key={m.name} className="text-lg" title={`${m.name} ✓`}>
                    {m.icon}
                  </span>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Zlín → Rome • {TOTAL_DISTANCE_KM} km
          </p>
        </div>
      </div>

      {completed ? (
        <div className="text-center py-4 space-y-2">
          <div className="text-4xl animate-bounce">🏟️</div>
          <p className="text-cycling font-bold text-lg" style={{ textShadow: '0 0 10px hsl(55 100% 50% / 0.5)' }}>
            BENVENUTO A ROMA!
          </p>
          <p className="text-sm text-muted-foreground">
            You cycled {roundedKm} km and reached the Colosseum!
          </p>
          <div className="flex justify-center gap-2 mt-2">
            {MILESTONES.map(m => (
              <span key={m.name} className="text-xl" title={m.name}>
                {m.icon}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {nextMilestone && (
            <div className="text-center py-2">
              <span className="text-4xl">{nextMilestone.icon}</span>
              <p className="text-sm font-semibold text-cycling mt-1">
                Next stop: {nextMilestone.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {nextMilestone.distance} km from Zlín
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>🏁 Zlín</span>
              <span className="text-cycling font-medium">🏟️ Rome</span>
            </div>
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted/30">
              <div
                className="h-full transition-all duration-500 rounded-full relative"
                style={{
                  width: `${Math.min(percentage, 100)}%`,
                  background: 'linear-gradient(90deg, hsl(var(--cycling)), hsl(var(--neon-yellow)))',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {roundedKm} km cycled
              </span>
              <span className="text-cycling font-semibold">
                {percentage.toFixed(1)}%
              </span>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            🚴 You have cycled <span className="text-cycling font-semibold">{roundedKm} km</span>.
            Only <span className="text-cycling font-semibold">{remaining} km</span> left to reach Rome!
          </p>

          {reachedMilestones.length > 0 && (
            <div className="pt-2 border-t border-cycling/10">
              <p className="text-xs text-muted-foreground text-center mb-2">Reached:</p>
              <div className="flex justify-center gap-3 flex-wrap">
                {reachedMilestones.map(m => (
                  <div key={m.name} className="flex items-center gap-1 text-xs text-cycling/70">
                    <span>{m.icon}</span>
                    <span className="hidden sm:inline">{m.name}</span>
                    <span className="text-cycling">✓</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {nextMilestone && (
            <div className="pt-2 border-t border-cycling/10">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                {MILESTONES.filter(m => totalKm < m.distance).slice(0, 3).map(m => (
                  <div key={m.name} className="flex items-center gap-1 opacity-50">
                    <span>{m.icon}</span>
                    <span className="hidden sm:inline">{m.name}</span>
                    <span className="text-muted-foreground">{m.distance}km</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
