export type ActivityType = 'running' | 'squats' | 'pushup' | 'plank' | 'swimming' | 'walking' | 'cycling' | 'grip';

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

export interface WalkingActivity extends BaseActivity {
  type: 'walking';
  distance: number; // in km
  time: number; // in seconds
  steps?: number;
}

export interface CyclingActivity extends BaseActivity {
  type: 'cycling';
  distance: number; // in km
  duration: number; // in seconds
  elevationGain?: number; // in meters
}

export interface GripActivity extends BaseActivity {
  type: 'grip';
  reps?: number;
  sets?: number;
}

export type Activity = RunningActivity | SquatsActivity | PushupActivity | PlankActivity | SwimmingActivity | WalkingActivity | CyclingActivity | GripActivity;

export interface ActivityStats {
  totalRunningKmThisMonth: number;
  totalAllKmThisMonth: number;
  totalActivitiesThisMonth: number;
  best5KTime: number | null; // in seconds
}
