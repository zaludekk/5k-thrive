import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface FeelingSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function FeelingSelector({ value, onChange }: FeelingSelectorProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={cn(
            "p-1 rounded transition-colors hover:bg-accent",
            star <= value ? "text-star" : "text-muted-foreground/40"
          )}
        >
          <Star className={cn("h-6 w-6", star <= value && "fill-current")} />
        </button>
      ))}
    </div>
  );
}
