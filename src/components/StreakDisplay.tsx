import { Flame, Trophy, Calendar, Snowflake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface StreakDisplayProps {
  currentStreak: number;
  bestStreak: number;
  isActiveToday: boolean;
  canUseFreeze: boolean;
  onUseFreeze: () => void;
  activityHistory: string[];
}

export function StreakDisplay({
  currentStreak,
  bestStreak,
  isActiveToday,
  canUseFreeze,
  onUseFreeze,
  activityHistory,
}: StreakDisplayProps) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Generate calendar days for current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const isActiveDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return activityHistory.includes(dateStr);
  };

  const isToday = (day: number) => {
    return day === today.getDate();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-2 font-semibold transition-all",
            currentStreak > 0 ? "text-orange-500" : "text-muted-foreground",
            isActiveToday && "animate-pulse"
          )}
        >
          <Flame className={cn(
            "h-5 w-5",
            currentStreak > 0 && "fill-orange-500"
          )} />
          <span>{currentStreak}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground">Streak d'étude</h4>
            {canUseFreeze && (
              <Button
                variant="outline"
                size="sm"
                onClick={onUseFreeze}
                className="gap-1 text-xs"
              >
                <Snowflake className="h-3 w-3" />
                Freeze (1/sem)
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-orange-500/10 rounded-lg">
              <Flame className="h-6 w-6 text-orange-500 fill-orange-500" />
              <div>
                <div className="text-2xl font-bold text-foreground">{currentStreak}</div>
                <div className="text-xs text-muted-foreground">Jours consécutifs</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-foreground">{bestStreak}</div>
                <div className="text-xs text-muted-foreground">Meilleur streak</div>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(currentYear, currentMonth).toLocaleDateString('fr-FR', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                <div key={i} className="text-xs text-muted-foreground py-1">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, i) => (
                <div
                  key={i}
                  className={cn(
                    "aspect-square flex items-center justify-center text-xs rounded-md transition-colors",
                    day === null && "invisible",
                    day !== null && isActiveDay(day) && "bg-accent text-accent-foreground font-medium",
                    day !== null && isToday(day) && "ring-2 ring-primary ring-offset-1",
                    day !== null && !isActiveDay(day) && "text-muted-foreground"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Today status */}
          <div className={cn(
            "text-center text-sm py-2 rounded-lg",
            isActiveToday
              ? "bg-accent/20 text-accent"
              : "bg-muted text-muted-foreground"
          )}>
            {isActiveToday
              ? "✓ Activité enregistrée aujourd'hui"
              : "Étudiez une fiche pour maintenir votre streak !"}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
