import { Activity } from '@/types/activity';
import { format, parseISO } from 'date-fns';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function exportActivitiesToCSV(activities: Activity[]): void {
  if (activities.length === 0) {
    return;
  }

  const headers = ['Date', 'Type', 'Details', 'Distance', 'Time', 'Feeling', 'Sets', 'Reps', 'Duration', 'Steps'];
  
  const rows = activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(activity => {
      const date = format(parseISO(activity.date), 'yyyy-MM-dd');
      
      switch (activity.type) {
        case 'running':
          return [
            date, 'Running',
            `${activity.distance}km in ${formatTime(activity.time)}`,
            `${activity.distance} km`, formatTime(activity.time),
            activity.feeling.toString(), '', '', '', ''
          ];
        case 'squats':
          return [
            date, 'Squats',
            activity.sets && activity.reps ? `${activity.sets}x${activity.reps}` : 'Squats',
            '', '', '',
            activity.sets?.toString() || '', activity.reps?.toString() || '', '', ''
          ];
        case 'pushup':
          return [
            date, 'Push-Up',
            activity.sets && activity.reps ? `${activity.sets}x${activity.reps}` : 'Push-Up',
            '', '', '',
            activity.sets?.toString() || '', activity.reps?.toString() || '', '', ''
          ];
        case 'plank':
          return [
            date, 'Plank', `${formatTime(activity.duration)}`,
            '', '', '', '', '', formatTime(activity.duration), ''
          ];
        case 'swimming':
          return [
            date, 'Swimming',
            `${activity.distance}m in ${formatTime(activity.time)}`,
            `${activity.distance} m`, formatTime(activity.time),
            '', '', '', '', ''
          ];
        case 'walking':
          return [
            date, 'Walking',
            `${activity.distance}km in ${formatTime(activity.time)}`,
            `${activity.distance} km`, formatTime(activity.time),
            '', '', '', '', activity.steps?.toString() || ''
          ];
      }
    });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `activity-history-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
