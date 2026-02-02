import { useState, useEffect, useCallback } from 'react';
import { Activity, ActivityStats } from '@/types/activity';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

const STORAGE_KEY = 'fitness-tracker-activities';

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load activities from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setActivities(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save activities to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    }
  }, [activities, isLoading]);

  const addActivity = useCallback((activity: Omit<Activity, 'id' | 'createdAt'>) => {
    const newActivity = {
      ...activity,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    } as Activity;
    
    setActivities(prev => [...prev, newActivity]);
    return newActivity;
  }, []);

  const updateActivity = useCallback((id: string, updatedActivity: Activity) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id ? updatedActivity : activity
      )
    );
  }, []);

  const deleteActivity = useCallback((id: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
  }, []);

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
    );
    
    const best5KTime = fiveKRuns.length > 0 
      ? Math.min(...fiveKRuns.map(run => (run as any).time))
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
