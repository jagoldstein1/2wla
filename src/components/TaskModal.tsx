import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import type { Task } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  phaseId: string;
  task?: Task | null;
}

export function TaskModal({ isOpen, onClose, onSave, phaseId, task }: TaskModalProps) {
  const [taskName, setTaskName] = useState(task?.name || '');
  const [responsible, setResponsible] = useState(task?.responsible || '');
  const [status, setStatus] = useState<Task['status']>(task?.status || 'pending');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTaskName(task?.name || '');
      setResponsible(task?.responsible || '');
      setStatus(task?.status || 'pending');
      
      // Set existing dates if task has them
      if (task?.startDate) {
        setStartDate(format(task.startDate, 'yyyy-MM-dd'));
      } else {
        setStartDate('');
      }
      
      if (task?.endDate) {
        setEndDate(format(task.endDate, 'yyyy-MM-dd'));
      } else {
        setEndDate('');
      }
      
      setDateError('');
    }
  }, [isOpen, task]);

  const validateDates = (start: string, end: string) => {
    setDateError('');
    
    // If one date is provided, both must be provided
    if ((start && !end) || (!start && end)) {
      setDateError('Both start and end dates are required when setting a timeline');
      return false;
    }
    
    if (start && end) {
      const startDateObj = new Date(start);
      const endDateObj = new Date(end);
      
      // Check if end date is before start date
      if (endDateObj < startDateObj) {
        setDateError('End date cannot be before start date');
        return false;
      }
    }
    
    return true;
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    
    // If end date is set and is now before the new start date, clear it
    if (endDate && value && new Date(endDate) < new Date(value)) {
      setEndDate('');
    }
    
    validateDates(value, endDate);
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    validateDates(startDate, value);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDates(startDate, endDate)) {
      return;
    }
    
    const taskData: Partial<Task> = {
      name: taskName,
      responsible,
      status,
      comments: task?.comments || [],
    };
    
    // Add dates if both are provided
    if (startDate && endDate) {
      taskData.startDate = new Date(startDate);
      taskData.endDate = new Date(endDate);
    }
    
    onSave(taskData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl font-semibold">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Name
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="Enter task name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsible Person
            </label>
            <input
              type="text"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="Enter responsible person"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeline (Optional)
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  style={{
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  min={startDate}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  style={{
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                />
              </div>
            </div>
            {dateError && (
              <p className="text-red-600 text-xs mt-2">{dateError}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Both dates are required when setting a timeline
            </p>
          </div>
          
          {task && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Task['status'])}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="behind">Behind</option>
              </select>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!dateError}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-base"
            >
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}