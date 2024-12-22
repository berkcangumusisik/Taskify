import { useState, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useTaskStore from '../store/taskStore'; // TaskStore'u import et

// Pomodoro Store
const usePomodoroStore = create(
  persist(
    (set) => ({
      sessions: [], // Günlük seanslar
      settings: {
        workDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4,
      },
      addSession: (session) =>
        set((state) => ({
          sessions: [...state.sessions, { ...session, id: Date.now() }],
        })),
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      clearSessions: () => set({ sessions: [] }),
    }),
    {
      name: 'pomodoro-store',
    },
  ),
);

const PomodoroTimer = () => {
  const { settings, sessions, addSession, updateSettings, clearSessions } =
    usePomodoroStore();
  const { tasks } = useTaskStore(); // TaskStore'u ekleyelim
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentSession, setCurrentSession] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const [selectedTaskId, setSelectedTaskId] = useState(null); // Seçili görev

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // Aktif görevleri filtrele (tamamlanmamış görevler)
  const getActiveTasks = () => {
    return tasks.filter((task) => task.status !== 'done');
  };

  const handleTimerComplete = () => {
    const audio = new Audio('/src/assets/notification.mp3');
    audio.play();

    if (!isBreak) {
      // Çalışma seansı bitti
      addSession({
        date: new Date(),
        duration: settings.workDuration,
        type: 'work',
        taskId: selectedTaskId, // Seçili görevi kaydet
      });

      if (currentSession % settings.sessionsUntilLongBreak === 0) {
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setTimeLeft(settings.breakDuration * 60);
      }
    } else {
      // Mola bitti
      setTimeLeft(settings.workDuration * 60);
      setCurrentSession((prev) => prev + 1);
    }
    setIsBreak((prev) => !prev);
    setIsRunning(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const getTodaySessions = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    return sessions.filter((session) => {
      const sessionDate = new Date(session.date).setHours(0, 0, 0, 0);
      return sessionDate === today;
    });
  };

  const getStats = () => {
    const todaySessions = getTodaySessions();
    const totalMinutes = todaySessions.reduce(
      (acc, session) => acc + session.duration,
      0,
    );
    const totalSessions = todaySessions.length;
    return { totalMinutes, totalSessions };
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      {/* Ana Timer */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-4xl mb-4">
            {isBreak ? 'Mola' : 'Çalışma'} Zamanı
          </h2>
          <div className="text-8xl font-bold mb-8 font-mono">
            {formatTime(timeLeft)}
          </div>
          <div className="flex gap-4">
            <button
              className={`btn btn-lg ${
                isRunning ? 'btn-error' : 'btn-primary'
              }`}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? 'Durdur' : 'Başlat'}
            </button>
            <button
              className="btn btn-lg btn-outline"
              onClick={() => {
                setIsRunning(false);
                setTimeLeft(settings.workDuration * 60);
                setIsBreak(false);
              }}
            >
              Sıfırla
            </button>
          </div>
          <div className="mt-4 text-base-content/60">
            Seans {currentSession} / {settings.sessionsUntilLongBreak}
          </div>

          {/* Görev Seçici */}
          {!isBreak && (
            <div className="form-control w-full max-w-xs mt-4">
              <label className="label">
                <span className="label-text">Çalışılacak Görev</span>
              </label>
              <select
                className="select select-bordered"
                value={selectedTaskId || ''}
                onChange={(e) => setSelectedTaskId(e.target.value || null)}
                disabled={isRunning}
              >
                <option value="">Görev seçin...</option>
                {getActiveTasks().map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Bugünün İstatistikleri</h2>
            <div className="stats stats-vertical shadow">
              <div className="stat">
                <div className="stat-title">Toplam Çalışma</div>
                <div className="stat-value">{getStats().totalMinutes} dk</div>
                <div className="stat-desc">
                  {getStats().totalSessions} seans tamamlandı
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ayarlar */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">
              Ayarlar
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setShowSettings(!showSettings)}
              >
                ⚙️
              </button>
            </h2>
            {showSettings ? (
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Çalışma Süresi (dk)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={tempSettings.workDuration}
                    onChange={(e) =>
                      setTempSettings({
                        ...tempSettings,
                        workDuration: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Kısa Mola Süresi (dk)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={tempSettings.breakDuration}
                    onChange={(e) =>
                      setTempSettings({
                        ...tempSettings,
                        breakDuration: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Uzun Mola Süresi (dk)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={tempSettings.longBreakDuration}
                    onChange={(e) =>
                      setTempSettings({
                        ...tempSettings,
                        longBreakDuration: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Uzun Mola Öncesi Seans</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={tempSettings.sessionsUntilLongBreak}
                    onChange={(e) =>
                      setTempSettings({
                        ...tempSettings,
                        sessionsUntilLongBreak: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setTempSettings(settings);
                      setShowSettings(false);
                    }}
                  >
                    İptal
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      updateSettings(tempSettings);
                      setShowSettings(false);
                      setTimeLeft(tempSettings.workDuration * 60);
                    }}
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div>Çalışma: {settings.workDuration} dk</div>
                <div>Kısa Mola: {settings.breakDuration} dk</div>
                <div>Uzun Mola: {settings.longBreakDuration} dk</div>
                <div>
                  Uzun Mola Öncesi: {settings.sessionsUntilLongBreak} seans
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seans Geçmişi - Görev bilgisiyle */}
        <div className="card bg-base-100 shadow-xl md:col-span-2">
          <div className="card-body">
            <h2 className="card-title flex justify-between">
              Bugünün Seansları
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  if (
                    confirm(
                      'Tüm seans geçmişini silmek istediğinize emin misiniz?',
                    )
                  ) {
                    clearSessions();
                  }
                }}
              >
                🗑️
              </button>
            </h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Saat</th>
                    <th>Tür</th>
                    <th>Süre</th>
                    <th>Görev</th>
                  </tr>
                </thead>
                <tbody>
                  {getTodaySessions()
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((session) => {
                      const task = tasks.find((t) => t.id === session.taskId);
                      return (
                        <tr key={session.id}>
                          <td>
                            {new Date(session.date).toLocaleTimeString(
                              'tr-TR',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              },
                            )}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                session.type === 'work'
                                  ? 'badge-primary'
                                  : 'badge-secondary'
                              }`}
                            >
                              {session.type === 'work' ? 'Çalışma' : 'Mola'}
                            </span>
                          </td>
                          <td>{session.duration} dk</td>
                          <td>
                            {task ? (
                              <div className="flex items-center gap-2">
                                <span>{task.title}</span>
                                {task.priority === 'high' && (
                                  <span className="badge badge-error badge-sm">
                                    Yüksek
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-base-content/50">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Görev Bazlı İstatistikler */}
        <div className="card bg-base-100 shadow-xl md:col-span-2">
          <div className="card-body">
            <h2 className="card-title">Görev Bazlı Çalışma Süreleri</h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Görev</th>
                    <th>Toplam Süre</th>
                    <th>Seans Sayısı</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks
                    .filter((task) => {
                      const taskSessions = sessions.filter(
                        (s) => s.taskId === task.id,
                      );
                      return taskSessions.length > 0;
                    })
                    .map((task) => {
                      const taskSessions = sessions.filter(
                        (s) => s.taskId === task.id,
                      );
                      const totalMinutes = taskSessions.reduce(
                        (acc, s) => acc + s.duration,
                        0,
                      );
                      return (
                        <tr key={task.id}>
                          <td>{task.title}</td>
                          <td>{totalMinutes} dk</td>
                          <td>{taskSessions.length} seans</td>
                          <td>
                            <span
                              className={`badge ${
                                task.status === 'done'
                                  ? 'badge-success'
                                  : task.status === 'in-progress'
                                  ? 'badge-warning'
                                  : 'badge-ghost'
                              }`}
                            >
                              {task.status === 'done'
                                ? 'Tamamlandı'
                                : task.status === 'in-progress'
                                ? 'Devam Ediyor'
                                : 'Yapılacak'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
