import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Activity, ActivityType, RunningActivity, StrengthActivity, SwimmingActivity } from '@/types/activity';
import { Plus, CalendarIcon, Dumbbell, Waves } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FeelingSelector } from './FeelingSelector';

interface AddActivityDialogProps {
  onAdd: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
  editActivity?: Activity;
  onUpdate?: (activity: Activity) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddActivityDialog({ onAdd, editActivity, onUpdate, open, onOpenChange }: AddActivityDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;
  
  const [activeTab, setActiveTab] = useState<ActivityType>(editActivity?.type || 'running');
  const [date, setDate] = useState<Date>(editActivity ? new Date(editActivity.date) : new Date());
  
  // Running state
  const [distance, setDistance] = useState(
    editActivity?.type === 'running' ? editActivity.distance.toString() : ''
  );
  const [runMinutes, setRunMinutes] = useState(
    editActivity?.type === 'running' ? Math.floor(editActivity.time / 60).toString() : ''
  );
  const [runSeconds, setRunSeconds] = useState(
    editActivity?.type === 'running' ? (editActivity.time % 60).toString() : ''
  );
  const [feeling, setFeeling] = useState(
    editActivity?.type === 'running' ? editActivity.feeling : 3
  );
  
  // Strength state
  const [exerciseName, setExerciseName] = useState(
    editActivity?.type === 'strength' ? editActivity.name : ''
  );
  const [reps, setReps] = useState(
    editActivity?.type === 'strength' && editActivity.reps ? editActivity.reps.toString() : ''
  );
  const [sets, setSets] = useState(
    editActivity?.type === 'strength' && editActivity.sets ? editActivity.sets.toString() : ''
  );
  const [strengthDuration, setStrengthDuration] = useState(
    editActivity?.type === 'strength' && editActivity.duration 
      ? Math.floor(editActivity.duration / 60).toString() 
      : ''
  );
  
  // Swimming state
  const [swimDistance, setSwimDistance] = useState(
    editActivity?.type === 'swimming' ? editActivity.distance.toString() : ''
  );
  const [swimMinutes, setSwimMinutes] = useState(
    editActivity?.type === 'swimming' ? Math.floor(editActivity.time / 60).toString() : ''
  );
  const [swimSeconds, setSwimSeconds] = useState(
    editActivity?.type === 'swimming' ? (editActivity.time % 60).toString() : ''
  );

  const resetForm = () => {
    setDate(new Date());
    setDistance('');
    setRunMinutes('');
    setRunSeconds('');
    setFeeling(3);
    setExerciseName('');
    setReps('');
    setSets('');
    setStrengthDuration('');
    setSwimDistance('');
    setSwimMinutes('');
    setSwimSeconds('');
  };

  const handleSubmit = () => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    let activityData: Omit<RunningActivity, 'id' | 'createdAt'> | Omit<StrengthActivity, 'id' | 'createdAt'> | Omit<SwimmingActivity, 'id' | 'createdAt'>;
    
    if (activeTab === 'running') {
      activityData = {
        type: 'running' as const,
        date: dateStr,
        distance: parseFloat(distance) || 0,
        time: (parseInt(runMinutes) || 0) * 60 + (parseInt(runSeconds) || 0),
        feeling,
      };
    } else if (activeTab === 'strength') {
      activityData = {
        type: 'strength' as const,
        date: dateStr,
        name: exerciseName,
        reps: reps ? parseInt(reps) : undefined,
        sets: sets ? parseInt(sets) : undefined,
        duration: strengthDuration ? parseInt(strengthDuration) * 60 : undefined,
      };
    } else {
      activityData = {
        type: 'swimming' as const,
        date: dateStr,
        distance: parseInt(swimDistance) || 0,
        time: (parseInt(swimMinutes) || 0) * 60 + (parseInt(swimSeconds) || 0),
      };
    }

    if (editActivity && onUpdate) {
      onUpdate({ ...activityData, id: editActivity.id, createdAt: editActivity.createdAt } as Activity);
    } else {
      onAdd(activityData);
    }
    
    resetForm();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!editActivity && (
        <DialogTrigger asChild>
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Add Activity
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editActivity ? 'Edit Activity' : 'Log New Activity'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Activity Type Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActivityType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="running" className="gap-1">
                <span className="text-running">🏃</span> Running
              </TabsTrigger>
              <TabsTrigger value="strength" className="gap-1">
                <Dumbbell className="h-4 w-4" /> Strength
              </TabsTrigger>
              <TabsTrigger value="swimming" className="gap-1">
                <Waves className="h-4 w-4" /> Swimming
              </TabsTrigger>
            </TabsList>
            
            {/* Running Form */}
            <TabsContent value="running" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Distance (km)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 5.0"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={runMinutes}
                    onChange={(e) => setRunMinutes(e.target.value)}
                    className="w-20"
                  />
                  <span>:</span>
                  <Input
                    type="number"
                    placeholder="Sec"
                    value={runSeconds}
                    onChange={(e) => setRunSeconds(e.target.value)}
                    className="w-20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>How did you feel?</Label>
                <FeelingSelector value={feeling} onChange={setFeeling} />
              </div>
            </TabsContent>

            {/* Strength Form */}
            <TabsContent value="strength" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Exercise Name</Label>
                <Input
                  placeholder="e.g., Push-ups, Squats"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Reps</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 10"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sets</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 3"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes, optional)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 30"
                  value={strengthDuration}
                  onChange={(e) => setStrengthDuration(e.target.value)}
                />
              </div>
            </TabsContent>

            {/* Swimming Form */}
            <TabsContent value="swimming" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Distance (meters)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 1000"
                  value={swimDistance}
                  onChange={(e) => setSwimDistance(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={swimMinutes}
                    onChange={(e) => setSwimMinutes(e.target.value)}
                    className="w-20"
                  />
                  <span>:</span>
                  <Input
                    type="number"
                    placeholder="Sec"
                    value={swimSeconds}
                    onChange={(e) => setSwimSeconds(e.target.value)}
                    className="w-20"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={handleSubmit} className="w-full">
            {editActivity ? 'Update Activity' : 'Save Activity'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
