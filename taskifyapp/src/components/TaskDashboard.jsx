import { useState } from 'react';
import useTaskStore from '../store/taskStore';
import { motion } from 'framer-motion';

const TaskDashboard = () => {
  const { tasks } = useTaskStore();
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  // İstatistikleri hesapla
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'done').length,
    pending: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    highPriority: tasks.filter((t) => t.priority === 'high').length,
  };

  const completionRate = stats.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          className="stat bg-base-200 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="stat-title">Tamamlanan</div>
          <div className="stat-value text-success">{stats.completed}</div>
          <div className="stat-desc">Toplam {stats.total} g��revden</div>
        </motion.div>

        <motion.div
          className="stat bg-base-200 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="stat-title">Devam Eden</div>
          <div className="stat-value text-warning">{stats.inProgress}</div>
          <div className="stat-desc">Aktif görevler</div>
        </motion.div>

        <motion.div
          className="stat bg-base-200 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="stat-title">Bekleyen</div>
          <div className="stat-value text-info">{stats.pending}</div>
          <div className="stat-desc">Henüz başlanmamış</div>
        </motion.div>

        <motion.div
          className="stat bg-base-200 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="stat-title">Tamamlanma Oranı</div>
          <div className="stat-value text-primary">{completionRate}%</div>
          <div className="stat-desc">Genel ilerleme</div>
        </motion.div>
      </div>

      {/* Günlük Özet */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title">Günlük Özet</h2>
          <div className="flex gap-4 mb-4">
            <button
              className={`btn ${
                selectedPeriod === 'today' ? 'btn-primary' : 'btn-ghost'
              }`}
              onClick={() => setSelectedPeriod('today')}
            >
              Bugün
            </button>
            <button
              className={`btn ${
                selectedPeriod === 'week' ? 'btn-primary' : 'btn-ghost'
              }`}
              onClick={() => setSelectedPeriod('week')}
            >
              Bu Hafta
            </button>
            <button
              className={`btn ${
                selectedPeriod === 'month' ? 'btn-primary' : 'btn-ghost'
              }`}
              onClick={() => setSelectedPeriod('month')}
            >
              Bu Ay
            </button>
          </div>

          {/* İlerleme Çubuğu */}
          <div className="w-full bg-base-300 rounded-full h-4 mb-4">
            <motion.div
              className="bg-primary h-4 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Öncelik Dağılımı */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-error/20 p-4 rounded-lg">
              <div className="text-lg font-bold text-error">Yüksek</div>
              <div>{stats.highPriority} görev</div>
            </div>
            <div className="bg-warning/20 p-4 rounded-lg">
              <div className="text-lg font-bold text-warning">Orta</div>
              <div>
                {tasks.filter((t) => t.priority === 'medium').length} görev
              </div>
            </div>
            <div className="bg-success/20 p-4 rounded-lg">
              <div className="text-lg font-bold text-success">Düşük</div>
              <div>
                {tasks.filter((t) => t.priority === 'low').length} görev
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Yaklaşan Görevler */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title">Yaklaşan Görevler</h2>
          <div className="space-y-2">
            {tasks
              .filter((t) => t.status !== 'done')
              .sort(
                (a, b) =>
                  new Date(a.schedule?.dueDate || '') -
                  new Date(b.schedule?.dueDate || ''),
              )
              .slice(0, 5)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 bg-base-100 rounded"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        task.priority === 'high'
                          ? 'bg-error'
                          : task.priority === 'medium'
                          ? 'bg-warning'
                          : 'bg-success'
                      }`}
                    />
                    <span>{task.title}</span>
                  </div>
                  {task.schedule?.dueDate && (
                    <span className="text-sm opacity-70">
                      {new Date(task.schedule.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDashboard;
