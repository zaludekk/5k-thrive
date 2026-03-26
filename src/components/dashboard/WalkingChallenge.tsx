import { MapPin } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Activity, WalkingActivity } from '@/types/activity';

interface WalkingChallengeProps {
  activities: Activity[];
}

const TOTAL_DISTANCE_KM = 1030; // Zlín to Paris

const MILESTONES = [
  { name: 'Plzeň', distance: 90, icon: '🍺' },
  { name: 'Zlín', distance: 150, icon: '👟' },
  { name: 'Nuremberg', distance: 300, icon: '🏰' },
  { name: 'Vídeň', distance: 350, icon: '🎻' },
  { name: 'Mnichov', distance: 430, icon: '🥨' },
  { name: 'Stuttgart', distance: 500, icon: '🚗' },
  { name: 'Metz', distance: 700, icon: '⛪' },
  { name: 'Reims', distance: 870, icon: '🥂' },
  { name: 'Paris', distance: 1030, icon: '🗼' },
];

export function WalkingChallenge({ activities }: WalkingChallengeProps) {
  const walkingActivities = activities.filter(a => a.type === 'walking') as WalkingActivity[];
  const totalKm = walkingActivities.reduce((sum, a) => sum + (a.distance || 0), 0);
  const roundedKm = Math.round(totalKm * 10) / 10;
  const remaining = Math.max(0, Math.round((TOTAL_DISTANCE_KM - totalKm) * 10) / 10);
  const percentage = Math.min((totalKm / TOTAL_DISTANCE_KM) * 100, 100);
  const completed = totalKm >= TOTAL_DISTANCE_KM;

  const reachedMilestones = MILESTONES.filter(m => totalKm >= m.distance);
  const nextMilestone = MILESTONES.find(m => totalKm < m.distance);

  if (walkingActivities.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel p-4 rounded-xl border border-walking/30">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-walking/20 flex items-center justify-center">
          <MapPin className="h-5 w-5 text-walking" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground">Road to Paris</h4>
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
            Zlín → Paris • {TOTAL_DISTANCE_KM} km
          </p>
        </div>
      </div>

      {completed ? (
        <div className="text-center py-4 space-y-2">
          <div className="text-4xl animate-bounce">🗼</div>
          <p className="text-walking font-bold text-lg" style={{ textShadow: '0 0 10px hsl(35 100% 55% / 0.5)' }}>
            BIENVENUE À PARIS!
          </p>
          <p className="text-sm text-muted-foreground">
            You walked {roundedKm} km and reached the Eiffel Tower!
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
          {/* Current target */}
          {nextMilestone && (
            <div className="text-center py-2">
              <span className="text-4xl">{nextMilestone.icon}</span>
              <p className="text-sm font-semibold text-walking mt-1">
                Next stop: {nextMilestone.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {nextMilestone.distance} km from Zlín
              </p>
            </div>
          )}

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>🏁 Zlín</span>
              <span className="text-walking font-medium">🗼 Paris</span>
            </div>
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted/30">
              <div
                className="h-full transition-all duration-500 rounded-full relative"
                style={{
                  width: `${Math.min(percentage, 100)}%`,
                  background: 'linear-gradient(90deg, hsl(var(--walking)), hsl(var(--neon-orange)))',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {roundedKm} km walked
              </span>
              <span className="text-walking font-semibold">
                {percentage.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Motivation */}
          <p className="text-xs text-center text-muted-foreground">
            🚶 You have walked <span className="text-walking font-semibold">{roundedKm} km</span>.
            Only <span className="text-walking font-semibold">{remaining} km</span> left to reach the Eiffel Tower!
          </p>

          {/* Reached milestones */}
          {reachedMilestones.length > 0 && (
            <div className="pt-2 border-t border-walking/10">
              <p className="text-xs text-muted-foreground text-center mb-2">Reached:</p>
              <div className="flex justify-center gap-3 flex-wrap">
                {reachedMilestones.map(m => (
                  <div key={m.name} className="flex items-center gap-1 text-xs text-walking/70">
                    <span>{m.icon}</span>
                    <span className="hidden sm:inline">{m.name}</span>
                    <span className="text-walking">✓</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming milestones */}
          {nextMilestone && (
            <div className="pt-2 border-t border-walking/10">
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
