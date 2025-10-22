import React, { useState } from 'react';

const StreakCalendar = ({ data }) => {
  const [hoveredDate, setHoveredDate] = useState(null);

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 0: return 'bg-gray-800 border-gray-700';
      case 1: return 'bg-green-900/50 border-green-800';
      case 2: return 'bg-green-700/70 border-green-600';
      case 3: return 'bg-green-500/80 border-green-400';
      case 4: return 'bg-green-400 border-green-300';
      default: return 'bg-gray-800 border-gray-700';
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getWeeksData = () => {
    const weeks = [];
    let currentWeek = [];
    
    // Start from the first Sunday of the data range
    const startDate = new Date(data[0]?.date);
    const dayOfWeek = startDate.getDay();
    
    // Add empty cells for days before the start date
    for (let i = 0; i < dayOfWeek; i++) {
      currentWeek.push(null);
    }
    
    data.forEach((day, index) => {
      currentWeek.push(day);
      
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    // Fill the last week if needed
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const weeks = getWeeksData();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        {/* Month labels */}
        <div className="flex justify-between text-sm text-gray-400 px-8">
          {months.map((month, index) => (
            <span key={index} className="text-xs">{month}</span>
          ))}
        </div>
        
        <div className="flex space-x-1">
          {/* Day labels */}
          <div className="flex flex-col space-y-1 pr-2">
            {daysOfWeek.map((day, index) => (
              <div key={index} className="h-3 flex items-center">
                {index % 2 === 1 && (
                  <span className="text-xs text-gray-500 w-8">{day}</span>
                )}
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
                    onMouseEnter={() => day && setHoveredDate(day)}
                    onMouseLeave={() => setHoveredDate(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
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
              {hoveredDate.count} problems solved
            </div>
            <div className="text-gray-400 text-xs">
              {formatDate(hoveredDate.date)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakCalendar;