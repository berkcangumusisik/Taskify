import { useState } from 'react';
import useTaskStore from '../store/taskStore';
import ReactMarkdown from 'react-markdown';
import SubtaskManager from './SubtaskManager';
import TimeScheduler from './TimeScheduler';

const EditTaskModal = ({ task }) => {
  const { updateTask } = useTaskStore();
  const [taskData, setTaskData] = useState(task);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateTask(task.id, taskData);
    const modal = document.getElementById('edit-task-modal');
    modal.close();
  };

  return (
    <dialog id="edit-task-modal" className="modal">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Görevi Düzenle</h3>

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
              className="input input-bordered"
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
                value={taskData.description || ''}
                onChange={(e) =>
                  setTaskData({ ...taskData, description: e.target.value })
                }
                className="textarea textarea-bordered h-[200px]"
                placeholder="Markdown desteklenir"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Durum</span>
              </label>
              <select
                value={taskData.status}
                onChange={(e) =>
                  setTaskData({ ...taskData, status: e.target.value })
                }
                className="select select-bordered"
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
                className="select select-bordered"
              >
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
              </select>
            </div>
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
            onClick={() => document.getElementById('edit-task-modal').close()}
          >
            İptal
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Kaydet
          </button>
        </div>
      </div>

      <div
        className="modal-backdrop"
        onClick={() => document.getElementById('edit-task-modal').close()}
      >
        <button className="cursor-default">close</button>
      </div>
    </dialog>
  );
};

export default EditTaskModal;
