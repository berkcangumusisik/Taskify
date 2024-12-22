import React, { useState } from 'react';
import useTaskStore from '../store/taskStore';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';

const CalendarView = () => {
  const { getFilteredTasks, addTask } = useTaskStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Ayın ilk ve son gününü hesapla
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  );

  // Takvim grid'i için günleri oluştur
  const calendarDays = [];
  const startDay = firstDayOfMonth.getDay() || 7; // Pazartesi: 1, Pazar: 7

  // Önceki ayın günlerini ekle
  for (let i = 1; i < startDay; i++) {
    const prevDate = new Date(firstDayOfMonth);
    prevDate.setDate(prevDate.getDate() - (startDay - i));
    calendarDays.push({ date: prevDate, isCurrentMonth: false });
  }

  // Bu ayın günlerini ekle
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    calendarDays.push({ date, isCurrentMonth: true });
  }

  // Sonraki ayın günlerini ekle (42 güne tamamla - 6 hafta)
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    const nextDate = new Date(lastDayOfMonth);
    nextDate.setDate(nextDate.getDate() + i);
    calendarDays.push({ date: nextDate, isCurrentMonth: false });
  }

  // Belirli bir gün için görevleri filtrele
  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const normalizedDate = new Date(dateStr + 'T00:00:00');

    return getFilteredTasks({
      date: normalizedDate,
    });
  };

  // Takvim günü render fonksiyonu
  const renderCalendarDay = ({ date, isCurrentMonth }, index) => {
    const normalizedDate = new Date(
      date.toISOString().split('T')[0] + 'T00:00:00',
    );
    const dayTasks = getTasksForDate(normalizedDate);
    const isToday = normalizedDate.toDateString() === new Date().toDateString();

    return (
      <div
        key={index}
        onClick={() => {
          setSelectedDate(normalizedDate);
          document.getElementById('day-detail-modal').showModal();
        }}
        className={`min-h-[120px] p-2 border rounded-lg cursor-pointer 
          hover:bg-base-200/50 transition-colors relative
          ${isCurrentMonth ? 'bg-base-100' : 'bg-base-200 opacity-50'}
          ${isToday ? 'ring-2 ring-primary' : ''}
        `}
      >
        <div className="text-sm font-medium mb-1 flex justify-between items-center">
          <span>{date.getDate()}</span>
          {dayTasks.length > 0 && (
            <span className="badge badge-sm">{dayTasks.length}</span>
          )}
        </div>
        <div className="space-y-1">
          {dayTasks.map((task) => (
            <div
              key={task.id}
              className={`text-xs p-1.5 rounded-lg truncate relative
                ${task.status === 'done' ? 'bg-success/20' : 'bg-base-200'}
                ${task.priority === 'high' ? 'border-l-2 border-error' : ''}
                ${task.priority === 'medium' ? 'border-l-2 border-warning' : ''}
              `}
            >
              <div className="flex items-center gap-1">
                <span className="truncate">
                  {task.schedule?.type === 'daily' && '🔄 '}
                  {task.schedule?.type === 'weekly' && '📅 '}
                  {task.schedule?.type === 'monthly' && '📆 '}
                  {task.title}
                </span>
                {task.schedule?.startTime && (
                  <span className="text-[10px] opacity-70 whitespace-nowrap">
                    {task.schedule.startTime}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  // Yeni görev ekleme
  const handleAddTask = () => {
    if (newTaskTitle.trim() && selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];

      addTask({
        title: newTaskTitle,
        status: 'todo',
        priority: 'low',
        schedule: {
          type: 'once',
          date: dateStr,
          startTime: '09:00',
          endTime: '17:00',
        },
      });
      setNewTaskTitle('');
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Üst Toolbar */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {currentDate.toLocaleString('tr-TR', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <div className="flex gap-2">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.setMonth(currentDate.getMonth() - 1)),
              )
            }
          >
            ←
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Bugün
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.setMonth(currentDate.getMonth() + 1)),
              )
            }
          >
            →
          </button>
        </div>
      </div>

      {/* Takvim Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Hafta Günleri */}
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center font-bold">
            {day}
          </div>
        ))}

        {/* Takvim Günleri */}
        {calendarDays.map(renderCalendarDay)}
      </div>

      {/* Gün Detay Modalı */}
      <dialog id="day-detail-modal" className="modal">
        <div className="modal-box max-w-3xl">
          <h3 className="font-bold text-lg mb-4">
            {selectedDate?.toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              weekday: 'long',
            })}
          </h3>

          <div className="space-y-4">
            {/* O güne ait görevler */}
            <div className="space-y-2">
              <h4 className="font-medium">Görevler</h4>
              {selectedDate &&
                getTasksForDate(selectedDate).map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
            </div>

            {/* Yeni görev ekleme formu */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Yeni Görev</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input input-bordered flex-1"
                  placeholder="Görev başlığı..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTask();
                    }
                  }}
                />
                <button className="btn btn-primary" onClick={handleAddTask}>
                  Ekle
                </button>
              </div>
            </div>
          </div>

          <div className="modal-action">
            <button
              className="btn"
              onClick={() => {
                document.getElementById('day-detail-modal').close();
                setSelectedDate(null);
              }}
            >
              Kapat
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default CalendarView;
