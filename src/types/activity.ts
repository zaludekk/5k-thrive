export type ActivityType = 'running' | 'strength' | 'swimming';

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

export interface StrengthActivity extends BaseActivity {
  type: 'strength';
  name: string;
  reps?: number;
  sets?: number;
  duration?: number; // in seconds
}

export interface SwimmingActivity extends BaseActivity {
  type: 'swimming';
  distance: number; // in meters
  time: number; // in seconds
}

export type Activity = RunningActivity | StrengthActivity | SwimmingActivity;

export interface ActivityStats {
  totalKmThisMonth: number;
  totalActivitiesThisMonth: number;
  best5KTime: number | null; // in seconds
}
