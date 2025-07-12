import React from 'react';
import type { Task } from '../types';

interface DaySquareProps {
  date: Date;
  tasks: Task[];
  isToday: boolean;
}

export function DaySquare({ date, tasks, isToday }: DaySquareProps) {
  return (
    <div className={`p-2 border border-gray-200 min-h-[120px] ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm ${isToday ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
          {date.getDate()}
        </span>
      </div>
      <div className="space-y-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`text-xs p-1 rounded truncate ${
              task.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : task.status === 'behind'
                ? 'bg-red-100 text-red-800'
                : task.status === 'in-progress'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {task.name}
          </div>
        ))}
      </div>
    </div>
  );
}