import React from 'react';
import { format, isToday } from 'date-fns';
import { ArrowLeft, Calendar, Users, Layers, User } from 'lucide-react';
import type { Phase, CellStatus } from '../types';

interface TodayViewProps {
  phases: Phase[];
  setPhases: React.Dispatch<React.SetStateAction<Phase[]>>;
  onBack: () => void;
}

export function TodayView({ phases, setPhases, onBack }: TodayViewProps) {
  const todaysTasks = phases.flatMap(phase => {
    const tasks = phase.tasks.filter(task => {
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      return isToday(task.startDate) || isToday(task.endDate) || (
        task.startDate <= new Date() && task.endDate >= new Date()
      );
    }).map(task => ({
      ...task,
      phaseName: phase.name
    }));
    return tasks;
  });

  const getStatusLabel = (status: CellStatus) => {
    switch (status) {
      case 'on-track':
        return 'On Track';
      case 'flag':
        return 'Flagged';
      case 'missed':
        return 'Missed';
      case 'completed':
        return 'Completed';
      default:
        return 'Not Started';
    }
  };

  const getStatusColor = (status: CellStatus) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-200 text-green-800';
      case 'flag':
        return 'bg-yellow-200 text-yellow-800';
      case 'missed':
        return 'bg-red-200 text-red-800';
      case 'completed':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const handleStatusClick = (taskId: string) => {
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const task = todaysTasks.find(t => t.id === taskId);
    if (!task) return;

    const currentStatus = task.cellStatuses[dateStr] || 'none';
    let newStatus: CellStatus;
    
    switch (currentStatus) {
      case 'none':
        newStatus = 'on-track';
        break;
      case 'on-track':
        newStatus = 'flag';
        break;
      case 'flag':
        newStatus = 'missed';
        break;
      case 'missed':
        newStatus = 'completed';
        break;
      default:
        newStatus = 'none';
    }

    setPhases(prevPhases => prevPhases.map(phase => ({
      ...phase,
      tasks: phase.tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            cellStatuses: {
              ...t.cellStatuses,
              [dateStr]: newStatus
            }
          };
        }
        return t;
      })
    })));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-semibold">Today's Tasks</h1>
      </div>

      {todaysTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No tasks scheduled for today</p>
        </div>
      ) : (
        <div className="space-y-4">
          {todaysTasks.map(task => {
            const dateStr = format(new Date(), 'yyyy-MM-dd');
            const status = task.cellStatuses[dateStr] || 'none';
            const startDateStr = format(task.startDate, 'MMM d');
            const endDateStr = format(task.endDate, 'MMM d');
            const crewCount = task.crewCounts[dateStr];

            return (
              <div key={task.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <h3 className="text-lg font-bold text-gray-900">{task.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                          <Layers className="w-4 h-4" />
                          <span>{task.phaseName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{startDateStr} - {endDateStr}</span>
                          </div>
                          <span>|</span>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{task.responsible}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end ml-4">
                        <button
                          onClick={() => handleStatusClick(task.id)}
                          className={`px-3 py-1 text-sm ${getStatusColor(status)}`}
                        >
                          {getStatusLabel(status)}
                        </button>
                        {crewCount && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                            <Users className="w-4 h-4" />
                            <span>: {crewCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}