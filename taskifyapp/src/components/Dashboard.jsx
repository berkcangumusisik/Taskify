import { useState, useEffect } from 'react';
import useTaskStore from '../store/taskStore';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const Dashboard = () => {
  const { tasks, getFilteredTasks, updateTask } = useTaskStore();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    upcoming: 0,
    overdue: 0,
    todayTasks: [],
    recentTasks: [],
    tasksByPriority: { high: 0, medium: 0, low: 0 },
    tasksByTag: {},
    weeklyStats: [],
    completionRate: 0,
  });

  useEffect(() => {
    calculateStats();
  }, [tasks, selectedPeriod, getFilteredTasks]);

  const calculateStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Temel istatistikler
    const completed = tasks.filter((task) => task.status === 'done').length;
    const inProgress = tasks.filter(
      (task) => task.status === 'in-progress',
    ).length;
    const todayTasks = getFilteredTasks({ date: today });
    const recentTasks = [...tasks]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Öncelik dağılımı
    const tasksByPriority = tasks.reduce(
      (acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      },
      { high: 0, medium: 0, low: 0 },
    );

    // Etiket dağılımı
    const tasksByTag = tasks.reduce((acc, task) => {
      task.tags.forEach((tagId) => {
        acc[tagId] = (acc[tagId] || 0) + 1;
      });
      return acc;
    }, {});

    // Zaman bazlı istatistikler
    const periodStats = getPeriodStats(selectedPeriod);

    // Tamamlanma oranı
    const completionRate =
      tasks.length > 0 ? (completed / tasks.length) * 100 : 0;

    setStats({
      total: tasks.length,
      completed,
      inProgress,
      upcoming: todayTasks.length,
      overdue: tasks.filter((task) => {
        if (!task.schedule || task.status === 'done') return false;
        const endDate =
          task.schedule.type === 'once'
            ? new Date(task.schedule.date)
            : new Date(task.schedule.endDate || task.schedule.startDate);
        return endDate < today;
      }).length,
      todayTasks,
      recentTasks,
      tasksByPriority,
      tasksByTag,
      weeklyStats: periodStats,
      completionRate,
    });
  };

  const getPeriodStats = (period) => {
    const stats = [];
    const now = new Date();
    let startDate, endDate, interval;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        interval = { days: 1 };
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        interval = { days: 2 };
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        interval = { months: 1 };
        break;
    }

    endDate = new Date(now);
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayTasks = getFilteredTasks({ date: currentDate });
      stats.push({
        date: new Date(currentDate),
        total: dayTasks.length,
        completed: dayTasks.filter((t) => t.status === 'done').length,
      });

      if (interval.days) {
        currentDate.setDate(currentDate.getDate() + interval.days);
      } else {
        currentDate.setMonth(currentDate.getMonth() + interval.months);
      }
    }

    return stats;
  };

  // Yeni istatistikler için hesaplamalar
  const getProductivityStats = () => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyTasks = tasks.filter((task) => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= lastWeek && taskDate <= today;
    });

    const completedWeeklyTasks = weeklyTasks.filter(
      (task) => task.status === 'done',
    );
    const weeklyCompletionRate =
      weeklyTasks.length > 0
        ? (completedWeeklyTasks.length / weeklyTasks.length) * 100
        : 0;

    return {
      weeklyTasks: weeklyTasks.length,
      weeklyCompleted: completedWeeklyTasks.length,
      weeklyCompletionRate,
      averageTasksPerDay: Math.round((weeklyTasks.length / 7) * 10) / 10,
    };
  };

  // Görev süreleri analizi - Düzeltildi
  const getTaskDurationStats = () => {
    const completedTasks = tasks.filter(
      (task) => task.status === 'done' && task.completedAt,
    );
    if (completedTasks.length === 0)
      return { average: '-', fastest: '-', slowest: '-' };

    const durations = completedTasks
      .map((task) => {
        const start = new Date(task.createdAt);
        const end = new Date(task.completedAt);
        const duration = Math.round((end - start) / (1000 * 60 * 60 * 24)); // Gün cinsinden
        return duration >= 0 ? duration : 0; // Negatif değerleri 0'a çevir
      })
      .filter((duration) => !isNaN(duration)); // NaN değerleri filtrele

    if (durations.length === 0)
      return { average: '-', fastest: '-', slowest: '-' };

    const sum = durations.reduce((a, b) => a + b, 0);
    const average = Math.round(sum / durations.length);
    const fastest = Math.min(...durations);
    const slowest = Math.max(...durations);

    return {
      average: isNaN(average) ? '-' : average,
      fastest: isNaN(fastest) ? '-' : fastest,
      slowest: isNaN(slowest) ? '-' : slowest,
    };
  };

  const handleQuickComplete = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      await updateTask(taskId, {
        ...task,
        status: task.status === 'done' ? 'todo' : 'done',
        completedAt: task.status !== 'done' ? new Date().toISOString() : null,
      });
      calculateStats(); // İstatistikleri güncelle
    }
  };

  return (
    <div className="p-2 md:p-4 space-y-4">
      {/* Üst İstatistikler */}
      <div className="stats stats-vertical md:stats-horizontal shadow w-full bg-base-100 overflow-x-auto">
        <div className="stat">
          <div className="stat-figure text-primary">📊</div>
          <div className="stat-title">Toplam</div>
          <div className="stat-value text-primary">{stats.total}</div>
          <div className="stat-desc">Tüm zamanlar</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-success">✅</div>
          <div className="stat-title">Tamamlanan</div>
          <div className="stat-value text-success">{stats.completed}</div>
          <div className="stat-desc">%{Math.round(stats.completionRate)}</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-warning">⚡</div>
          <div className="stat-title">Devam Eden</div>
          <div className="stat-value text-warning">{stats.inProgress}</div>
          <div className="stat-desc">Aktif görevler</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-info">📅</div>
          <div className="stat-title">Bugün</div>
          <div className="stat-value text-info">{stats.upcoming}</div>
          <div className="stat-desc">Planlanmış</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-error">⚠️</div>
          <div className="stat-title">Geciken</div>
          <div className="stat-value text-error">{stats.overdue}</div>
          <div className="stat-desc">Acil</div>
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Trend Grafiği - Daha küçük */}
        <div className="card bg-base-100 shadow-xl lg:col-span-2">
          <div className="card-body p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="card-title text-lg">Görev Trendi</h2>
              <div className="join join-horizontal">
                <button
                  className={`join-item btn btn-xs ${
                    selectedPeriod === 'week' ? 'btn-active' : ''
                  }`}
                  onClick={() => setSelectedPeriod('week')}
                >
                  H
                </button>
                <button
                  className={`join-item btn btn-xs ${
                    selectedPeriod === 'month' ? 'btn-active' : ''
                  }`}
                  onClick={() => setSelectedPeriod('month')}
                >
                  A
                </button>
                <button
                  className={`join-item btn btn-xs ${
                    selectedPeriod === 'year' ? 'btn-active' : ''
                  }`}
                  onClick={() => setSelectedPeriod('year')}
                >
                  Y
                </button>
              </div>
            </div>
            <div className="h-[200px]">
              <Line
                data={{
                  labels: stats.weeklyStats.map((stat) =>
                    stat.date.toLocaleDateString('tr-TR', {
                      weekday: selectedPeriod === 'week' ? 'short' : undefined,
                      day: selectedPeriod !== 'year' ? 'numeric' : undefined,
                      month: selectedPeriod !== 'week' ? 'short' : undefined,
                      year: selectedPeriod === 'year' ? 'numeric' : undefined,
                    }),
                  ),
                  datasets: [
                    {
                      label: 'Toplam Görev',
                      data: stats.weeklyStats.map((stat) => stat.total),
                      borderColor: 'rgb(59, 130, 246)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.3,
                      fill: true,
                    },
                    {
                      label: 'Tamamlanan',
                      data: stats.weeklyStats.map((stat) => stat.completed),
                      borderColor: 'rgb(34, 197, 94)',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      tension: 0.3,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: { boxWidth: 10, padding: 10 },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { stepSize: 1 },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Öncelik Dağılımı - Daha kompakt */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4">
            <h2 className="card-title text-lg mb-2">Öncelik Dağılımı</h2>
            <div className="h-[200px]">
              <Doughnut
                data={{
                  labels: ['Yüksek', 'Orta', 'Düşük'],
                  datasets: [
                    {
                      data: [
                        stats.tasksByPriority.high,
                        stats.tasksByPriority.medium,
                        stats.tasksByPriority.low,
                      ],
                      backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(234, 179, 8, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: { boxWidth: 10, padding: 10 },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Son Aktiviteler - 2 Sütun */}
        <div className="card bg-base-100 shadow-xl lg:col-span-2">
          <div className="card-body p-4">
            <h2 className="card-title text-lg mb-2">Son Aktiviteler</h2>
            <div className="overflow-x-auto">
              <table className="table table-xs">
                <thead>
                  <tr>
                    <th>Görev</th>
                    <th>Durum</th>
                    <th>Öncelik</th>
                    <th>Eklenme</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentTasks.map((task) => (
                    <tr key={task.id} className="hover">
                      <td className="max-w-[200px] truncate">{task.title}</td>
                      <td>
                        <span
                          className={`badge badge-xs ${
                            task.status === 'done'
                              ? 'badge-success'
                              : task.status === 'in-progress'
                              ? 'badge-warning'
                              : 'badge-ghost'
                          }`}
                        >
                          {task.status === 'done'
                            ? '✓'
                            : task.status === 'in-progress'
                            ? '→'
                            : '○'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge badge-xs ${
                            task.priority === 'high'
                              ? 'badge-error'
                              : task.priority === 'medium'
                              ? 'badge-warning'
                              : 'badge-success'
                          }`}
                        >
                          {task.priority[0].toUpperCase()}
                        </span>
                      </td>
                      <td className="text-xs opacity-70">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Etiket Dağılımı - Daha kompakt */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4">
            <h2 className="card-title text-lg mb-2">Etiketler</h2>
            <div className="space-y-1">
              {Object.entries(stats.tasksByTag).map(([tagId, count]) => {
                const tag = useTaskStore
                  .getState()
                  .tags.find((t) => t.id === tagId);
                if (!tag) return null;
                const percentage = Math.round((count / stats.total) * 100) || 0;

                return (
                  <div key={tagId} className="flex items-center gap-1 text-sm">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1 truncate">{tag.label}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-1.5 bg-base-200 rounded-full">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: tag.color,
                          }}
                        />
                      </div>
                      <span className="text-xs opacity-70 w-4 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Yeni: Verimlilik İstatistikleri */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4">
            <h2 className="card-title text-lg mb-2">Verimlilik</h2>
            <div className="stats stats-vertical shadow">
              <div className="stat">
                <div className="stat-title">Haftalık Tamamlama</div>
                <div className="stat-value text-primary">
                  %{Math.round(getProductivityStats().weeklyCompletionRate)}
                </div>
                <div className="stat-desc">
                  {getProductivityStats().weeklyCompleted} /{' '}
                  {getProductivityStats().weeklyTasks} görev
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Günlük Ortalama</div>
                <div className="stat-value text-secondary">
                  {getProductivityStats().averageTasksPerDay}
                </div>
                <div className="stat-desc">görev/gün</div>
              </div>
            </div>
          </div>
        </div>

        {/* Yeni: Görev Süreleri */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4">
            <h2 className="card-title text-lg mb-2">Görev Süreleri</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-70">Ortalama</span>
                <span className="font-bold">
                  {getTaskDurationStats().average === '-'
                    ? '-'
                    : `${getTaskDurationStats().average} gün`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-70">En Hızlı</span>
                <span className="text-success font-bold">
                  {getTaskDurationStats().fastest === '-'
                    ? '-'
                    : `${getTaskDurationStats().fastest} gün`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-70">En Yavaş</span>
                <span className="text-error font-bold">
                  {getTaskDurationStats().slowest === '-'
                    ? '-'
                    : `${getTaskDurationStats().slowest} gün`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Yeni: Yaklaşan Görevler - İyileştirilmiş */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-lg">Yaklaşan Görevler</h2>
              <div className="badge badge-primary">
                {stats.todayTasks.length} görev
              </div>
            </div>
            <div className="space-y-2">
              {stats.todayTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-2 p-3 rounded-lg transition-all hover:shadow-md cursor-pointer
                    ${
                      task.status === 'done'
                        ? 'bg-base-200/50 opacity-70'
                        : 'bg-base-200'
                    }`}
                  onClick={() => handleQuickComplete(task.id)}
                >
                  <input
                    type="checkbox"
                    checked={task.status === 'done'}
                    className="checkbox checkbox-sm"
                    onChange={() => handleQuickComplete(task.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex-1 truncate ${
                          task.status === 'done' ? 'line-through' : ''
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.priority === 'high' && (
                        <span className="badge badge-error badge-sm">!</span>
                      )}
                    </div>
                    {task.schedule && (
                      <div className="text-xs opacity-70 flex items-center gap-1 mt-1">
                        <span>⏰</span>
                        {task.schedule.startTime && (
                          <span>{task.schedule.startTime}</span>
                        )}
                        {task.schedule.endTime && (
                          <span>- {task.schedule.endTime}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Edit task
                    }}
                  >
                    ✏️
                  </button>
                </div>
              ))}
              {stats.todayTasks.length === 0 && (
                <div className="text-center py-8 text-base-content/50">
                  <div className="text-4xl mb-2">🎉</div>
                  <div>Bugün için planlanmış görev yok!</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
