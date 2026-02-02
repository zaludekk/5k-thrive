import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, RunningActivity, StrengthActivity, SwimmingActivity } from '@/types/activity';
import { AddActivityDialog } from './AddActivityDialog';
import { format, parseISO } from 'date-fns';
import { Pencil, Trash2, Dumbbell, Waves, Star, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ActivityHistoryProps {
  activities: Activity[];
  onUpdate: (id: string, activity: Activity) => void;
  onDelete: (id: string) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function ActivityIcon({ type }: { type: Activity['type'] }) {
  switch (type) {
    case 'running':
      return <span className="text-lg">🏃</span>;
    case 'strength':
      return <Dumbbell className="h-4 w-4 text-strength" />;
    case 'swimming':
      return <Waves className="h-4 w-4 text-swimming" />;
  }
}

function ActivityDetails({ activity }: { activity: Activity }) {
  switch (activity.type) {
    case 'running':
      return (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{activity.distance} km</span>
          <span>•</span>
          <span>{formatTime(activity.time)}</span>
          <span>•</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-3 w-3",
                  star <= activity.feeling ? "text-star fill-current" : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>
      );
    case 'strength':
      return (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{activity.name}</span>
          {activity.reps && activity.sets && (
            <>
              <span>•</span>
              <span>{activity.sets}×{activity.reps} reps</span>
            </>
          )}
          {activity.duration && (
            <>
              <span>•</span>
              <span>{Math.floor(activity.duration / 60)} min</span>
            </>
          )}
        </div>
      );
    case 'swimming':
      return (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{activity.distance}m</span>
          <span>•</span>
          <span>{formatTime(activity.time)}</span>
        </div>
      );
  }
}

export function ActivityHistory({ activities, onUpdate, onDelete }: ActivityHistoryProps) {
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleUpdate = (activity: Activity) => {
    onUpdate(activity.id, activity);
    setEditingActivity(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Activity History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No activities logged yet.</p>
              <p className="text-sm">Start tracking your progress!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-colors",
                    activity.type === 'running' && "border-l-4 border-l-running",
                    activity.type === 'strength' && "border-l-4 border-l-strength",
                    activity.type === 'swimming' && "border-l-4 border-l-swimming"
                  )}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                      <ActivityIcon type={activity.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <span>{format(parseISO(activity.date), 'EEE, MMM d')}</span>
                        <span className="capitalize px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {activity.type}
                        </span>
                      </div>
                      <ActivityDetails activity={activity} />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingActivity(activity)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Activity?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this activity. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(activity.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingActivity && (
        <AddActivityDialog
          editActivity={editingActivity}
          onAdd={() => {}}
          onUpdate={handleUpdate}
          open={!!editingActivity}
          onOpenChange={(open) => !open && setEditingActivity(null)}
        />
      )}
    </>
  );
}
