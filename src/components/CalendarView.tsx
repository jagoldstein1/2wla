import React, { useState, useEffect, useRef } from 'react';
import { format, startOfWeek, addDays, isToday, addWeeks, isWeekend, isSameWeek, startOfMonth, addMonths, getWeek, getYear, subWeeks, subMonths, isThisWeek, isThisMonth, isThisYear } from 'date-fns';
import { Plus, Users, Edit2, Trash2, Calendar, MoreVertical, X, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import type { Task, Phase, ViewMode, CellStatus, TimeUnit } from '../types';
import { TaskModal } from './TaskModal';
import { PhaseModal } from './PhaseModal';

interface CalendarViewProps {
  viewMode: ViewMode;
  timeUnit: TimeUnit;
  phases: Phase[];
  setPhases: React.Dispatch<React.SetStateAction<Phase[]>>;
  showCrewCount: boolean;
  setShowCrewCount: React.Dispatch<React.SetStateAction<boolean>>;
  showWeekends: boolean;
  setShowWeekends: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CalendarView({ 
  viewMode, 
  timeUnit,
  phases, 
  setPhases, 
  showCrewCount, 
  setShowCrewCount, 
  showWeekends, 
  setShowWeekends 
}: CalendarViewProps) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDates, setSelectedDates] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [isDragging, setIsDragging] = useState(false);
  const [editingCrewCount, setEditingCrewCount] = useState<{
    taskId: string;
    date: string;
  } | null>(null);
  const [isSettingTimeline, setIsSettingTimeline] = useState(false);
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const [showTaskMenu, setShowTaskMenu] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    phaseId: string;
    taskId: string;
  } | null>(null);
  const [taskNameToast, setTaskNameToast] = useState<{
    name: string;
    responsible: string;
    x: number;
    y: number;
  } | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const today = new Date();

  // Monitor scroll position to determine if we should show abbreviated content
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollLeft = scrollContainerRef.current.scrollLeft;
        setIsScrolled(scrollLeft > 0);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Time navigation functions
  const goToPreviousPeriod = () => {
    if (timeUnit === 'D') {
      const weeksToSubtract = viewMode === '2W' ? 2 : viewMode === '3W' ? 3 : 4;
      setCurrentViewDate(prev => subWeeks(prev, weeksToSubtract));
    } else if (timeUnit === 'W') {
      const monthsToSubtract = viewMode === '2M' ? 2 : viewMode === '3M' ? 3 : 4;
      setCurrentViewDate(prev => subMonths(prev, monthsToSubtract));
    } else {
      setCurrentViewDate(prev => subMonths(prev, 12));
    }
  };

  const goToNextPeriod = () => {
    if (timeUnit === 'D') {
      const weeksToAdd = viewMode === '2W' ? 2 : viewMode === '3W' ? 3 : 4;
      setCurrentViewDate(prev => addWeeks(prev, weeksToAdd));
    } else if (timeUnit === 'W') {
      const monthsToAdd = viewMode === '2M' ? 2 : viewMode === '3M' ? 3 : 4;
      setCurrentViewDate(prev => addMonths(prev, monthsToAdd));
    } else {
      setCurrentViewDate(prev => addMonths(prev, 12));
    }
  };

  const goToToday = () => {
    setCurrentViewDate(today);
  };

  const isCurrentPeriod = () => {
    if (timeUnit === 'D') {
      return isThisWeek(currentViewDate, { weekStartsOn: 1 });
    } else if (timeUnit === 'W') {
      return isThisMonth(currentViewDate);
    } else {
      return isThisYear(currentViewDate);
    }
  };

  const getDateRangeText = () => {
    if (timeUnit === 'D') {
      const weekStart = startOfWeek(currentViewDate, { weekStartsOn: 1 });
      const weeksToShow = viewMode === '2W' ? 2 : viewMode === '3W' ? 3 : 4;
      const weekEnd = addWeeks(weekStart, weeksToShow);
      const endDate = addDays(weekEnd, -1);
      
      if (weekStart.getFullYear() === endDate.getFullYear()) {
        if (weekStart.getMonth() === endDate.getMonth()) {
          return `${format(weekStart, 'MMM d')} - ${format(endDate, 'd, yyyy')}`;
        } else {
          return `${format(weekStart, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
        }
      } else {
        return `${format(weekStart, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
      }
    } else if (timeUnit === 'W') {
      const monthsToShow = viewMode === '2M' ? 2 : viewMode === '3M' ? 3 : 4;
      const endMonth = addMonths(currentViewDate, monthsToShow - 1);
      
      if (currentViewDate.getFullYear() === endMonth.getFullYear()) {
        return `${format(currentViewDate, 'MMM')} - ${format(endMonth, 'MMM yyyy')}`;
      } else {
        return `${format(currentViewDate, 'MMM yyyy')} - ${format(endMonth, 'MMM yyyy')}`;
      }
    } else {
      return format(currentViewDate, 'yyyy');
    }
  };

  const isPastPeriod = () => {
    if (timeUnit === 'D') {
      const weekStart = startOfWeek(currentViewDate, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      return weekEnd < today;
    } else if (timeUnit === 'W') {
      const monthEnd = addMonths(currentViewDate, 1);
      return monthEnd < today;
    } else {
      const yearEnd = new Date(currentViewDate.getFullYear() + 1, 0, 1);
      return yearEnd < today;
    }
  };

  // Generate periods based on time unit and current view date
  const generatePeriods = () => {
    if (timeUnit === 'D') {
      // Daily view - generate days
      const currentWeekStart = startOfWeek(currentViewDate, { weekStartsOn: 1 });
      let totalWeeks: number;
      switch (viewMode) {
        case '2W':
          totalWeeks = 2;
          break;
        case '3W':
          totalWeeks = 3;
          break;
        case '4W':
          totalWeeks = 4;
          break;
        default:
          totalWeeks = 2;
      }

      const allDays: Date[] = [];
      for (let week = 0; week < totalWeeks; week++) {
        const weekStart = addWeeks(currentWeekStart, week);
        for (let day = 0; day < 7; day++) {
          allDays.push(addDays(weekStart, day));
        }
      }

      return showWeekends ? allDays : allDays.filter(day => !isWeekend(day));
    } else if (timeUnit === 'W') {
      // Weekly view - generate weeks
      const currentWeekStart = startOfWeek(currentViewDate, { weekStartsOn: 1 });
      let totalMonths: number;
      switch (viewMode) {
        case '2M':
          totalMonths = 2;
          break;
        case '3M':
          totalMonths = 3;
          break;
        case '4M':
          totalMonths = 4;
          break;
        default:
          totalMonths = 2;
      }

      const weeks: Date[] = [];
      let currentWeek = currentWeekStart;
      const endDate = addMonths(currentViewDate, totalMonths);
      
      while (currentWeek < endDate) {
        if (showWeekends || !isWeekend(currentWeek)) {
          weeks.push(currentWeek);
        }
        currentWeek = addWeeks(currentWeek, 1);
      }

      return weeks;
    } else {
      // Monthly view - generate 12 months
      const currentMonthStart = startOfMonth(currentViewDate);
      const months: Date[] = [];
      
      for (let i = 0; i < 12; i++) {
        months.push(addMonths(currentMonthStart, i));
      }
      
      return months;
    }
  };

  const visiblePeriods = generatePeriods();

  const handleSavePhase = (phaseName: string) => {
    const newPhase: Phase = {
      id: Math.random().toString(36).substr(2, 9),
      name: phaseName,
      tasks: []
    };
    setPhases([...phases, newPhase]);
  };

  const handleAddTask = (phaseId: string) => {
    setSelectedPhaseId(phaseId);
    setSelectedTask(null);
    setSelectedDates({ start: null, end: null });
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task, phaseId: string) => {
    setSelectedPhaseId(phaseId);
    setSelectedTask(task);
    setSelectedDates({ start: task.startDate, end: task.endDate });
    setIsTaskModalOpen(true);
    setShowTaskMenu(null);
  };

  const handleDeleteTask = (phaseId: string, taskId: string) => {
    setDeleteConfirmation({ phaseId, taskId });
    setShowTaskMenu(null);
  };

  const confirmDeleteTask = () => {
    if (!deleteConfirmation) return;
    
    setPhases(phases.map(phase => {
      if (phase.id === deleteConfirmation.phaseId) {
        return {
          ...phase,
          tasks: phase.tasks.filter(task => task.id !== deleteConfirmation.taskId)
        };
      }
      return phase;
    }));
    
    setDeleteConfirmation(null);
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (!selectedPhaseId) return;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const newTask: Task = {
      id: selectedTask?.id || Math.random().toString(36).substr(2, 9),
      name: taskData.name || '',
      responsible: taskData.responsible || '',
      startDate: taskData.startDate || selectedTask?.startDate || futureDate,
      endDate: taskData.endDate || selectedTask?.endDate || futureDate,
      status: taskData.status || 'pending',
      comments: taskData.comments || [],
      crewCounts: selectedTask?.crewCounts || {},
      cellStatuses: selectedTask?.cellStatuses || {}
    };

    setPhases(phases.map(phase => {
      if (phase.id === selectedPhaseId) {
        if (selectedTask) {
          return {
            ...phase,
            tasks: phase.tasks.map(task => 
              task.id === selectedTask.id ? newTask : task
            )
          };
        } else {
          return {
            ...phase,
            tasks: [...phase.tasks, newTask]
          };
        }
      }
      return phase;
    }));

    setIsTaskModalOpen(false);
    
    if (!selectedTask) {
      setIsSettingTimeline(true);
      setSelectedTask(newTask);
      setActivePhaseId(selectedPhaseId);
    } else {
      setSelectedTask(null);
      setActivePhaseId(null);
    }
  };

  const handleCellMouseDown = (period: Date, task: Task, phaseId: string, e: React.MouseEvent) => {
    if (!isSettingTimeline || task.id !== selectedTask?.id || timeUnit !== 'D') return;

    setIsDragging(true);
    setSelectedDates({ start: period, end: period });
    setActivePhaseId(phaseId);

    setPhases(phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: phase.tasks.map(t => {
            if (t.id === task.id) {
              return {
                ...t,
                startDate: period,
                endDate: period
              };
            }
            return t;
          })
        };
      }
      return phase;
    }));
  };

  const handleCellTouchStart = (period: Date, task: Task, phaseId: string, e: React.TouchEvent) => {
    // Only handle touch events for timeline setting mode
    if (!isSettingTimeline || task.id !== selectedTask?.id || timeUnit !== 'D') return;
    
    e.preventDefault(); // Prevent scrolling during drag
    
    setIsDragging(true);
    setSelectedDates({ start: period, end: period });
    setActivePhaseId(phaseId);

    setPhases(phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          tasks: phase.tasks.map(t => {
            if (t.id === task.id) {
              return {
                ...t,
                startDate: period,
                endDate: period
              };
            }
            return t;
          })
        };
      }
      return phase;
    }));
  };

  const handleCellMouseEnter = (period: Date) => {
    if (isDragging && selectedTask && selectedDates.start && activePhaseId && timeUnit === 'D') {
      const start = selectedDates.start;
      const end = period >= start ? period : start;

      setSelectedDates({ start, end });

      setPhases(phases.map(phase => {
        if (phase.id === activePhaseId) {
          return {
            ...phase,
            tasks: phase.tasks.map(task => {
              if (task.id === selectedTask.id) {
                return {
                  ...task,
                  startDate: start,
                  endDate: end
                };
              }
              return task;
            })
          };
        }
        return phase;
      }));
    }
  };

  const handleCellTouchMove = (e: React.TouchEvent) => {
    // Only handle touch move for timeline setting mode
    if (!isDragging || !selectedTask || !selectedDates.start || !activePhaseId || timeUnit !== 'D') return;
    
    e.preventDefault();
    
    const touch = e.touches[0];
    if (!touch) return;
    
    const elementFromPoint = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elementFromPoint) return;
    
    const periodIndex = elementFromPoint.getAttribute('data-period-index');
    if (periodIndex === null) return;
    
    const period = visiblePeriods[parseInt(periodIndex)];
    if (!period) return;
    
    const start = selectedDates.start;
    const end = period >= start ? period : start;

    setSelectedDates({ start, end });

    setPhases(phases.map(phase => {
      if (phase.id === activePhaseId) {
        return {
          ...phase,
          tasks: phase.tasks.map(task => {
            if (task.id === selectedTask.id) {
              return {
                ...task,
                startDate: start,
                endDate: end
              };
            }
            return task;
          })
        };
      }
      return phase;
    }));
  };

  const handleCellMouseUp = () => {
    setIsDragging(false);
    if (isSettingTimeline) {
      setIsSettingTimeline(false);
      setSelectedTask(null);
      setActivePhaseId(null);
    }
  };

  const handleCellTouchEnd = (e: React.TouchEvent) => {
    // Only handle touch end for timeline setting mode
    if (!isSettingTimeline) return;
    
    e.preventDefault();
    
    setIsDragging(false);
    setIsSettingTimeline(false);
    setSelectedTask(null);
    setActivePhaseId(null);
  };

  const handleCellClick = (task: Task, period: Date) => {
    if (timeUnit !== 'D') return;
    if (period < task.startDate || period > task.endDate) return;

    const dateStr = format(period, 'yyyy-MM-dd');
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

    setPhases(phases.map(phase => ({
      ...phase,
      tasks: phase.tasks.map(t => {
        if (t.id === task.id) {
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

  const handleCrewCountClick = (taskId: string, period: Date) => {
    if (timeUnit !== 'D') return;
    
    const task = phases.flatMap(p => p.tasks).find(t => t.id === taskId);
    if (task && period >= task.startDate && period <= task.endDate) {
      setEditingCrewCount({
        taskId,
        date: format(period, 'yyyy-MM-dd')
      });
    }
  };

  const handleCrewCountChange = (e: React.ChangeEvent<HTMLInputElement>, taskId: string, date: string) => {
    const value = parseInt(e.target.value) || 0;
    setPhases(phases.map(phase => ({
      ...phase,
      tasks: phase.tasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            crewCounts: {
              ...task.crewCounts,
              [date]: value
            }
          };
        }
        return task;
      })
    })));
  };

  const calculatePeriodCrewCount = (period: Date) => {
    if (timeUnit === 'D') {
      return phases.reduce((total, phase) => {
        return total + phase.tasks.reduce((taskTotal, task) => {
          const dateStr = format(period, 'yyyy-MM-dd');
          return taskTotal + (task.crewCounts?.[dateStr] || 0);
        }, 0);
      }, 0);
    } else if (timeUnit === 'W') {
      // Sum crew counts for all days in this week
      const weekStart = period;
      const weekEnd = addDays(weekStart, 6);
      let weekTotal = 0;
      
      // Generate all days in this week
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDay = addDays(weekStart, dayOffset);
        const dateStr = format(currentDay, 'yyyy-MM-dd');
        
        phases.forEach(phase => {
          phase.tasks.forEach(task => {
            const crewCount = task.crewCounts?.[dateStr] || 0;
            weekTotal += crewCount;
          });
        });
      }
      
      return weekTotal;
    } else {
      // Sum crew counts for all days in this month
      const monthStart = period;
      const monthEnd = addMonths(monthStart, 1);
      let monthTotal = 0;
      
      // Generate all days in this month
      let currentDay = monthStart;
      while (currentDay < monthEnd) {
        const dateStr = format(currentDay, 'yyyy-MM-dd');
        
        phases.forEach(phase => {
          phase.tasks.forEach(task => {
            const crewCount = task.crewCounts?.[dateStr] || 0;
            monthTotal += crewCount;
          });
        });
        
        currentDay = addDays(currentDay, 1);
      }
      
      return monthTotal;
    }
  };

  const handleEditTimeline = (task: Task) => {
    setSelectedTask(task);
    setIsSettingTimeline(true);
    setShowTaskMenu(null);
  };

  const getCellColor = (task: Task, period: Date) => {
    const pastPeriod = isPastPeriod();
    
    if (timeUnit === 'D') {
      if (period < task.startDate || period > task.endDate) return '';
      
      const dateStr = format(period, 'yyyy-MM-dd');
      const status = task.cellStatuses[dateStr];
      
      let baseColor = '';
      switch (status) {
        case 'on-track':
          baseColor = pastPeriod ? 'bg-emerald-100' : 'bg-emerald-200';
          break;
        case 'flag':
          baseColor = pastPeriod ? 'bg-amber-100' : 'bg-amber-200';
          break;
        case 'missed':
          baseColor = pastPeriod ? 'bg-red-100' : 'bg-red-200';
          break;
        case 'completed':
          baseColor = pastPeriod ? 'bg-emerald-500' : 'bg-emerald-600';
          break;
        default:
          baseColor = pastPeriod ? 'bg-slate-100' : 'bg-slate-200';
      }
      
      return baseColor;
    } else {
      // For weekly and monthly views, only show color if task actually intersects with this period
      if (!isTaskInPeriod(task, period)) return '';
      
      // Check if task is completed (has any completed status in its timeline)
      const hasCompletedStatus = Object.values(task.cellStatuses || {}).some(status => status === 'completed');
      if (hasCompletedStatus) {
        return pastPeriod ? 'bg-emerald-500' : 'bg-emerald-600';
      }
      return pastPeriod ? 'bg-slate-100' : 'bg-slate-200';
    }
  };

  const getGridStyle = () => {
    const periodCount = visiblePeriods.length;
    const columnWidth = window.innerWidth < 768 ? '60px' : '100px';
    // Dynamic left column width based on scroll state and screen size
    const leftColumnWidth = (() => {
      if (window.innerWidth < 768) {
        return isScrolled ? '100px' : '140px';
      }
      return '200px';
    })();
    
    return {
      display: 'grid',
      gridTemplateColumns: `${leftColumnWidth} repeat(${periodCount}, minmax(${columnWidth}, 1fr))`
    };
  };

  const needsWeekBorder = (index: number) => {
    if (index === 0 || timeUnit !== 'D') return false;
    
    const currentDate = visiblePeriods[index];
    const previousDate = visiblePeriods[index - 1];
    
    return !isSameWeek(currentDate, previousDate, { weekStartsOn: 1 });
  };

  const handleTaskNameClick = (taskName: string, responsible: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setTaskNameToast({
      name: taskName,
      responsible: responsible,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    
    setTimeout(() => setTaskNameToast(null), 3000);
  };

  const getPhaseTimelineSpan = (phase: Phase) => {
    const tasksWithTimeline = phase.tasks.filter(task => 
      task.startDate.getTime() !== task.endDate.getTime()
    );
    
    if (tasksWithTimeline.length === 0) return null;
    
    const earliestStart = Math.min(...tasksWithTimeline.map(task => task.startDate.getTime()));
    const latestEnd = Math.max(...tasksWithTimeline.map(task => task.endDate.getTime()));
    
    const startDate = new Date(earliestStart);
    const endDate = new Date(latestEnd);
    
    let startIndex = -1;
    let endIndex = -1;
    
    if (timeUnit === 'D') {
      startIndex = visiblePeriods.findIndex(day => {
        const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
        const taskStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        return dayStart.getTime() >= taskStart.getTime();
      });
      endIndex = visiblePeriods.findIndex(day => {
        const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
        const taskEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        return dayStart.getTime() >= taskEnd.getTime();
      });
    } else if (timeUnit === 'W') {
      startIndex = visiblePeriods.findIndex(week => {
        const weekEnd = addDays(week, 6);
        return startDate >= week && startDate <= weekEnd;
      });
      endIndex = visiblePeriods.findIndex(week => {
        const weekEnd = addDays(week, 6);
        return endDate >= week && endDate <= weekEnd;
      });
    } else {
      startIndex = visiblePeriods.findIndex(month => {
        const monthEnd = addMonths(month, 1);
        return startDate >= month && startDate < monthEnd;
      });
      endIndex = visiblePeriods.findIndex(month => {
        const monthEnd = addMonths(month, 1);
        return endDate >= month && endDate < monthEnd;
      });
    }
    
    if (startIndex === -1) return null;
    
    // If endIndex is -1, it means the end date is beyond our visible periods
    // In this case, extend to the last visible period
    const actualEndIndex = endIndex === -1 ? visiblePeriods.length - 1 : endIndex;
    
    return { startIndex, endIndex: actualEndIndex };
  };

  const getEditModeBorderClasses = (task: Task, period: Date, index: number) => {
    const isInEditMode = isSettingTimeline && task.id === selectedTask?.id;
    
    if (!isInEditMode || timeUnit !== 'D') return '';
    
    const hasNoTimeline = task.startDate.getTime() === task.endDate.getTime();
    
    if (hasNoTimeline) {
      let borderClasses = 'border-t-2 border-b-2 border-yellow-400 ';
      
      if (index === 0) {
        borderClasses += 'border-l-2 border-l-yellow-400 ';
      }
      
      if (index === visiblePeriods.length - 1) {
        borderClasses += 'border-r-2 border-r-yellow-400 ';
      }
      
      return borderClasses;
    }
    
    const canEdit = period >= task.startDate && period <= task.endDate;
    if (!canEdit) return '';
    
    const taskStartIndex = visiblePeriods.findIndex(d => {
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const taskStart = new Date(task.startDate.getFullYear(), task.startDate.getMonth(), task.startDate.getDate());
      return dayStart.getTime() >= taskStart.getTime();
    });
    const taskEndIndex = visiblePeriods.findIndex(d => {
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const taskEnd = new Date(task.endDate.getFullYear(), task.endDate.getMonth(), task.endDate.getDate());
      return dayStart.getTime() >= taskEnd.getTime();
    });
    const actualEndIndex = taskEndIndex === -1 ? visiblePeriods.length - 1 : taskEndIndex;
    
    let borderClasses = 'border-t-2 border-b-2 border-yellow-400 ';
    
    if (index === taskStartIndex) {
      borderClasses += 'border-l-2 border-l-yellow-400 ';
    }
    
    if (index === actualEndIndex) {
      borderClasses += 'border-r-2 border-r-yellow-400 ';
    }
    
    return borderClasses;
  };

  const formatPeriodHeader = (period: Date, index: number) => {
    const pastPeriod = isPastPeriod();
    
    if (timeUnit === 'D') {
      const isCurrentDay = isToday(period);
      return {
        top: format(period, 'EEE'),
        bottom: format(period, 'MM/dd'),
        isToday: isCurrentDay,
        isPast: pastPeriod && period < today
      };
    } else if (timeUnit === 'W') {
      const weekNumber = getWeek(period);
      return {
        top: `W${weekNumber}`,
        bottom: format(period, 'MM/dd'),
        isToday: false,
        isPast: pastPeriod
      };
    } else {
      return {
        top: format(period, 'MMM'),
        bottom: getYear(period).toString(),
        isToday: false,
        isPast: pastPeriod
      };
    }
  };

  const isTaskInPeriod = (task: Task, period: Date) => {
    if (timeUnit === 'D') {
      // For daily view, check if the period date is within the task's date range (inclusive)
      const periodStart = new Date(period.getFullYear(), period.getMonth(), period.getDate());
      const taskStart = new Date(task.startDate.getFullYear(), task.startDate.getMonth(), task.startDate.getDate());
      const taskEnd = new Date(task.endDate.getFullYear(), task.endDate.getMonth(), task.endDate.getDate());
      
      return periodStart >= taskStart && periodStart <= taskEnd;
    } else if (timeUnit === 'W') {
      const weekStart = period;
      const weekEnd = addDays(weekStart, 6);
      return !(task.endDate < weekStart || task.startDate > weekEnd);
    } else {
      const monthStart = period;
      const monthEnd = addMonths(monthStart, 1);
      return !(task.endDate < monthStart || task.startDate >= monthEnd);
    }
  };

  const getCrewCountRowLabel = () => {
    switch (timeUnit) {
      case 'D':
        return 'Daily Crew Total';
      case 'W':
        return 'Weekly Crew Total';
      case 'M':
        return 'Monthly Crew Total';
      default:
        return 'Crew Total';
    }
  };

  const getPersonInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const getAbbreviatedTaskName = (name: string) => {
    return name.substring(0, 3).toUpperCase();
  };

  // Get dynamic column width for frozen column
  const getFrozenColumnWidth = () => {
    if (window.innerWidth >= 768) {
      return '200px'; // Desktop always full width
    }
    return isScrolled ? '100px' : '140px'; // Mobile: shrink when scrolled
  };

  return (
    <div>
      {/* Time Navigation Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Navigation arrows and date range */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={goToPreviousPeriod}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Previous period"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToNextPeriod}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Next period"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">
                {getDateRangeText()}
              </span>
              {isPastPeriod() && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  Past
                </span>
              )}
            </div>
          </div>

          {/* Right: Today button (only show when not viewing current period) */}
          {!isCurrentPeriod() && (
            <button
              onClick={goToToday}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Today</span>
              <span className="sm:hidden">Today</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ paddingBottom: '400px' }}>
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto" 
            onMouseUp={handleCellMouseUp}
            onTouchEnd={isSettingTimeline ? handleCellTouchEnd : undefined}
            onTouchMove={isSettingTimeline ? handleCellTouchMove : undefined}
          >
            <div className="w-max min-w-full">
              {/* Period Headers */}
              <div style={getGridStyle()} className="border-b">
                <div 
                  className="p-2 md:p-3 font-medium text-gray-500 border-r text-sm bg-white sticky left-0 z-20 transition-all duration-200"
                  style={{ width: getFrozenColumnWidth() }}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {window.innerWidth < 768 && isScrolled ? 'P/T' : 'Phase / Task'}
                    </span>
                    <button
                      onClick={() => setIsPhaseModalOpen(true)}
                      className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {visiblePeriods.map((period, index) => {
                  const header = formatPeriodHeader(period, index);
                  
                  return (
                    <div
                      key={format(period, timeUnit === 'D' ? 'yyyy-MM-dd' : timeUnit === 'W' ? 'yyyy-ww' : 'yyyy-MM')}
                      className={`p-1 md:p-3 text-center border-r text-xs md:text-sm ${
                        header.isToday ? 'bg-blue-50 font-semibold' : ''
                      } ${timeUnit === 'D' && isWeekend(period) ? 'bg-gray-50' : ''} ${
                        needsWeekBorder(index) ? 'border-l-4 border-l-gray-300' : ''
                      } ${header.isPast ? 'opacity-60' : ''}`}
                    >
                      <div className={`text-xs font-medium ${header.isPast ? 'text-gray-400' : 'text-gray-500'}`}>
                        {header.top}
                      </div>
                      <div className={`text-xs ${header.isToday ? 'text-blue-600' : header.isPast ? 'text-gray-400' : 'text-gray-900'}`}>
                        {header.bottom}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Crew Count Total Row */}
              {showCrewCount && (
                <div style={getGridStyle()} className="border-b bg-blue-50">
                  <div 
                    className="p-2 md:p-3 font-medium text-gray-900 border-r text-xs flex items-center h-10 md:h-14 bg-blue-50 sticky left-0 z-20 transition-all duration-200"
                    style={{ width: getFrozenColumnWidth() }}
                  >
                    <span>
                      {window.innerWidth < 768 && isScrolled ? 'Crew' : getCrewCountRowLabel()}
                    </span>
                  </div>
                  {visiblePeriods.map((period, index) => {
                    const crewCount = calculatePeriodCrewCount(period);
                    return (
                      <div
                        key={format(period, timeUnit === 'D' ? 'yyyy-MM-dd' : timeUnit === 'W' ? 'yyyy-ww' : 'yyyy-MM')}
                        className={`p-1 md:p-3 text-center border-r font-medium text-xs md:text-sm flex items-center justify-center h-10 md:h-14 ${
                          needsWeekBorder(index) ? 'border-l-4 border-l-gray-300' : ''
                        } ${isPastPeriod() ? 'opacity-60' : ''}`}
                      >
                        {crewCount > 0 ? crewCount : ''}
                      </div>
                    );
                  })}
                </div>
              )}

              <div>
                {phases.map((phase) => {
                  const timelineSpan = getPhaseTimelineSpan(phase);
                  
                  return (
                    <div key={phase.id}>
                      <div style={getGridStyle()} className="bg-gray-100 relative">
                        <div 
                          className="p-2 md:p-3 font-medium text-gray-900 border-r border-b flex justify-between items-center h-10 md:h-14 bg-gray-100 sticky left-0 z-10 transition-all duration-200"
                          style={{ width: getFrozenColumnWidth() }}
                        >
                          <span className="text-sm md:text-base truncate flex-1 min-w-0">
                            {window.innerWidth < 768 && isScrolled ? (
                              phase.name.substring(0, 8) + (phase.name.length > 8 ? '...' : '')
                            ) : (
                              phase.name
                            )}
                          </span>
                          <button
                            onClick={() => handleAddTask(phase.id)}
                            className="text-gray-500 hover:text-gray-700 ml-1 flex-shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {visiblePeriods.map((period, index) => (
                          <div
                            key={format(period, timeUnit === 'D' ? 'yyyy-MM-dd' : timeUnit === 'W' ? 'yyyy-ww' : 'yyyy-MM')}
                            className={`border-r border-b relative h-10 md:h-14 ${
                              needsWeekBorder(index) ? 'border-l-4 border-l-gray-300' : ''
                            } ${isPastPeriod() ? 'opacity-60' : ''}`}
                          >
                            {/* Phase timeline bar with start/end indicators */}
                            {timelineSpan && (
                              <>
                                {/* Start indicator */}
                                {index === timelineSpan.startIndex && (
                                  <>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-600 rounded-full z-20" />
                                    {/* Timeline bar from center of start cell to center of end cell */}
                                    <div 
                                      className="absolute top-1/2 transform -translate-y-1/2 h-1 bg-gray-500 z-10"
                                      style={{
                                        left: '50%',
                                        width: `calc(${(timelineSpan.endIndex - timelineSpan.startIndex) * 100}% + ${(timelineSpan.endIndex - timelineSpan.startIndex) * 1}px)`
                                      }}
                                    />
                                  </>
                                )}
                                {/* End indicator */}
                                {index === timelineSpan.endIndex && index !== timelineSpan.startIndex && (
                                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-600 rounded-full z-20" />
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>

                      {phase.tasks.map((task) => (
                        <div
                          key={task.id}
                          style={getGridStyle()}
                          className="border-t border-t-gray-600"
                        >
                          <div 
                            className="p-2 md:p-4 border-r border-b h-12 md:h-16 bg-white sticky left-0 z-10 transition-all duration-200"
                            style={{ width: getFrozenColumnWidth() }}
                          >
                            <div className="flex justify-between items-center h-full">
                              <div className="flex-1 min-w-0">
                                <div 
                                  className="text-xs md:text-sm font-medium text-gray-900 truncate cursor-pointer"
                                  onClick={(e) => handleTaskNameClick(task.name, task.responsible, e)}
                                >
                                  {window.innerWidth < 768 && isScrolled ? (
                                    getAbbreviatedTaskName(task.name)
                                  ) : (
                                    task.name
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {window.innerWidth < 768 && isScrolled ? (
                                    getPersonInitials(task.responsible)
                                  ) : (
                                    task.responsible
                                  )}
                                </div>
                              </div>
                              <div className="relative ml-1 flex-shrink-0">
                                <button
                                  onClick={() => setShowTaskMenu(showTaskMenu === task.id ? null : task.id)}
                                  className="text-gray-500 hover:text-gray-700 p-1"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                {showTaskMenu === task.id && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-40" 
                                      onClick={() => setShowTaskMenu(null)}
                                    />
                                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-[9999] min-w-[140px]">
                                      <button
                                        onClick={() => handleEditTask(task, phase.id)}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleEditTimeline(task)}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                        disabled={timeUnit !== 'D'}
                                      >
                                        <Calendar className="w-4 h-4" />
                                        Edit Timeline
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTask(phase.id, task.id)}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          {visiblePeriods.map((period, index) => {
                            const isSelected = selectedTask?.id === task.id && 
                              selectedDates.start && selectedDates.end && 
                              period >= selectedDates.start && period <= selectedDates.end;
                            const periodStr = format(period, 'yyyy-MM-dd');
                            const crewCount = timeUnit === 'D' ? task.crewCounts?.[periodStr] : calculatePeriodCrewCount(period);
                            const isEditing = editingCrewCount?.taskId === task.id && editingCrewCount?.date === periodStr;
                            const canEdit = isTaskInPeriod(task, period);
                            const editModeBorderClasses = getEditModeBorderClasses(task, period, index);

                            return (
                              <div
                                key={format(period, timeUnit === 'D' ? 'yyyy-MM-dd' : timeUnit === 'W' ? 'yyyy-ww' : 'yyyy-MM')}
                                data-period-index={index}
                                onMouseDown={(e) => handleCellMouseDown(period, task, phase.id, e)}
                                onMouseEnter={() => handleCellMouseEnter(period)}
                                onTouchStart={isSettingTimeline && task.id === selectedTask?.id ? (e) => handleCellTouchStart(period, task, phase.id, e) : undefined}
                                onClick={() => handleCellClick(task, period)}
                                className={`border-r border-b cursor-pointer relative h-12 md:h-16 ${
                                  getCellColor(task, period)
                                } ${isSelected ? 'bg-blue-200' : ''} ${
                                  needsWeekBorder(index) ? 'border-l-4 border-l-gray-300' : ''
                                } ${editModeBorderClasses} ${isPastPeriod() ? 'opacity-60' : ''}`}
                              >
                                {showCrewCount && canEdit && (
                                  isEditing ? (
                                    <input
                                      type="number"
                                      value={crewCount || ''}
                                      onChange={(e) => handleCrewCountChange(e, task.id, periodStr)}
                                      onBlur={() => setEditingCrewCount(null)}
                                      className="absolute inset-0 w-full h-full text-center text-xs"
                                      autoFocus
                                    />
                                  ) : (
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (timeUnit === 'D') {
                                          handleCrewCountClick(task.id, period);
                                        }
                                      }}
                                      className="absolute inset-0 flex items-center justify-center text-xs"
                                    >
                                      {timeUnit === 'D' ? (crewCount || '') : (crewCount > 0 ? crewCount : '')}
                                    </div>
                                  )
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Task</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTask}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Name Toast */}
      {taskNameToast && (
        <div 
          className="fixed z-50 bg-gray-900 text-white px-3 py-2 rounded-md text-sm max-w-xs"
          style={{
            left: taskNameToast.x,
            top: taskNameToast.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="font-medium">{taskNameToast.name}</div>
          <div className="text-xs text-gray-300">{taskNameToast.responsible}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
          setSelectedDates({ start: null, end: null });
        }}
        onSave={handleSaveTask}
        task={selectedTask}
        phaseId={selectedPhaseId || ''}
      />

      <PhaseModal
        isOpen={isPhaseModalOpen}
        onClose={() => setIsPhaseModalOpen(false)}
        onSave={handleSavePhase}
      />
    </div>
  );
}