import React from 'react';
import useTaskStore from '../store/taskStore';

const TaskFilters = ({ filters, setFilters }) => {
  const { tags } = useTaskStore();

  return (
    <div className="bg-base-200 p-4 rounded-lg space-y-4">
      <div className="text-lg font-bold">Filtreler</div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Ara..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="input input-bordered"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="select select-bordered"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="todo">Yapılacak</option>
          <option value="in-progress">Yapılıyor</option>
          <option value="done">Tamamlandı</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="select select-bordered"
        >
          <option value="all">Tüm Öncelikler</option>
          <option value="low">Düşük</option>
          <option value="medium">Orta</option>
          <option value="high">Yüksek</option>
        </select>
        <select
          value={filters.tag}
          onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
          className="select select-bordered"
        >
          <option value="all">Tüm Etiketler</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TaskFilters;
