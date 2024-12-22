import { useState } from 'react';
import useTaskStore from '../store/taskStore';
import ReactMarkdown from 'react-markdown';
import SubtaskManager from './SubtaskManager';
import TimeScheduler from './TimeScheduler';

const AddTaskModal = ({ initialStatus = 'todo' }) => {
  const { addTask, tags } = useTaskStore();
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'low',
    status: initialStatus,
    tags: [],
    subtasks: [],
    schedule: null,
  });
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskData.title.trim()) return;

    addTask(taskData);
    setTaskData({
      title: '',
      description: '',
      priority: 'low',
      status: initialStatus,
      tags: [],
      subtasks: [],
      schedule: null,
    });
    const modal = document.getElementById('add-task-modal');
    modal.close();
  };

  const toggleTag = (tagId) => {
    setTaskData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  return (
    <dialog id="add-task-modal" className="modal">
      <div className="modal-box max-w-xl">
        <h3 className="font-bold text-lg mb-4">Yeni Görev Ekle</h3>

        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Başlık</span>
            </label>
            <input
              type="text"
              value={taskData.title}
              onChange={(e) =>
                setTaskData({ ...taskData, title: e.target.value })
              }
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Açıklama</span>
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Düzenle' : 'Önizle'}
              </button>
            </label>
            {showPreview ? (
              <div className="prose max-w-none bg-base-200 p-4 rounded-lg min-h-[200px]">
                <ReactMarkdown>{taskData.description}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                value={taskData.description}
                onChange={(e) =>
                  setTaskData({ ...taskData, description: e.target.value })
                }
                className="textarea textarea-bordered h-[200px] w-full"
                placeholder="Markdown desteklenir"
              />
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Durum</span>
            </label>
            <select
              value={taskData.status}
              onChange={(e) =>
                setTaskData({ ...taskData, status: e.target.value })
              }
              className="select select-bordered w-full"
            >
              <option value="todo">Yapılacak</option>
              <option value="in-progress">Yapılıyor</option>
              <option value="done">Tamamlandı</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Öncelik</span>
            </label>
            <select
              value={taskData.priority}
              onChange={(e) =>
                setTaskData({ ...taskData, priority: e.target.value })
              }
              className="select select-bordered w-full"
            >
              <option value="low">Düşük</option>
              <option value="medium">Orta</option>
              <option value="high">Yüksek</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Etiketler</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className={`cursor-pointer flex items-center gap-2 p-2 rounded-lg border ${
                    taskData.tags.includes(tag.id)
                      ? 'bg-primary text-primary-content'
                      : 'bg-base-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={taskData.tags.includes(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                  />
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Alt Görevler</span>
            </label>
            <SubtaskManager
              subtasks={taskData.subtasks}
              onSubtasksChange={(subtasks) =>
                setTaskData({ ...taskData, subtasks })
              }
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Zamanlama</span>
            </label>
            <TimeScheduler
              schedule={taskData.schedule}
              onScheduleChange={(schedule) =>
                setTaskData({ ...taskData, schedule })
              }
            />
          </div>
        </div>

        <div className="modal-action">
          <button
            className="btn"
            onClick={() => document.getElementById('add-task-modal').close()}
          >
            İptal
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Ekle
          </button>
        </div>
      </div>

      <div
        className="modal-backdrop"
        onClick={() => document.getElementById('add-task-modal').close()}
      >
        <button className="cursor-default">close</button>
      </div>
    </dialog>
  );
};

export default AddTaskModal;
