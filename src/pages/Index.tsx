import { useActivities } from '@/hooks/useActivities';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { GoalProgress } from '@/components/dashboard/GoalProgress';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { AddActivityDialog } from '@/components/activity/AddActivityDialog';
import { ActivityHistory } from '@/components/activity/ActivityHistory';
import { Activity } from '@/types/activity';

const Index = () => {
  const { activities, isLoading, addActivity, updateActivity, deleteActivity, getStats } = useActivities();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const stats = getStats();

  const handleAddActivity = (activity: Omit<Activity, 'id' | 'createdAt'>) => {
    addActivity(activity);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">5K Tracker</h1>
              <p className="text-sm text-muted-foreground">Cross-training & Running</p>
            </div>
            <AddActivityDialog onAdd={handleAddActivity} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <StatsCards stats={stats} />

        {/* Goal Progress */}
        <GoalProgress currentBestTime={stats.best5KTime} />

        {/* Activity Heatmap */}
        <ActivityHeatmap activities={activities} />

        {/* Activity History */}
        <ActivityHistory 
          activities={activities} 
          onUpdate={updateActivity}
          onDelete={deleteActivity}
        />
      </main>

      {/* Footer */}
      <footer className="border-t py-4 mt-8">
        <div className="container max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          Track your progress • Improve your 5K time
        </div>
      </footer>
    </div>
  );
};

export default Index;
