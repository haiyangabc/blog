import React, { useState } from "react";
// import { formatDate, getDaysInMonth, startOfMonth, getDay, addDays } from 'date-fns';
import { formatDate } from "@/lib/utils";
interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  initialDate?: Date;
}

const Calendar: React.FC<CalendarProps> = ({
  onDateSelect,
  initialDate = new Date(),
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  // 计算当前月的总天数
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 计算当月的第一天
  const firstDayOfMonth = new Date(year, month, 1);

  // 计算当月第一天是星期几，0 表示星期日，6 表示星期六
  const firstDayIndex = firstDayOfMonth.getDay();

  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className="flex items-center justify-between p-4 bg-primary text-white">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-primary/80 rounded-full transition-colors"
        >
          <i className="fa fa-chevron-left" />
        </button>
        <h2 className="text-lg font-semibold">
          {formatDate(currentDate, "yyyy年MM月")}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-primary/80 rounded-full transition-colors"
        >
          <i className="fa fa-chevron-right" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 p-2">
        {weekdays.map((day, index) => (
          <div
            key={index}
            className="text-center py-2 font-medium text-gray-600"
          >
            {day}
          </div>
        ))}
        {Array(firstDayIndex)
          .fill(null)
          .map((_, index) => (
            <div key={index} className="h-10" />
          ))}
        {Array(daysInMonth)
          .fill(0)
          .map((_, index) => {
            const day = index + 1;
            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            );
            const isToday =
              formatDate(date, "yyyy-MM-dd") === formatDate(new Date(), "yyyy-MM-dd");
            const isSelected =
              formatDate(date, "yyyy-MM-dd") === formatDate(selectedDate, "yyyy-MM-dd");

            return (
              <button
                key={day}
                className={`flex items-center justify-center h-10 w-full rounded-full transition-all ${
                  isToday
                    ? "border-2 border-primary"
                    : "border-2 border-transparent"
                } ${
                  isSelected
                    ? "bg-primary text-white"
                    : "text-gray-800 hover:bg-gray-100"
                }`}
                onClick={() => handleDateSelect(date)}
              >
                {day}
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default Calendar;
