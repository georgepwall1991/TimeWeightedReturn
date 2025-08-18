import React from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  selectedDate: string;
  onChange: (date: string) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onChange,
}) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-gray-400" />
      <input
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
      />
    </div>
  );
};
