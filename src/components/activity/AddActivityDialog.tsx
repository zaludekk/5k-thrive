import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Activity, ActivityType, RunningActivity, SquatsActivity, PushupActivity, PlankActivity, SwimmingActivity } from '@/types/activity';
import { Plus, CalendarIcon, Waves } from 'lucide-react';
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
  
  // Squats state
  const [squatsReps, setSquatsReps] = useState(
    editActivity?.type === 'squats' && editActivity.reps ? editActivity.reps.toString() : ''
  );
  const [squatsSets, setSquatsSets] = useState(
    editActivity?.type === 'squats' && editActivity.sets ? editActivity.sets.toString() : ''
  );
  
  // Push-up state
  const [pushupReps, setPushupReps] = useState(
    editActivity?.type === 'pushup' && editActivity.reps ? editActivity.reps.toString() : ''
  );
  const [pushupSets, setPushupSets] = useState(
    editActivity?.type === 'pushup' && editActivity.sets ? editActivity.sets.toString() : ''
  );
  
  // Plank state
  const [plankMinutes, setPlankMinutes] = useState(
    editActivity?.type === 'plank' ? Math.floor(editActivity.duration / 60).toString() : ''
  );
  const [plankSeconds, setPlankSeconds] = useState(
    editActivity?.type === 'plank' ? (editActivity.duration % 60).toString() : ''
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
    setSquatsReps('');
    setSquatsSets('');
    setPushupReps('');
    setPushupSets('');
    setPlankMinutes('');
    setPlankSeconds('');
    setSwimDistance('');
    setSwimMinutes('');
    setSwimSeconds('');
  };

  const handleSubmit = () => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    let activityData: Omit<RunningActivity, 'id' | 'createdAt'> | Omit<SquatsActivity, 'id' | 'createdAt'> | Omit<PushupActivity, 'id' | 'createdAt'> | Omit<PlankActivity, 'id' | 'createdAt'> | Omit<SwimmingActivity, 'id' | 'createdAt'>;
    
    if (activeTab === 'running') {
      activityData = {
        type: 'running' as const,
        date: dateStr,
        distance: parseFloat(distance) || 0,
        time: (parseInt(runMinutes) || 0) * 60 + (parseInt(runSeconds) || 0),
        feeling,
      };
    } else if (activeTab === 'squats') {
      activityData = {
        type: 'squats' as const,
        date: dateStr,
        reps: squatsReps ? parseInt(squatsReps) : undefined,
        sets: squatsSets ? parseInt(squatsSets) : undefined,
      };
    } else if (activeTab === 'pushup') {
      activityData = {
        type: 'pushup' as const,
        date: dateStr,
        reps: pushupReps ? parseInt(pushupReps) : undefined,
        sets: pushupSets ? parseInt(pushupSets) : undefined,
      };
    } else if (activeTab === 'plank') {
      activityData = {
        type: 'plank' as const,
        date: dateStr,
        duration: (parseInt(plankMinutes) || 0) * 60 + (parseInt(plankSeconds) || 0),
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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="running" className="gap-1 text-xs px-1">
                <span>🏃</span> Running
              </TabsTrigger>
              <TabsTrigger value="squats" className="gap-1 text-xs px-1">
                <span>🏋️</span> Squats
              </TabsTrigger>
              <TabsTrigger value="pushup" className="gap-1 text-xs px-1">
                <span>💪</span> Push-Up
              </TabsTrigger>
              <TabsTrigger value="plank" className="gap-1 text-xs px-1">
                <span>🧘</span> Plank
              </TabsTrigger>
              <TabsTrigger value="swimming" className="gap-1 text-xs px-1">
                <Waves className="h-3 w-3" /> Swim
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

            {/* Squats Form */}
            <TabsContent value="squats" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Reps</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 15"
                    value={squatsReps}
                    onChange={(e) => setSquatsReps(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sets</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 3"
                    value={squatsSets}
                    onChange={(e) => setSquatsSets(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Push-Up Form */}
            <TabsContent value="pushup" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Reps</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 20"
                    value={pushupReps}
                    onChange={(e) => setPushupReps(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sets</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 3"
                    value={pushupSets}
                    onChange={(e) => setPushupSets(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Plank Form */}
            <TabsContent value="plank" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Duration</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={plankMinutes}
                    onChange={(e) => setPlankMinutes(e.target.value)}
                    className="w-20"
                  />
                  <span>:</span>
                  <Input
                    type="number"
                    placeholder="Sec"
                    value={plankSeconds}
                    onChange={(e) => setPlankSeconds(e.target.value)}
                    className="w-20"
                  />
                </div>
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
