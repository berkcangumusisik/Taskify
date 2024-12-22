import { useState } from 'react';
import useTaskStore from '../store/taskStore';

const TaskSettings = () => {
  const { tags, addTag, updateTag, deleteTag, settings, updateSettings } =
    useTaskStore();
  const [activeTab, setActiveTab] = useState('tags');
  const [newTag, setNewTag] = useState({ label: '', color: '#3B82F6' });

  const handleAddTag = () => {
    if (newTag.label.trim()) {
      addTag(newTag);
      setNewTag({ label: '', color: '#3B82F6' });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <button
          className={`btn ${
            activeTab === 'tags' ? 'btn-primary' : 'btn-ghost'
          }`}
          onClick={() => setActiveTab('tags')}
        >
          Etiketler
        </button>
        <button
          className={`btn ${
            activeTab === 'views' ? 'btn-primary' : 'btn-ghost'
          }`}
          onClick={() => setActiveTab('views')}
        >
          Görünüm
        </button>
        <button
          className={`btn ${
            activeTab === 'backup' ? 'btn-primary' : 'btn-ghost'
          }`}
          onClick={() => setActiveTab('backup')}
        >
          Yedekleme
        </button>
      </div>

      {activeTab === 'tags' && (
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title">Etiket Yönetimi</h3>

            {/* Etiket Ekleme */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Yeni Etiket</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag.label}
                  onChange={(e) =>
                    setNewTag({ ...newTag, label: e.target.value })
                  }
                  placeholder="Etiket adı..."
                  className="input input-bordered flex-1"
                />
                <input
                  type="color"
                  value={newTag.color}
                  onChange={(e) =>
                    setNewTag({ ...newTag, color: e.target.value })
                  }
                  className="w-14 h-10 px-1 rounded cursor-pointer"
                />
                <button className="btn btn-primary" onClick={handleAddTag}>
                  Ekle
                </button>
              </div>
            </div>

            {/* Etiket Listesi */}
            <div className="space-y-2 mt-4">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between bg-base-100 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span>{tag.label}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => {
                        const newColor = prompt('Yeni renk:', tag.color);
                        if (newColor) {
                          updateTag(tag.id, { color: newColor });
                        }
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-ghost text-error"
                      onClick={() => {
                        if (
                          confirm(
                            'Bu etiketi silmek istediğinize emin misiniz?',
                          )
                        ) {
                          deleteTag(tag.id);
                        }
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ... diğer tab içerikleri ... */}
    </div>
  );
};

export default TaskSettings;
