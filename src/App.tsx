import React, { useState } from 'react';
import { List, Users, CalendarDays } from 'lucide-react';
import { ViewMode, Phase, TimeUnit } from './types';
import { CalendarView } from './components/CalendarView';
import { TodayView } from './components/TodayView';

// Initial mock data
const initialPhases: Phase[] = [
  {
    id: '1',
    name: 'Foundation',
    tasks: [
      {
        id: '1',
        name: 'Excavation',
        startDate: new Date(2024, 2, 15),
        endDate: new Date(2024, 2, 18),
        responsible: 'John Doe',
        status: 'in-progress',
        comments: [],
        crewCounts: {
          '2024-03-15': 3,
          '2024-03-16': 4,
          '2024-03-17': 4,
          '2024-03-18': 2
        },
        cellStatuses: {}
      }
    ]
  }
];

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('2W'); // Default to 2W
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('D'); // Default to Daily
  const [showTodayView, setShowTodayView] = useState(false);
  const [phases, setPhases] = useState<Phase[]>(initialPhases);
  const [showCrewCount, setShowCrewCount] = useState(false);
  const [showWeekends, setShowWeekends] = useState(true);

  const handleTimeUnitChange = (unit: TimeUnit) => {
    setTimeUnit(unit);
    // Update view mode based on time unit
    switch (unit) {
      case 'D':
        setViewMode('2W');
        break;
      case 'W':
        setViewMode('2M');
        break;
      case 'M':
        setViewMode('2M'); // Will show 12 months
        break;
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Update time unit if needed
    if (['2W', '3W', '4W'].includes(mode)) {
      setTimeUnit('D');
    } else if (['2M', '3M', '4M'].includes(mode)) {
      if (timeUnit === 'D') {
        setTimeUnit('W');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-center">
            <h1 className="modern-logo">2WLA</h1>
          </div>
        </div>
      </header>

      {/* Controls Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left side - View mode and list button */}
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              {timeUnit === 'D' ? (
                <>
                  <button
                    onClick={() => handleViewModeChange('2W')}
                    className={`px-2 md:px-3 py-2 rounded text-xs md:text-sm font-medium ${
                      viewMode === '2W' ? 'bg-white shadow' : 'hover:bg-gray-200'
                    }`}
                    title="Two Week View"
                  >
                    2W
                  </button>
                  <button
                    onClick={() => handleViewModeChange('3W')}
                    className={`px-2 md:px-3 py-2 rounded text-xs md:text-sm font-medium ${
                      viewMode === '3W' ? 'bg-white shadow' : 'hover:bg-gray-200'
                    }`}
                    title="Three Week View"
                  >
                    3W
                  </button>
                  <button
                    onClick={() => handleViewModeChange('4W')}
                    className={`px-2 md:px-3 py-2 rounded text-xs md:text-sm font-medium ${
                      viewMode === '4W' ? 'bg-white shadow' : 'hover:bg-gray-200'
                    }`}
                    title="Four Week View"
                  >
                    4W
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleViewModeChange('2M')}
                    className={`px-2 md:px-3 py-2 rounded text-xs md:text-sm font-medium ${
                      viewMode === '2M' ? 'bg-white shadow' : 'hover:bg-gray-200'
                    }`}
                    title={timeUnit === 'W' ? "Two Month View" : "Two Month View"}
                  >
                    2M
                  </button>
                  <button
                    onClick={() => handleViewModeChange('3M')}
                    className={`px-2 md:px-3 py-2 rounded text-xs md:text-sm font-medium ${
                      viewMode === '3M' ? 'bg-white shadow' : 'hover:bg-gray-200'
                    }`}
                    title={timeUnit === 'W' ? "Three Month View" : "Three Month View"}
                  >
                    3M
                  </button>
                  <button
                    onClick={() => handleViewModeChange('4M')}
                    className={`px-2 md:px-3 py-2 rounded text-xs md:text-sm font-medium ${
                      viewMode === '4M' ? 'bg-white shadow' : 'hover:bg-gray-200'
                    }`}
                    title={timeUnit === 'W' ? "Four Month View" : "Four Month View"}
                  >
                    4M
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={() => setShowTodayView(true)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-md"
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Center - Toggle buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCrewCount(!showCrewCount)}
              className={`p-2 rounded-md transition-colors ${
                showCrewCount 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title="Toggle Crew Count"
            >
              <Users className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowWeekends(!showWeekends)}
              className={`p-2 rounded-md transition-colors ${
                showWeekends 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title="Toggle Weekends"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>

          {/* Right side - Time unit toggle */}
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => handleTimeUnitChange('D')}
              className={`px-2 md:px-3 py-2 rounded text-xs md:text-sm font-medium ${
                timeUnit === 'D' ? 'bg-white shadow' : 'hover:bg-gray-200'
              }`}
              title="Daily View"
            >
              D
            </button>
            <button
              onClick={() => handleTimeUnitChange('W')}
              className={`px-2 md:px-3 py-2 rounded text-xs md:text-sm font-medium ${
                timeUnit === 'W' ? 'bg-white shadow' : 'hover:bg-gray-200'
              }`}
              title="Weekly View"
            >
              W
            </button>
            <button
              onClick={() => handleTimeUnitChange('M')}
              className={`px-2 md:px-3 py-2 rounded text-xs md:text-sm font-medium ${
                timeUnit === 'M' ? 'bg-white shadow' : 'hover:bg-gray-200'
              }`}
              title="Monthly View"
            >
              M
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-6">
        {showTodayView ? (
          <TodayView
            phases={phases}
            setPhases={setPhases}
            onBack={() => setShowTodayView(false)}
          />
        ) : (
          <CalendarView 
            viewMode={viewMode} 
            timeUnit={timeUnit}
            phases={phases}
            setPhases={setPhases}
            showCrewCount={showCrewCount}
            setShowCrewCount={setShowCrewCount}
            showWeekends={showWeekends}
            setShowWeekends={setShowWeekends}
          />
        )}
      </main>
    </div>
  );
}

export default App;