import { useState } from 'react';
import StreakCalendarGrid from './StreakCalendarGrid.tsx';
import StreakCalendarLegend from './StreakCalendarLegend.tsx';
import { useStreakData } from './hooks/useStreakData';

export interface StreakDayData {
  date: Date;
  count: number;
  intensity: number;
}

interface StreakCalendarProps {
  data: StreakDayData[];
}

const StreakCalendar = ({ data }: StreakCalendarProps) => {
  const [hoveredDate, setHoveredDate] = useState<StreakDayData | null>(null);
  const { weeks, monthLabels, daysOfWeek } = useStreakData(data);

  return (
    <div className="space-y-6">
      <StreakCalendarGrid
        weeks={weeks}
        monthLabels={monthLabels}
        daysOfWeek={daysOfWeek}
        hoveredDate={hoveredDate}
        onHoverChange={setHoveredDate}
      />
      <StreakCalendarLegend hoveredDate={hoveredDate} />
    </div>
  );
};

export default StreakCalendar;