import { useState } from 'react';
import useTaskStore from '../store/taskStore';

const ViewSelector = () => {
  const { viewMode, setViewMode } = useTaskStore();
  const [showViewMenu, setShowViewMenu] = useState(false);

  const views = [
    {
      id: 'kanban',
      title: 'Kanban',
      icon: '📋',
      description: 'Sürükle bırak ile görsel planlama',
    },
    {
      id: 'list',
      title: 'Liste',
      icon: '📝',
      description: 'Basit liste görünümü',
    },
    {
      id: 'calendar',
      title: 'Takvim',
      icon: '📅',
      description: 'Takvim bazlı planlama',
    },
    {
      id: 'timeline',
      title: 'Zaman Çizelgesi',
      icon: '⏳',
      description: 'Gantt benzeri görünüm',
    },
    {
      id: 'table',
      title: 'Tablo',
      icon: '🗃️',
      description: 'Özelleştirilebilir tablo görünümü',
    },
  ];

  return (
    <div className="relative">
      <button
        className="btn btn-ghost gap-2"
        onClick={() => setShowViewMenu(!showViewMenu)}
      >
        {views.find((v) => v.id === viewMode)?.icon}
        {views.find((v) => v.id === viewMode)?.title}
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {showViewMenu && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-base-100 rounded-lg shadow-xl z-50">
          <div className="p-2">
            {views.map((view) => (
              <button
                key={view.id}
                className={`w-full text-left p-2 rounded hover:bg-base-200 flex items-center gap-2 ${
                  viewMode === view.id ? 'bg-primary/10 text-primary' : ''
                }`}
                onClick={() => {
                  setViewMode(view.id);
                  setShowViewMenu(false);
                }}
              >
                <span className="text-xl">{view.icon}</span>
                <div>
                  <div className="font-medium">{view.title}</div>
                  <div className="text-xs text-base-content/60">
                    {view.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSelector;
