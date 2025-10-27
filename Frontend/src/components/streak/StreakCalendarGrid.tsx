import { StreakDayData } from './StreakCalendar';

interface MonthLabel {
  name: string;
  weekIndex: number;
}

interface StreakCalendarGridProps {
  weeks: StreakDayData[][];
  monthLabels: MonthLabel[];
  daysOfWeek: string[];
  hoveredDate: StreakDayData | null;
  onHoverChange: (date: StreakDayData | null) => void;
}

const getIntensityColor = (intensity: number): string => {
  switch (intensity) {
    case 0: return 'bg-gray-800 border-gray-700';
    case 1: return 'bg-green-900/60 border-green-800/50';
    case 2: return 'bg-green-700/80 border-green-600/60';
    case 3: return 'bg-green-500/90 border-green-400/70';
    case 4: return 'bg-green-400 border-green-300/80';
    default: return 'bg-gray-800 border-gray-700';
  }
};

const StreakCalendarGrid = ({ 
  weeks, 
  monthLabels, 
  daysOfWeek, 
  hoveredDate, 
  onHoverChange 
}: StreakCalendarGridProps) => {
  return (
    <div className="flex flex-col space-y-4">
      {/* Month labels */}
      <div className="flex space-x-1 ml-8">
        {monthLabels.map((month, index) => (
          <div 
            key={index} 
            className="text-xs text-gray-400"
            style={{ 
              width: `${monthLabels[index + 1] ? 
                (monthLabels[index + 1].weekIndex - month.weekIndex) * 16 : 
                (weeks.length - month.weekIndex) * 16}px`
            }}
          >
            {month.name}
          </div>
        ))}
      </div>
      
      <div className="flex space-x-1">
        {/* Day labels */}
        <div className="flex flex-col space-y-1 pr-2">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="h-3 flex items-center">
              <span className="text-xs text-gray-500 w-8">{day}</span>
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="flex space-x-1 overflow-x-auto">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col space-y-1">
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`w-3 h-3 rounded-sm border transition-all duration-200 cursor-pointer hover:scale-125 hover:border-white/50 ${
                    day ? getIntensityColor(day.intensity) : 'bg-transparent'
                  }`}
                  onMouseEnter={() => day && onHoverChange(day)}
                  onMouseLeave={() => onHoverChange(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StreakCalendarGrid;

