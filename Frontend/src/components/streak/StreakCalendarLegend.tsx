import { StreakDayData } from './StreakCalendar';

interface StreakCalendarLegendProps {
  hoveredDate: StreakDayData | null;
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

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const StreakCalendarLegend = ({ hoveredDate }: StreakCalendarLegendProps) => {
const getStreakDayRange = (intensity: number): string => {
  switch (intensity) {
    case 1: return '1 problem';
    case 2: return '2-4 problems';
    case 3: return '5-9 problems';
    case 4: return '10+ problems';
    default: return '';
  }
};

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2 text-sm text-gray-400">
        <span>Less</span>
        <div className="flex space-x-1">
          {[0, 1, 2, 3, 4].map((intensity) => (
            <div
              key={intensity}
              className={`w-3 h-3 rounded-sm border ${getIntensityColor(intensity)}`}
            />
          ))}
        </div>
        <span>More</span>
      </div>
      
      {hoveredDate && (
        <div className="bg-gray-900/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700 text-sm">
          <div className="text-white font-medium">
            {hoveredDate.count} {hoveredDate.count === 1 ? 'problem' : 'problems'} solved
          </div>
          <div className="text-gray-400 text-xs">
            {formatDate(hoveredDate.date)}
          </div>
          {hoveredDate.intensity > 0 && (
            <div className="text-green-400 text-xs mt-1">
              {getStreakDayRange(hoveredDate.intensity)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StreakCalendarLegend;
