import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  availableDates: string[];
  onChange: (range: { start: string; end: string }) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  availableDates,
  onChange,
}) => {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStart = e.target.value;
    if (newStart > endDate) {
      onChange({ start: newStart, end: newStart });
    } else {
      onChange({ start: newStart, end: endDate });
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEnd = e.target.value;
    if (newEnd < startDate) {
      onChange({ start: newEnd, end: newEnd });
    } else {
      onChange({ start: startDate, end: newEnd });
    }
  };

  // Filter available dates to only show dates between start and end
  const filteredStartDates = availableDates.filter(date => date <= endDate);
  const filteredEndDates = availableDates.filter(date => date >= startDate);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-400" />
        <select
          value={startDate}
          onChange={handleStartDateChange}
          className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
        >
          {filteredStartDates.map((date) => (
            <option key={date} value={date}>
              {new Date(date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      <span className="text-gray-500">to</span>

      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-400" />
        <select
          value={endDate}
          onChange={handleEndDateChange}
          className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
        >
          {filteredEndDates.map((date) => (
            <option key={date} value={date}>
              {new Date(date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
