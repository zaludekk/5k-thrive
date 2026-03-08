import { useState, useEffect, useCallback } from 'react';
import { Activity, ActivityStats, RunningActivity, SquatsActivity, PushupActivity, PlankActivity, SwimmingActivity, WalkingActivity, CyclingActivity } from '@/types/activity';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

const STORAGE_KEY = 'fitness-tracker-activities';

type ActivityInsert = {
  id?: string;
  type: string;
  date: string;
  created_at?: string;
  distance?: number | null;
  time?: number | null;
  feeling?: number | null;
  name?: string | null;
  reps?: number | null;
  sets?: number | null;
  duration?: number | null;
  steps?: number | null;
  elevation_gain?: number | null;
  user_id?: string | null;
};

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Migrate localStorage data to database
  const migrateLocalStorageData = useCallback(async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const localActivities = JSON.parse(stored) as Activity[];
        if (localActivities.length > 0) {
          // Insert each activity into database
          for (const activity of localActivities) {
            const baseData: ActivityInsert = {
              id: activity.id,
              type: activity.type,
              date: activity.date.split('T')[0],
              created_at: activity.createdAt,
            };

            let insertData: ActivityInsert = baseData;

            if (activity.type === 'running') {
              const runActivity = activity as RunningActivity;
              insertData = {
                ...baseData,
                distance: runActivity.distance,
                time: runActivity.time,
                feeling: runActivity.feeling,
              };
            } else if (activity.type === 'squats') {
              const squatsActivity = activity as SquatsActivity;
              insertData = {
                ...baseData,
                name: 'Squats',
                reps: squatsActivity.reps,
                sets: squatsActivity.sets,
              };
            } else if (activity.type === 'pushup') {
              const pushupActivity = activity as PushupActivity;
              insertData = {
                ...baseData,
                name: 'Push-Up',
                reps: pushupActivity.reps,
                sets: pushupActivity.sets,
              };
            } else if (activity.type === 'plank') {
              const plankActivity = activity as PlankActivity;
              insertData = {
                ...baseData,
                name: 'Plank',
                duration: plankActivity.duration,
              };
            } else if (activity.type === 'swimming') {
              const swimActivity = activity as SwimmingActivity;
              insertData = {
                ...baseData,
                distance: swimActivity.distance,
                time: swimActivity.time,
              };
            } else if (activity.type === 'walking') {
              const walkActivity = activity as WalkingActivity;
              insertData = {
                ...baseData,
                distance: walkActivity.distance,
                time: walkActivity.time,
                steps: walkActivity.steps,
              };
            } else if (activity.type === 'cycling') {
              const cycleActivity = activity as CyclingActivity;
              insertData = {
                ...baseData,
                distance: cycleActivity.distance,
                duration: cycleActivity.duration,
                elevation_gain: cycleActivity.elevationGain,
              };
            }

            await supabase.from('activities').upsert(insertData);
          }
          
          // Clear localStorage after successful migration
          localStorage.removeItem(STORAGE_KEY);
          console.log('Migrated', localActivities.length, 'activities from localStorage to database');
        }
      }
    } catch (error) {
      console.error('Failed to migrate localStorage data:', error);
    }
  }, []);

  // Load activities from database
  const fetchActivities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      // Transform database records to Activity type
      const transformedActivities: Activity[] = (data || []).map((record) => {
        const baseActivity = {
          id: record.id,
          date: record.date,
          createdAt: record.created_at,
        };

        if (record.type === 'running') {
          return {
            ...baseActivity,
            type: 'running' as const,
            distance: Number(record.distance),
            time: record.time || 0,
            feeling: record.feeling || 3,
          };
        } else if (record.type === 'squats' || (record.type === 'strength' && record.name?.toLowerCase() === 'squats')) {
          return {
            ...baseActivity,
            type: 'squats' as const,
            reps: record.reps ?? undefined,
            sets: record.sets ?? undefined,
          };
        } else if (record.type === 'pushup' || (record.type === 'strength' && (record.name?.toLowerCase() === 'push-up' || record.name?.toLowerCase() === 'push'))) {
          return {
            ...baseActivity,
            type: 'pushup' as const,
            reps: record.reps ?? undefined,
            sets: record.sets ?? undefined,
          };
        } else if (record.type === 'plank' || (record.type === 'strength' && record.name?.toLowerCase() === 'plank')) {
          return {
            ...baseActivity,
            type: 'plank' as const,
            duration: record.duration || 0,
          };
        } else if (record.type === 'swimming') {
          return {
            ...baseActivity,
            type: 'swimming' as const,
            distance: Number(record.distance),
            time: record.time || 0,
          };
        } else if (record.type === 'walking') {
          return {
            ...baseActivity,
            type: 'walking' as const,
            distance: Number(record.distance),
            time: record.time || 0,
            steps: record.steps ?? undefined,
          };
        } else if (record.type === 'cycling') {
          return {
            ...baseActivity,
            type: 'cycling' as const,
            distance: Number(record.distance),
            duration: record.duration || 0,
            elevationGain: record.elevation_gain ?? undefined,
          };
        } else {
          // Fallback for unknown strength activities - treat as squats
          return {
            ...baseActivity,
            type: 'squats' as const,
            reps: record.reps ?? undefined,
            sets: record.sets ?? undefined,
          };
        }
      });

      setActivities(transformedActivities);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize: migrate and then fetch
  useEffect(() => {
    const init = async () => {
      await migrateLocalStorageData();
      await fetchActivities();
    };
    init();
  }, [migrateLocalStorageData, fetchActivities]);

  const addActivity = useCallback(async (activity: Omit<Activity, 'id' | 'createdAt'>) => {
    const newId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const baseData: ActivityInsert = {
      id: newId,
      type: activity.type,
      date: activity.date.split('T')[0],
      created_at: createdAt,
    };

    let insertData: ActivityInsert = baseData;

    if (activity.type === 'running') {
      const runActivity = activity as Omit<RunningActivity, 'id' | 'createdAt'>;
      insertData = {
        ...baseData,
        distance: runActivity.distance,
        time: runActivity.time,
        feeling: runActivity.feeling,
      };
    } else if (activity.type === 'squats') {
      const squatsActivity = activity as Omit<SquatsActivity, 'id' | 'createdAt'>;
      insertData = {
        ...baseData,
        name: 'Squats',
        reps: squatsActivity.reps,
        sets: squatsActivity.sets,
      };
    } else if (activity.type === 'pushup') {
      const pushupActivity = activity as Omit<PushupActivity, 'id' | 'createdAt'>;
      insertData = {
        ...baseData,
        name: 'Push-Up',
        reps: pushupActivity.reps,
        sets: pushupActivity.sets,
      };
    } else if (activity.type === 'plank') {
      const plankActivity = activity as Omit<PlankActivity, 'id' | 'createdAt'>;
      insertData = {
        ...baseData,
        name: 'Plank',
        duration: plankActivity.duration,
      };
    } else if (activity.type === 'swimming') {
      const swimActivity = activity as Omit<SwimmingActivity, 'id' | 'createdAt'>;
      insertData = {
        ...baseData,
        distance: swimActivity.distance,
        time: swimActivity.time,
      };
    } else if (activity.type === 'walking') {
      const walkActivity = activity as Omit<WalkingActivity, 'id' | 'createdAt'>;
      insertData = {
        ...baseData,
        distance: walkActivity.distance,
        time: walkActivity.time,
        steps: walkActivity.steps,
      };
    } else if (activity.type === 'cycling') {
      const cycleActivity = activity as Omit<CyclingActivity, 'id' | 'createdAt'>;
      insertData = {
        ...baseData,
        distance: cycleActivity.distance,
        duration: cycleActivity.duration,
        elevation_gain: cycleActivity.elevationGain,
      };
    }

    const { error } = await supabase.from('activities').insert(insertData);

    if (error) {
      console.error('Failed to add activity:', error);
      return null;
    }

    // Refetch to ensure consistency
    await fetchActivities();
    
    return { ...activity, id: newId, createdAt } as Activity;
  }, [fetchActivities]);

  const updateActivity = useCallback(async (id: string, updatedActivity: Activity) => {
    let updateData: ActivityInsert = {
      type: updatedActivity.type,
      date: updatedActivity.date.split('T')[0],
    };

    if (updatedActivity.type === 'running') {
      const runActivity = updatedActivity as RunningActivity;
      updateData = {
        ...updateData,
        distance: runActivity.distance,
        time: runActivity.time,
        feeling: runActivity.feeling,
        name: null,
        reps: null,
        sets: null,
        duration: null,
        steps: null,
      };
    } else if (updatedActivity.type === 'squats') {
      const squatsActivity = updatedActivity as SquatsActivity;
      updateData = {
        ...updateData,
        name: 'Squats',
        reps: squatsActivity.reps,
        sets: squatsActivity.sets,
        distance: null,
        time: null,
        feeling: null,
        duration: null,
        steps: null,
      };
    } else if (updatedActivity.type === 'pushup') {
      const pushupActivity = updatedActivity as PushupActivity;
      updateData = {
        ...updateData,
        name: 'Push-Up',
        reps: pushupActivity.reps,
        sets: pushupActivity.sets,
        distance: null,
        time: null,
        feeling: null,
        duration: null,
        steps: null,
      };
    } else if (updatedActivity.type === 'plank') {
      const plankActivity = updatedActivity as PlankActivity;
      updateData = {
        ...updateData,
        name: 'Plank',
        duration: plankActivity.duration,
        distance: null,
        time: null,
        feeling: null,
        reps: null,
        sets: null,
        steps: null,
      };
    } else if (updatedActivity.type === 'swimming') {
      const swimActivity = updatedActivity as SwimmingActivity;
      updateData = {
        ...updateData,
        distance: swimActivity.distance,
        time: swimActivity.time,
        name: null,
        reps: null,
        sets: null,
        duration: null,
        feeling: null,
        steps: null,
      };
    } else if (updatedActivity.type === 'walking') {
      const walkActivity = updatedActivity as WalkingActivity;
      updateData = {
        ...updateData,
        distance: walkActivity.distance,
        time: walkActivity.time,
        steps: walkActivity.steps ?? null,
        name: null,
        reps: null,
        sets: null,
        duration: null,
        feeling: null,
        elevation_gain: null,
      };
    } else if (updatedActivity.type === 'cycling') {
      const cycleActivity = updatedActivity as CyclingActivity;
      updateData = {
        ...updateData,
        distance: cycleActivity.distance,
        duration: cycleActivity.duration,
        elevation_gain: cycleActivity.elevationGain ?? null,
        name: null,
        reps: null,
        sets: null,
        time: null,
        feeling: null,
        steps: null,
      };
    }

    const { error } = await supabase
      .from('activities')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Failed to update activity:', error);
      return;
    }

    await fetchActivities();
  }, [fetchActivities]);

  const deleteActivity = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete activity:', error);
      return;
    }

    await fetchActivities();
  }, [fetchActivities]);

  const getStats = useCallback((): ActivityStats => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const thisMonthActivities = activities.filter(activity => {
      const activityDate = parseISO(activity.date);
      return isWithinInterval(activityDate, { start: monthStart, end: monthEnd });
    });

    let totalRunningKm = 0;
    let totalAllKm = 0;
    thisMonthActivities.forEach(activity => {
      if (activity.type === 'running') {
        totalRunningKm += activity.distance;
        totalAllKm += activity.distance;
      } else if (activity.type === 'swimming') {
        totalAllKm += activity.distance / 1000;
      } else if (activity.type === 'walking') {
        totalAllKm += activity.distance;
      } else if (activity.type === 'cycling') {
        totalAllKm += activity.distance;
      }
    });

    const fiveKRuns = activities.filter(
      activity => activity.type === 'running' && 
      activity.distance >= 4.9 && 
      activity.distance <= 5.1
    ) as RunningActivity[];
    
    const best5KTime = fiveKRuns.length > 0 
      ? Math.min(...fiveKRuns.map(run => run.time))
      : null;

    return {
      totalRunningKmThisMonth: Math.round(totalRunningKm * 10) / 10,
      totalAllKmThisMonth: Math.round(totalAllKm * 10) / 10,
      totalActivitiesThisMonth: thisMonthActivities.length,
      best5KTime,
    };
  }, [activities]);

  return {
    activities,
    isLoading,
    addActivity,
    updateActivity,
    deleteActivity,
    getStats,
  };
}
