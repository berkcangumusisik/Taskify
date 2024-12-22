import React, { useState } from 'react';
import useTaskStore from '../store/taskStore';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';

const ListView = () => {
  const { tasks } = useTaskStore();
  const [filter, setFilter] = useState({
    status: 'all',
    priority: 'all',
    tag: 'all',
    search: '',
  });

  const filteredTasks = tasks.filter((task) => {
    if (filter.status !== 'all' && task.status !== filter.status) return false;
    if (filter.priority !== 'all' && task.priority !== filter.priority)
      return false;
    if (filter.tag !== 'all' && !task.tags?.includes(filter.tag)) return false;
    if (
      filter.search &&
      !task.title.toLowerCase().includes(filter.search.toLowerCase()) &&
      !task.description?.toLowerCase().includes(filter.search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Görevler</h2>
        <button
          className="btn btn-primary"
          onClick={() => document.getElementById('add-task-modal').showModal()}
        >
          + Yeni Görev
        </button>
      </div>

      <div className="bg-base-200 p-4 rounded-lg space-y-4">
        <div className="text-lg font-bold">Filtreler</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Ara..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="input input-bordered"
          />
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="select select-bordered"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="todo">Yapılacak</option>
            <option value="in-progress">Yapılıyor</option>
            <option value="done">Tamamlandı</option>
          </select>
          <select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            className="select select-bordered"
          >
            <option value="all">Tüm Öncelikler</option>
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <TaskCard key={task.id} task={task} isDraggable={false} />
        ))}
        {filteredTasks.length === 0 && (
          <div className="text-center py-8 text-base-content/50">
            Görev bulunamadı
          </div>
        )}
      </div>

      <AddTaskModal />
    </div>
  );
};

export default ListView;
