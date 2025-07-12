export type CellStatus = 'none' | 'on-track' | 'flag' | 'missed' | 'completed';

export type Task = {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  responsible: string;
  crewCount?: number;
  status: 'pending' | 'in-progress' | 'completed' | 'behind';
  comments: Comment[];
  crewCounts: { [date: string]: number };
  cellStatuses: { [date: string]: CellStatus };
};

export type Phase = {
  id: string;
  name: string;
  tasks: Task[];
};

export type Comment = {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
};

export type ViewMode = '2W' | '3W' | '4W' | '2M' | '3M' | '4M';
export type TimeUnit = 'D' | 'W' | 'M';
export type CountMode = 'hours' | 'crew';