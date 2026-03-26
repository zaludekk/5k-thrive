import { useState } from 'react';
import { useActivities } from '@/hooks/useActivities';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { GoalProgress } from '@/components/dashboard/GoalProgress';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { PaceEvolution } from '@/components/dashboard/PaceEvolution';
import { DistanceEvolution } from '@/components/dashboard/DistanceEvolution';
import { AddActivityDialog } from '@/components/activity/AddActivityDialog';
import { ActivityHistory } from '@/components/activity/ActivityHistory';
import { Activity } from '@/types/activity';
import { Button } from '@/components/ui/button';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportActivitiesToCSV } from '@/lib/exportActivities';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const { activities, isLoading, addActivity, updateActivity, deleteActivity, getStats } = useActivities();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const goToPrevMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isCurrentMonth = selectedDate.getMonth() === new Date().getMonth() && selectedDate.getFullYear() === new Date().getFullYear();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const stats = getStats(selectedDate);

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
        {/* Month Picker */}
        <Card className="glass-panel border-neon-cyan/20">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-center gap-4">
              <Button variant="ghost" size="icon" onClick={goToPrevMonth} className="text-muted-foreground hover:text-neon-cyan">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-lg font-bold text-neon-cyan neon-text-cyan uppercase tracking-widest min-w-[180px] text-center">
                {format(selectedDate, 'LLLL yyyy', { locale: cs })}
              </span>
              <Button variant="ghost" size="icon" onClick={goToNextMonth} disabled={isCurrentMonth} className="text-muted-foreground hover:text-neon-cyan disabled:opacity-30">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <StatsCards stats={stats} />

        {/* Goal Progress */}
        <GoalProgress currentBestTime={stats.best5KTime} />

        {/* Activity Heatmap */}
        <ActivityHeatmap activities={activities} />

        {/* Pace Evolution Chart */}
        <PaceEvolution activities={activities} />

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
