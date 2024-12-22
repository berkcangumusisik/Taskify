import { useState, useRef } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import EditTaskModal from './EditTaskModal';
import useTaskStore from '../store/taskStore';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import SubtaskManager from './SubtaskManager';

const TaskCard = ({ task, index, isDraggable = false }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const { deleteTask, updateTask, tags } = useTaskStore();

  const priorityConfig = {
    high: {
      badge: 'badge-error',
      label: 'Yüksek',
      icon: '🔴',
      animation: 'animate-pulse',
    },
    medium: {
      badge: 'badge-warning',
      label: 'Orta',
      icon: '🟡',
      animation: '',
    },
    low: {
      badge: 'badge-success',
      label: 'Düşük',
      icon: '🟢',
      animation: '',
    },
  };

  const taskTags = tags.filter((tag) => task.tags?.includes(tag.id));

  const handleComplete = () => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    updateTask(task.id, {
      ...task,
      status: newStatus,
      subtasks:
        task.subtasks?.map((st) => ({
          ...st,
          completed: newStatus === 'done',
        })) || [],
    });

    if (newStatus === 'done') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#F59E0B'],
      });
    }
  };

  const handleDelete = () => {
    if (confirm('Bu görevi silmek istediğinize emin misiniz?')) {
      const card = cardRef.current;
      card.style.transform = 'translateX(100px) rotate(20deg)';
      card.style.opacity = '0';
      setTimeout(() => deleteTask(task.id), 300);
    }
  };

  const handleEdit = () => {
    const modal = document.getElementById('edit-task-modal');
    if (modal) modal.showModal();
  };

  const handleSubtasksChange = (newSubtasks) => {
    const allCompleted =
      newSubtasks.length > 0 && newSubtasks.every((st) => st.completed);
    updateTask(task.id, {
      ...task,
      subtasks: newSubtasks,
      status: allCompleted ? 'done' : task.status,
    });
  };

  const CardContent = () => (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card bg-base-100 shadow-lg transition-all duration-300 ${
        priorityConfig[task.priority || 'low'].animation
      }`}
    >
      <div className="card-body p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={task.status === 'done'}
              onChange={handleComplete}
              className={`checkbox checkbox-md mt-1 ${
                task.status === 'done' ? 'checkbox-success' : 'checkbox-primary'
              }`}
            />
            <div className="flex-1">
              <h3 className="card-title text-lg flex items-center gap-2">
                <span className={task.status === 'done' ? 'opacity-70' : ''}>
                  {priorityConfig[task.priority || 'low'].icon} {task.title}
                </span>
                {task.status === 'done' && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-success"
                  >
                    ✓
                  </motion.span>
                )}
              </h3>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="btn btn-ghost btn-sm btn-square"
              title="Görevi Düzenle"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-ghost btn-sm btn-square text-error"
              title="Görevi Sil"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {taskTags.map((tag) => (
            <span
              key={tag.id}
              className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.label}
            </span>
          ))}

          {task.schedule && (
            <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 bg-base-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {task.schedule.type === 'once' ? (
                  <>
                    {new Date(task.schedule.date).toLocaleDateString()}
                    {task.schedule.startTime && ` ${task.schedule.startTime}`}
                    {task.schedule.endTime && ` - ${task.schedule.endTime}`}
                  </>
                ) : (
                  <>
                    {task.schedule.type === 'daily' && 'Her gün'}
                    {task.schedule.type === 'weekly' && (
                      <>
                        Her hafta
                        {task.schedule.weekDays?.length > 0 &&
                          ` (${task.schedule.weekDays
                            .map(
                              (d) =>
                                [
                                  'Paz',
                                  'Pzt',
                                  'Sal',
                                  'Çar',
                                  'Per',
                                  'Cum',
                                  'Cmt',
                                ][d],
                            )
                            .join(', ')})`}
                      </>
                    )}
                    {task.schedule.type === 'monthly' && 'Her ay'}
                    {task.schedule.startDate &&
                      ` (${new Date(
                        task.schedule.startDate,
                      ).toLocaleDateString()}`}
                    {task.schedule.endDate &&
                      ` - ${new Date(
                        task.schedule.endDate,
                      ).toLocaleDateString()})`}
                    {task.schedule.startTime && ` ${task.schedule.startTime}`}
                    {task.schedule.endTime && ` - ${task.schedule.endTime}`}
                  </>
                )}
              </span>
            </span>
          )}

          {task.startTime && (
            <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 bg-base-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {task.startTime}
                {task.endTime && ` - ${task.endTime}`}
              </span>
            </span>
          )}
        </div>

        <div className="mt-2 space-y-2">
          {task.description && (
            <div
              className={`transition-all duration-300 overflow-hidden ${
                showDetails ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <div className="prose prose-sm max-w-none text-base-content/70 mb-4">
                <ReactMarkdown>{task.description}</ReactMarkdown>
              </div>
            </div>
          )}

          <div
            className={`transition-all duration-300 overflow-hidden ${
              showDetails ? 'max-h-[500px]' : 'max-h-0'
            }`}
          >
            <div className="pt-2">
              <SubtaskManager
                subtasks={task.subtasks || []}
                onSubtasksChange={handleSubtasksChange}
              />
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="btn btn-ghost btn-xs w-full hover:bg-base-200"
          >
            {showDetails ? (
              <>
                <span>Detayları Gizle</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </>
            ) : (
              <>
                <span>Detayları Göster</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      {isDraggable ? (
        <Draggable draggableId={task.id} index={index}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={`transition-transform duration-200 ${
                snapshot.isDragging ? 'z-50 shadow-xl' : ''
              }`}
              style={{
                ...provided.draggableProps.style,
                transform: snapshot.isDragging
                  ? provided.draggableProps.style?.transform
                  : 'none',
              }}
            >
              <CardContent />
            </div>
          )}
        </Draggable>
      ) : (
        <CardContent />
      )}
      <EditTaskModal task={task} />
    </>
  );
};

export default TaskCard;
