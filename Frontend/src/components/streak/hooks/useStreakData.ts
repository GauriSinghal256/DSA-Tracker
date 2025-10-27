import { StreakDayData } from '../StreakCalendar';

interface MonthLabel {
  name: string;
  weekIndex: number;
}

export const useStreakData = (data: StreakDayData[]) => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getWeeksData = (): StreakDayData[][] => {
    if (!data || data.length === 0) {
      // Generate empty calendar for last 371 days
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 371);
      
      const weeks: StreakDayData[][] = [];
      const currentDate = new Date(startDate);
      
      // Find the first Sunday before or on start date
      const dayOfWeek = currentDate.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
      currentDate.setDate(currentDate.getDate() - daysToSubtract);
      
      while (currentDate <= today) {
        const week: StreakDayData[] = [];
        for (let i = 0; i < 7; i++) {
          if (currentDate > today) break;
          week.push({
            date: new Date(currentDate),
            count: 0,
            intensity: 0
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        weeks.push(week);
        if (currentDate > today) break;
      }
      return weeks;
    }
    
    const dataMap = new Map<string, StreakDayData>();
    
    // Create a map of dates for quick lookup using ISO date strings
    data.forEach(day => {
      const dateKey = day.date.toISOString().split('T')[0];
      dataMap.set(dateKey, day);
    });
    
    // Get the date range from the data
    const firstDate = new Date(data[0].date);
    const lastDate = new Date(data[data.length - 1].date);
    
    // Find the first Sunday before or on first date
    const startDate = new Date(firstDate);
    const dayOfWeek = startDate.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
    startDate.setDate(startDate.getDate() - daysToSubtract);
    
    // Generate weeks
    const weeks: StreakDayData[][] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDate) {
      const week: StreakDayData[] = [];
      
      // Generate 7 days for this week
      for (let i = 0; i < 7; i++) {
        if (currentDate > lastDate) break;
        
        const dateKey = currentDate.toISOString().split('T')[0];
        const dayData = dataMap.get(dateKey);
        
        if (dayData) {
          week.push(dayData);
        } else {
          week.push({
            date: new Date(currentDate),
            count: 0,
            intensity: 0
          });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      weeks.push(week);
      
      if (currentDate > lastDate) break;
    }
    
    return weeks;
  };

  const getMonthLabels = (): MonthLabel[] => {
    if (!data || data.length === 0) return [];
    
    const weeks = getWeeksData();
    const months: MonthLabel[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let currentMonth = -1;
    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = week[0];
      const month = firstDayOfWeek.date.getMonth();
      
      if (month !== currentMonth) {
        months.push({
          name: monthNames[month],
          weekIndex: weekIndex
        });
        currentMonth = month;
      }
    });
    
    return months;
  };

  const weeks = getWeeksData();
  const monthLabels = getMonthLabels();

  return { weeks, monthLabels, daysOfWeek };
};

