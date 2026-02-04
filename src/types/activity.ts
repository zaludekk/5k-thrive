export type ActivityType = 'running' | 'squats' | 'pushup' | 'plank' | 'swimming';

export interface BaseActivity {
  id: string;
  type: ActivityType;
  date: string; // ISO date string
  createdAt: string;
}

export interface RunningActivity extends BaseActivity {
  type: 'running';
  distance: number; // in km
  time: number; // in seconds
  feeling: number; // 1-5
}

export interface SquatsActivity extends BaseActivity {
  type: 'squats';
  reps?: number;
  sets?: number;
}

export interface PushupActivity extends BaseActivity {
  type: 'pushup';
  reps?: number;
  sets?: number;
}

export interface PlankActivity extends BaseActivity {
  type: 'plank';
  duration: number; // in seconds
}

export interface SwimmingActivity extends BaseActivity {
  type: 'swimming';
  distance: number; // in meters
  time: number; // in seconds
}

export type Activity = RunningActivity | SquatsActivity | PushupActivity | PlankActivity | SwimmingActivity;

export interface ActivityStats {
  totalKmThisMonth: number;
  totalActivitiesThisMonth: number;
  best5KTime: number | null; // in seconds
}
