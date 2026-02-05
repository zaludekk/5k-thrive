import { useActivities } from '@/hooks/useActivities';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { GoalProgress } from '@/components/dashboard/GoalProgress';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { AddActivityDialog } from '@/components/activity/AddActivityDialog';
import { ActivityHistory } from '@/components/activity/ActivityHistory';
import { Activity } from '@/types/activity';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportActivitiesToCSV } from '@/lib/exportActivities';

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
      <header className="sticky top-0 z-10 glass-panel border-b border-neon-cyan/20">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neon-cyan neon-text-cyan uppercase tracking-widest">5K Tracker</h1>
              <p className="text-sm text-muted-foreground tracking-wider">Cross-training & Running HUD</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportActivitiesToCSV(activities)}
                disabled={activities.length === 0}
              >
                <Download className="h-4 w-4 mr-1" />
                Download Data
              </Button>
              <AddActivityDialog onAdd={handleAddActivity} />
            </div>
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
      <footer className="border-t border-neon-cyan/10 py-4 mt-8">
        <div className="container max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <span className="text-neon-cyan/60">◆</span> Track your progress <span className="text-neon-cyan/60">◆</span> Improve your 5K time <span className="text-neon-cyan/60">◆</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
