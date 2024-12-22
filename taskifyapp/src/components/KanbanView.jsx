import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useTaskStore from '../store/taskStore';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';

const KanbanView = () => {
  const { tasks, updateTask, deleteTask, statuses } = useTaskStore();
  const [targetColumn, setTargetColumn] = useState('todo');
  const [selectedTask, setSelectedTask] = useState(null);

  const columns = [
    { id: 'todo', title: 'Yapılacak', color: 'bg-primary/10' },
    { id: 'in-progress', title: 'Yapılıyor', color: 'bg-warning/10' },
    { id: 'done', title: 'Tamamlandı', color: 'bg-success/10' },
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    )
      return;

    const task = tasks.find((t) => t.id === draggableId);
    if (!task) return;

    updateTask(task.id, { ...task, status: destination.droppableId });
  };

  const handleDeleteTask = (taskId) => {
    if (confirm('Bu görevi silmek istediğinize emin misiniz?')) {
      deleteTask(taskId);
    }
  };

  return (
    <div className="p-2 md:p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kanban Tahtası</h1>
          <p className="text-base-content/60 text-sm">
            Görevleri sürükleyerek durumlarını güncelleyebilirsiniz
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setTargetColumn('todo');
            document.getElementById('add-task-modal').showModal();
          }}
        >
          + Yeni Görev
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col h-full">
              {/* Sütun Başlığı */}
              <div className={`rounded-t-lg p-3 ${column.color}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold">
                    <span>{column.title}</span>
                    <span className="badge badge-sm">
                      {getTasksByStatus(column.id).length}
                    </span>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm btn-square"
                    onClick={() => {
                      setTargetColumn(column.id);
                      document.getElementById('add-task-modal').showModal();
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Görevler Alanı */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2 rounded-b-lg bg-base-200/50 min-h-[70vh] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-base-200' : ''
                    }`}
                  >
                    <div className="space-y-2">
                      {getTasksByStatus(column.id).map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`transition-all duration-200 ${
                                snapshot.isDragging
                                  ? 'rotate-2 scale-105 shadow-xl'
                                  : ''
                              }`}
                            >
                              <div className="bg-base-100 rounded-lg shadow-md p-3 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-medium flex-1">
                                    {task.title}
                                  </h3>
                                  <div className="flex items-center gap-1">
                                    {/* Düzenle Butonu */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTask(task);
                                        document
                                          .getElementById('edit-task-modal')
                                          .showModal();
                                      }}
                                      className="btn btn-ghost btn-xs"
                                      title="Düzenle"
                                    >
                                      ✏️
                                    </button>
                                    {/* Sil Butonu */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTask(task.id);
                                      }}
                                      className="btn btn-ghost btn-xs text-error"
                                      title="Sil"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>

                                {/* Görev Detayları */}
                                {task.description && (
                                  <p className="mt-2 text-sm text-base-content/70 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}

                                {/* Alt Bilgiler */}
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  {/* Öncelik */}
                                  {task.priority && (
                                    <span
                                      className={`badge badge-sm ${
                                        task.priority === 'high'
                                          ? 'badge-error'
                                          : task.priority === 'medium'
                                          ? 'badge-warning'
                                          : 'badge-success'
                                      }`}
                                    >
                                      {task.priority === 'high'
                                        ? 'Yüksek'
                                        : task.priority === 'medium'
                                        ? 'Orta'
                                        : 'Düşük'}
                                    </span>
                                  )}

                                  {/* Alt Görevler */}
                                  {task.subtasks?.length > 0 && (
                                    <span className="badge badge-sm badge-ghost">
                                      {
                                        task.subtasks.filter(
                                          (st) => st.completed,
                                        ).length
                                      }
                                      /{task.subtasks.length}
                                    </span>
                                  )}

                                  {/* Zamanlama */}
                                  {task.schedule?.startTime && (
                                    <span className="text-xs text-base-content/60">
                                      ⏰ {task.schedule.startTime}
                                      {task.schedule.endTime &&
                                        ` - ${task.schedule.endTime}`}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <AddTaskModal initialStatus={targetColumn} />
      {selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default KanbanView;
