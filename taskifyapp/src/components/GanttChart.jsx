import { useState, useEffect } from 'react';
import useTaskStore from '../store/taskStore';

const GanttChart = () => {
  const { tasks, addTask } = useTaskStore();
  const [viewType, setViewType] = useState('month');
  const [dateRange, setDateRange] = useState(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(1); // Ayın başından başla
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1); // Bir ay göster
    return { start, end };
  });
  const [scheduledTasks, setScheduledTasks] = useState([]);

  // Tarih seçici modalı için state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDateRange, setTempDateRange] = useState({
    start: null,
    end: null,
  });

  // Tarih seçimini uygula
  const applyDateRange = () => {
    if (tempDateRange.start && tempDateRange.end) {
      const start = new Date(tempDateRange.start);
      const end = new Date(tempDateRange.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      setDateRange({ start, end });
      setShowDatePicker(false);
    }
  };

  // Zamanlanmış görevleri filtrele ve sırala
  useEffect(() => {
    const filtered = tasks
      .filter((task) => task.schedule)
      .map((task) => ({
        ...task,
        startDate:
          task.schedule.type === 'once'
            ? new Date(task.schedule.date)
            : new Date(task.schedule.startDate),
        endDate:
          task.schedule.type === 'once'
            ? new Date(task.schedule.date)
            : task.schedule.endDate
            ? new Date(task.schedule.endDate)
            : new Date(task.schedule.startDate),
      }))
      .sort((a, b) => a.startDate - b.startDate);

    setScheduledTasks(filtered);
  }, [tasks]);

  // Tarih aralığındaki günleri oluştur
  const getDaysArray = () => {
    const days = [];
    const currentDate = new Date(dateRange.start);
    while (currentDate <= dateRange.end) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  };

  // Görev çubuğunun konumunu ve genişliğini hesapla
  const calculateTaskBar = (task) => {
    const totalDays = Math.ceil(
      (dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24),
    );
    const startDiff = Math.max(
      0,
      Math.ceil((task.startDate - dateRange.start) / (1000 * 60 * 60 * 24)),
    );
    const duration =
      Math.ceil((task.endDate - task.startDate) / (1000 * 60 * 60 * 24)) + 1;

    const left = `${(startDiff / totalDays) * 100}%`;
    const width = `${(duration / totalDays) * 100}%`;

    return { left, width };
  };

  // Tarih başlıklarını oluştur
  const getDateHeaders = () => {
    const headers = [];
    const currentDate = new Date(dateRange.start);

    while (currentDate <= dateRange.end) {
      headers.push({
        date: new Date(currentDate),
        isFirstOfMonth: currentDate.getDate() === 1,
        isFirstOfWeek: currentDate.getDay() === 1,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return headers;
  };

  // Görünüm tipini değiştirdiğimizde tarih aralığını güncelle
  useEffect(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);

    switch (viewType) {
      case 'week':
        // Haftanın başlangıcına git (Pazartesi)
        start.setDate(start.getDate() - start.getDay() + 1);
        end.setDate(start.getDate() + 6); // 7 gün göster
        break;
      case 'month':
        start.setDate(1); // Ayın başı
        end.setMonth(start.getMonth() + 1); // Sonraki ayın başı
        end.setDate(0); // Bu ayın sonu
        break;
      case 'year':
        start.setMonth(0, 1); // Yılın başı
        end.setMonth(11, 31); // Yılın sonu
        break;
    }

    setDateRange({ start, end });
  }, [viewType]);

  // Bugüne git fonksiyonu
  const goToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    const end = new Date(today);

    switch (viewType) {
      case 'week':
        start.setDate(start.getDate() - start.getDay() + 1);
        end.setDate(start.getDate() + 6);
        break;
      case 'month':
        start.setDate(1);
        end.setMonth(start.getMonth() + 1, 0);
        break;
      case 'year':
        start.setMonth(0, 1);
        end.setMonth(11, 31);
        break;
    }

    setDateRange({ start, end });
  };

  // Tarih aralığını kaydır
  const moveRange = (direction) => {
    const newStart = new Date(dateRange.start);
    const newEnd = new Date(dateRange.end);
    const moveBy = direction === 'next' ? 1 : -1;

    switch (viewType) {
      case 'week':
        newStart.setDate(newStart.getDate() + 7 * moveBy);
        newEnd.setDate(newEnd.getDate() + 7 * moveBy);
        break;
      case 'month':
        newStart.setMonth(newStart.getMonth() + moveBy);
        newEnd.setMonth(newEnd.getMonth() + moveBy);
        break;
      case 'year':
        newStart.setFullYear(newStart.getFullYear() + moveBy);
        newEnd.setFullYear(newEnd.getFullYear() + moveBy);
        break;
    }

    setDateRange({ start: newStart, end: newEnd });
  };

  const headers = getDateHeaders();

  return (
    <div className="p-2 md:p-4 space-y-4">
      {/* Üst Bar - Responsive */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Gantt Görünümü</h2>
          <p className="text-base-content/60 text-sm">Görev zaman çizelgesi</p>
        </div>

        {/* Kontroller - Responsive */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Görünüm Seçici */}
          <div className="join join-horizontal flex-1 md:flex-none">
            <button
              className={`join-item btn btn-sm ${
                viewType === 'week' ? 'btn-active' : ''
              }`}
              onClick={() => setViewType('week')}
            >
              Hafta
            </button>
            <button
              className={`join-item btn btn-sm ${
                viewType === 'month' ? 'btn-active' : ''
              }`}
              onClick={() => setViewType('month')}
            >
              Ay
            </button>
            <button
              className={`join-item btn btn-sm ${
                viewType === 'year' ? 'btn-active' : ''
              }`}
              onClick={() => setViewType('year')}
            >
              Yıl
            </button>
          </div>

          {/* Navigasyon */}
          <div className="join">
            <button
              className="join-item btn btn-sm"
              onClick={() => moveRange('prev')}
            >
              ←
            </button>
            <button className="join-item btn btn-sm" onClick={goToToday}>
              Bugün
            </button>
            <button
              className="join-item btn btn-sm"
              onClick={() => moveRange('next')}
            >
              →
            </button>
          </div>

          <button className="btn btn-primary btn-sm ml-auto md:ml-0">
            + Yeni Görev
          </button>
        </div>
      </div>

      {/* Gantt Chart Container - Responsive Scroll */}
      <div className="border rounded-lg overflow-auto">
        <div className="min-w-[800px]">
          {' '}
          {/* Minimum genişlik */}
          {/* Başlık Satırları - Sticky Header */}
          <div className="grid grid-cols-[200px_1fr] border-b sticky top-0 bg-base-100 z-10">
            <div className="p-2 font-bold border-r">Görev</div>
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${headers.length}, minmax(30px, 1fr))`,
              }}
            >
              {/* Ay İsimleri */}
              <div className="contents text-xs">
                {headers.map((header, i) => (
                  <div
                    key={`month-${i}`}
                    className={`p-1 text-center border-r ${
                      header.isFirstOfMonth ? 'font-bold bg-base-200' : ''
                    }`}
                  >
                    {header.isFirstOfMonth
                      ? header.date.toLocaleString('tr-TR', { month: 'short' })
                      : ''}
                  </div>
                ))}
              </div>
              {/* Gün Numaraları */}
              <div className="contents text-xs">
                {headers.map((header, i) => (
                  <div
                    key={`day-${i}`}
                    className={`p-1 text-center border-r ${
                      header.isFirstOfWeek ? 'font-semibold' : ''
                    } ${
                      header.date.toDateString() === new Date().toDateString()
                        ? 'bg-primary/10'
                        : ''
                    }`}
                  >
                    {header.date.getDate()}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Görevler - Responsive Hover */}
          {scheduledTasks.map((task) => {
            const { left, width } = calculateTaskBar(task);
            return (
              <div
                key={task.id}
                className="grid grid-cols-[200px_1fr] border-b hover:bg-base-200/50 transition-colors"
              >
                <div className="p-2 border-r truncate">
                  <div className="flex items-center gap-2">
                    <span className="flex-1 truncate">{task.title}</span>
                    {task.priority === 'high' && (
                      <span className="badge badge-error badge-sm">!</span>
                    )}
                  </div>
                </div>
                <div className="relative h-8 group">
                  {' '}
                  {/* Hover grubu */}
                  <div
                    className="absolute top-1 h-6 bg-primary/20 border border-primary rounded-full 
                      flex items-center px-2 text-xs whitespace-nowrap overflow-hidden
                      group-hover:z-10 group-hover:shadow-lg group-hover:bg-primary/30
                      transition-all duration-200"
                    style={{ left, width }}
                    title={`${task.title}
${
  task.schedule.type === 'once'
    ? `Tarih: ${new Date(task.schedule.date).toLocaleDateString()}`
    : `${new Date(task.schedule.startDate).toLocaleDateString()} - ${
        task.schedule.endDate
          ? new Date(task.schedule.endDate).toLocaleDateString()
          : 'Süresiz'
      }`
}`}
                  >
                    <span className="truncate">{task.title}</span>
                    {task.schedule?.startTime && (
                      <span className="ml-2 opacity-70">
                        {task.schedule.startTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {/* Boş Durum */}
          {scheduledTasks.length === 0 && (
            <div className="text-center py-8 text-base-content/50">
              <div className="text-4xl mb-2">📅</div>
              <div>Henüz planlanmış görev yok</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
