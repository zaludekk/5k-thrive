import { useState, useEffect, useCallback } from 'react';
import { Activity, ActivityStats, RunningActivity, StrengthActivity, SwimmingActivity } from '@/types/activity';
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
            } else if (activity.type === 'strength') {
              const strengthActivity = activity as StrengthActivity;
              insertData = {
                ...baseData,
                name: strengthActivity.name,
                reps: strengthActivity.reps,
                sets: strengthActivity.sets,
                duration: strengthActivity.duration,
              };
            } else if (activity.type === 'swimming') {
              const swimActivity = activity as SwimmingActivity;
              insertData = {
                ...baseData,
                distance: swimActivity.distance,
                time: swimActivity.time,
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
        } else if (record.type === 'strength') {
          return {
            ...baseActivity,
            type: 'strength' as const,
            name: record.name || '',
            reps: record.reps,
            sets: record.sets,
            duration: record.duration,
          };
        } else {
          return {
            ...baseActivity,
            type: 'swimming' as const,
            distance: Number(record.distance),
            time: record.time || 0,
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
    } else if (activity.type === 'strength') {
      const strengthActivity = activity as Omit<StrengthActivity, 'id' | 'createdAt'>;
      insertData = {
        ...baseData,
        name: strengthActivity.name,
        reps: strengthActivity.reps,
        sets: strengthActivity.sets,
        duration: strengthActivity.duration,
      };
    } else if (activity.type === 'swimming') {
      const swimActivity = activity as Omit<SwimmingActivity, 'id' | 'createdAt'>;
      insertData = {
        ...baseData,
        distance: swimActivity.distance,
        time: swimActivity.time,
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
      };
    } else if (updatedActivity.type === 'strength') {
      const strengthActivity = updatedActivity as StrengthActivity;
      updateData = {
        ...updateData,
        name: strengthActivity.name,
        reps: strengthActivity.reps,
        sets: strengthActivity.sets,
        duration: strengthActivity.duration,
        distance: null,
        time: null,
        feeling: null,
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

    // Calculate total km (running + swimming converted)
    let totalKm = 0;
    thisMonthActivities.forEach(activity => {
      if (activity.type === 'running') {
        totalKm += activity.distance;
      } else if (activity.type === 'swimming') {
        totalKm += activity.distance / 1000; // meters to km
      }
    });

    // Find best 5K time (runs between 4.9km and 5.1km)
    const fiveKRuns = activities.filter(
      activity => activity.type === 'running' && 
      activity.distance >= 4.9 && 
      activity.distance <= 5.1
    ) as RunningActivity[];
    
    const best5KTime = fiveKRuns.length > 0 
      ? Math.min(...fiveKRuns.map(run => run.time))
      : null;

    return {
      totalKmThisMonth: Math.round(totalKm * 10) / 10,
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
