import { useState } from 'react';

const SubtaskManager = ({ subtasks = [], onSubtasksChange }) => {
  const [newSubtask, setNewSubtask] = useState('');
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [editText, setEditText] = useState('');

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (newSubtask.trim()) {
      onSubtasksChange([
        ...subtasks,
        {
          id: Date.now().toString(),
          title: newSubtask,
          completed: false,
        },
      ]);
      setNewSubtask('');
    }
  };

  const handleToggleSubtask = (subtaskId) => {
    onSubtasksChange(
      subtasks.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st,
      ),
    );
  };

  const handleDeleteSubtask = (subtaskId) => {
    if (confirm('Bu alt görevi silmek istediğinize emin misiniz?')) {
      onSubtasksChange(subtasks.filter((st) => st.id !== subtaskId));
    }
  };

  const startEditing = (subtask) => {
    setEditingSubtask(subtask.id);
    setEditText(subtask.title);
  };

  const handleUpdateSubtask = (subtaskId) => {
    if (editText.trim()) {
      onSubtasksChange(
        subtasks.map((st) =>
          st.id === subtaskId ? { ...st, title: editText.trim() } : st,
        ),
      );
    }
    setEditingSubtask(null);
    setEditText('');
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          placeholder="Alt görev ekle..."
          className="input input-bordered input-sm flex-1"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddSubtask(e);
            }
          }}
        />
        <button
          type="button"
          onClick={handleAddSubtask}
          className="btn btn-sm btn-ghost"
        >
          +
        </button>
      </div>

      <div className="space-y-1">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className={`flex items-center justify-between bg-base-200/50 p-2 rounded transition-all ${
              subtask.completed ? 'opacity-60' : ''
            }`}
          >
            {editingSubtask === subtask.id ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="input input-bordered input-sm flex-1"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateSubtask(subtask.id);
                    }
                  }}
                  onBlur={() => handleUpdateSubtask(subtask.id)}
                />
              </div>
            ) : (
              <>
                <label className="flex items-center gap-2 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => handleToggleSubtask(subtask.id)}
                    className={`checkbox checkbox-sm ${
                      subtask.completed
                        ? 'checkbox-success'
                        : 'checkbox-primary'
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      subtask.completed ? 'line-through opacity-70' : ''
                    }`}
                  >
                    {subtask.title}
                  </span>
                </label>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEditing(subtask)}
                    className="btn btn-ghost btn-xs"
                    title="Düzenle"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    className="btn btn-ghost btn-xs text-error"
                    title="Sil"
                  >
                    🗑️
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubtaskManager;
