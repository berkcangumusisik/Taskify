import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const useTaskStore = create(
  persist(
    (set, get) => ({
      tasks: [],
      tags: [
        { id: 'personal', label: 'Kişisel', color: '#3B82F6' },
        { id: 'work', label: 'İş', color: '#10B981' },
        { id: 'urgent', label: 'Acil', color: '#EF4444' },
      ],
      statuses: {
        todo: { id: 'todo', label: 'Yapılacak', color: 'primary' },
        'in-progress': {
          id: 'in-progress',
          label: 'Yapılıyor',
          color: 'warning',
        },
        done: { id: 'done', label: 'Tamamlandı', color: 'success' },
      },

      // Temel görev yapısı
      createTask: (data) => ({
        id: uuidv4(),
        title: '',
        description: '',
        status: 'todo',
        priority: 'low',
        tags: [],
        subtasks: [],
        schedule: null,
        createdAt: new Date().toISOString(),
        completedAt: null,
        ...data,
      }),

      // CRUD işlemleri
      addTask: (taskData) =>
        set((state) => ({
          tasks: [...state.tasks, get().createTask(taskData)],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task,
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      // Görev yönetimi
      moveTask: (taskId, newStatus) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (task) {
          get().updateTask(taskId, { status: newStatus });
        }
      },

      toggleTaskCompletion: (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (task) {
          const newStatus = task.status === 'done' ? 'todo' : 'done';
          get().updateTask(taskId, {
            status: newStatus,
            subtasks: task.subtasks?.map((st) => ({
              ...st,
              completed: newStatus === 'done',
            })),
          });
        }
      },

      // Görev filtreleme
      getFilteredTasks: (filters = {}) => {
        let filteredTasks = [...get().tasks];

        // Durum filtresi
        if (filters.status) {
          filteredTasks = filteredTasks.filter(
            (task) => task.status === filters.status,
          );
        }

        // Tarih filtresi
        if (filters.date) {
          const targetDate = new Date(filters.date);
          targetDate.setHours(0, 0, 0, 0);

          filteredTasks = filteredTasks.filter((task) => {
            if (!task.schedule) return false;

            // Tek seferlik görevler için
            if (task.schedule.type === 'once') {
              const taskDate = new Date(task.schedule.date);
              taskDate.setHours(0, 0, 0, 0);
              return taskDate.getTime() === targetDate.getTime();
            }

            // Tekrarlı görevler için
            const startDate = new Date(task.schedule.startDate);
            startDate.setHours(0, 0, 0, 0);

            const endDate = task.schedule.endDate
              ? new Date(task.schedule.endDate)
              : null;
            if (endDate) endDate.setHours(0, 0, 0, 0);

            // Tarih aralığı kontrolü
            const isInRange =
              targetDate >= startDate && (!endDate || targetDate <= endDate);
            if (!isInRange) return false;

            // Görev tipine göre kontroller
            switch (task.schedule.type) {
              case 'daily':
                return true;
              case 'weekly':
                const taskDay = targetDate.getDay();
                return task.schedule.weekDays?.includes(taskDay);
              case 'monthly':
                return targetDate.getDate() === startDate.getDate();
              default:
                return false;
            }
          });
        }

        // Öncelik filtresi
        if (filters.priority) {
          filteredTasks = filteredTasks.filter(
            (task) => task.priority === filters.priority,
          );
        }

        // Etiket filtresi
        if (filters.tags?.length) {
          filteredTasks = filteredTasks.filter((task) =>
            filters.tags.some((tagId) => task.tags.includes(tagId)),
          );
        }

        // Arama filtresi
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredTasks = filteredTasks.filter(
            (task) =>
              task.title.toLowerCase().includes(searchLower) ||
              task.description.toLowerCase().includes(searchLower),
          );
        }

        return filteredTasks;
      },

      // Etiket yönetimi
      updateTags: (newTags) =>
        set((state) => ({
          tags: newTags,
          tasks: state.tasks.map((task) => ({
            ...task,
            tags: task.tags.filter((tagId) =>
              newTags.some((t) => t.id === tagId),
            ),
          })),
        })),
    }),
    {
      name: 'task-store',
      version: 1,
    },
  ),
);

export default useTaskStore;
