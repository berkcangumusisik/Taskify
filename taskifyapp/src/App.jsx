import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { BrowserRouter } from 'react-router-dom';
import Header from './components/Header';
import ListView from './components/ListView';
import CalendarView from './components/CalendarView';
import GanttChart from './components/GanttChart';
import KanbanView from './components/KanbanView';
import Dashboard from './components/Dashboard';
import PomodoroTimer from './components/PomodoroTimer';

const AppContent = () => {
  const [viewType, setViewType] = useState('dashboard');

  const renderView = () => {
    switch (viewType) {
      case 'dashboard':
        return <Dashboard />;
      case 'kanban':
        return <KanbanView />;
      case 'calendar':
        return <CalendarView />;
      case 'gantt':
        return <GanttChart />;
      case 'list':
        return <ListView />;
      case 'pomodoro':
        return <PomodoroTimer />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Header viewType={viewType} onViewChange={setViewType} />
      <div className="container mx-auto p-4">
        <main>
          <div className="bg-base-100 rounded-box shadow-lg">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
