import { useState } from 'react';
import useTaskStore from '../store/taskStore';

const TagManager = () => {
  const { tags, updateTags } = useTaskStore();
  const [newTag, setNewTag] = useState({ label: '', color: '#3B82F6' });
  const [editingTag, setEditingTag] = useState(null);

  const handleAddTag = () => {
    if (!newTag.label.trim()) return;

    const updatedTags = [
      ...tags,
      {
        id: newTag.label.toLowerCase().replace(/\s+/g, '-'),
        label: newTag.label,
        color: newTag.color,
      },
    ];

    updateTags(updatedTags);
    setNewTag({ label: '', color: '#3B82F6' });
  };

  const handleUpdateTag = () => {
    if (!editingTag || !editingTag.label.trim()) return;

    const updatedTags = tags.map((tag) =>
      tag.id === editingTag.id ? editingTag : tag,
    );

    updateTags(updatedTags);
    setEditingTag(null);
  };

  const handleDeleteTag = (tagId) => {
    if (window.confirm('Bu etiketi silmek istediğinize emin misiniz?')) {
      const updatedTags = tags.filter((tag) => tag.id !== tagId);
      updateTags(updatedTags);
    }
  };

  return (
    <dialog id="tag-manager-modal" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Etiket Yönetimi</h3>

        {/* Yeni Etiket Ekleme */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Yeni Etiket</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Etiket adı..."
              className="input input-bordered flex-1"
              value={newTag.label}
              onChange={(e) => setNewTag({ ...newTag, label: e.target.value })}
            />
            <input
              type="color"
              className="input input-bordered w-20"
              value={newTag.color}
              onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
            />
            <button
              className="btn btn-primary"
              onClick={handleAddTag}
              disabled={!newTag.label.trim()}
            >
              Ekle
            </button>
          </div>
        </div>

        {/* Mevcut Etiketler */}
        <div className="space-y-2">
          <h4 className="font-medium">Mevcut Etiketler</h4>
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-2 p-2 bg-base-200 rounded-lg"
            >
              {editingTag?.id === tag.id ? (
                <>
                  <input
                    type="text"
                    className="input input-bordered input-sm flex-1"
                    value={editingTag.label}
                    onChange={(e) =>
                      setEditingTag({ ...editingTag, label: e.target.value })
                    }
                  />
                  <input
                    type="color"
                    className="input input-bordered input-sm w-16"
                    value={editingTag.color}
                    onChange={(e) =>
                      setEditingTag({ ...editingTag, color: e.target.value })
                    }
                  />
                  <button
                    className="btn btn-success btn-sm"
                    onClick={handleUpdateTag}
                  >
                    ✓
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setEditingTag(null)}
                  >
                    ×
                  </button>
                </>
              ) : (
                <>
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="flex-1">{tag.label}</span>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => setEditingTag(tag)}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => handleDeleteTag(tag.id)}
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="modal-action">
          <button
            className="btn"
            onClick={() => document.getElementById('tag-manager-modal').close()}
          >
            Kapat
          </button>
        </div>
      </div>
      <div
        className="modal-backdrop"
        onClick={() => document.getElementById('tag-manager-modal').close()}
      >
        <button className="cursor-default">close</button>
      </div>
    </dialog>
  );
};

export default TagManager;
