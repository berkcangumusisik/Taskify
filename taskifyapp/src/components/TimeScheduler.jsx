import { useState } from 'react';

const TimeScheduler = ({ schedule, onScheduleChange }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const scheduleTypes = [
    { id: 'none', label: 'Zamanlama Yok' },
    { id: 'once', label: 'Bir Kez' },
    { id: 'daily', label: 'Her Gün' },
    { id: 'weekly', label: 'Her Hafta' },
    { id: 'monthly', label: 'Her Ay' },
  ];

  const weekDays = [
    { id: 1, label: 'Pzt' },
    { id: 2, label: 'Sal' },
    { id: 3, label: 'Çar' },
    { id: 4, label: 'Per' },
    { id: 5, label: 'Cum' },
    { id: 6, label: 'Cmt' },
    { id: 0, label: 'Paz' },
  ];

  const handleTypeChange = (type) => {
    if (type === 'none') {
      onScheduleChange(null);
      setShowDatePicker(false);
    } else if (type === 'once') {
      setShowDatePicker(true);
      onScheduleChange({
        type,
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
      });
    } else {
      setShowDatePicker(true);
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      onScheduleChange({
        type,
        startDate: today.toISOString().split('T')[0],
        endDate: nextMonth.toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        weekDays: type === 'weekly' ? [today.getDay()] : [],
      });
    }
  };

  const toggleWeekDay = (dayId) => {
    if (!schedule?.weekDays) return;

    const newWeekDays = schedule.weekDays.includes(dayId)
      ? schedule.weekDays.filter((d) => d !== dayId)
      : [...schedule.weekDays, dayId].sort();

    onScheduleChange({
      ...schedule,
      weekDays: newWeekDays,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {scheduleTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            className={`btn btn-sm ${
              schedule?.type === type.id ? 'btn-primary' : 'btn-ghost'
            }`}
            onClick={() => handleTypeChange(type.id)}
          >
            {type.label}
          </button>
        ))}
      </div>

      {showDatePicker && schedule && (
        <div className="space-y-4">
          {schedule.type === 'once' ? (
            <>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Tarih</span>
                </label>
                <input
                  type="date"
                  value={schedule.date || ''}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) =>
                    onScheduleChange({
                      ...schedule,
                      date: e.target.value,
                    })
                  }
                  className="input input-bordered w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Başlangıç Saati</span>
                  </label>
                  <input
                    type="time"
                    value={schedule.startTime || ''}
                    onChange={(e) =>
                      onScheduleChange({
                        ...schedule,
                        startTime: e.target.value,
                        endTime:
                          e.target.value > (schedule.endTime || '')
                            ? e.target.value
                            : schedule.endTime,
                      })
                    }
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Bitiş Saati</span>
                  </label>
                  <input
                    type="time"
                    value={schedule.endTime || ''}
                    min={schedule.startTime}
                    onChange={(e) =>
                      onScheduleChange({
                        ...schedule,
                        endTime: e.target.value,
                      })
                    }
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Başlangıç Tarihi</span>
                    </label>
                    <input
                      type="date"
                      value={schedule.startDate || ''}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) =>
                        onScheduleChange({
                          ...schedule,
                          startDate: e.target.value,
                          endDate:
                            schedule.endDate &&
                            e.target.value > schedule.endDate
                              ? e.target.value
                              : schedule.endDate,
                        })
                      }
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Bitiş Tarihi</span>
                    </label>
                    <input
                      type="date"
                      value={schedule.endDate || ''}
                      min={
                        schedule.startDate ||
                        new Date().toISOString().split('T')[0]
                      }
                      onChange={(e) =>
                        onScheduleChange({
                          ...schedule,
                          endDate: e.target.value,
                        })
                      }
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Başlangıç Saati</span>
                    </label>
                    <input
                      type="time"
                      value={schedule.startTime || ''}
                      onChange={(e) =>
                        onScheduleChange({
                          ...schedule,
                          startTime: e.target.value,
                          endTime:
                            e.target.value > (schedule.endTime || '')
                              ? e.target.value
                              : schedule.endTime,
                        })
                      }
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Bitiş Saati</span>
                    </label>
                    <input
                      type="time"
                      value={schedule.endTime || ''}
                      min={schedule.startTime}
                      onChange={(e) =>
                        onScheduleChange({
                          ...schedule,
                          endTime: e.target.value,
                        })
                      }
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>
              </div>

              {schedule.type === 'weekly' && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Tekrar Günleri</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {weekDays.map((day) => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleWeekDay(day.id)}
                        className={`btn btn-xs ${
                          schedule.weekDays?.includes(day.id)
                            ? 'btn-primary'
                            : 'btn-ghost'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="text-sm opacity-70">
            {schedule.type === 'once' && (
              <>
                <span className="font-medium">Bir kez: </span>
                {schedule.date && new Date(schedule.date).toLocaleDateString()}
                {schedule.startTime && ` - ${schedule.startTime}`}
                {schedule.endTime && ` - ${schedule.endTime}`}
              </>
            )}
            {schedule.type === 'daily' && (
              <>
                <span className="font-medium">Her gün</span>
                <span className="block mt-1">
                  {schedule.startDate &&
                    `${new Date(schedule.startDate).toLocaleDateString()}'den`}
                  {schedule.endDate &&
                    ` ${new Date(
                      schedule.endDate,
                    ).toLocaleDateString()}'e kadar`}
                  {schedule.startTime && ` - ${schedule.startTime}`}
                  {schedule.endTime && ` - ${schedule.endTime}`}
                </span>
              </>
            )}
            {schedule.type === 'weekly' && (
              <>
                <span className="font-medium">Her hafta</span>
                {schedule.weekDays?.length > 0 && (
                  <span className="block mt-1">
                    {schedule.weekDays
                      .map((d) => weekDays.find((wd) => wd.id === d)?.label)
                      .join(', ')}
                    {' günleri'}
                  </span>
                )}
                <span className="block mt-1">
                  {schedule.startDate &&
                    `${new Date(schedule.startDate).toLocaleDateString()}'den`}
                  {schedule.endDate &&
                    ` ${new Date(
                      schedule.endDate,
                    ).toLocaleDateString()}'e kadar`}
                  {schedule.startTime && ` - ${schedule.startTime}`}
                  {schedule.endTime && ` - ${schedule.endTime}`}
                </span>
              </>
            )}
            {schedule.type === 'monthly' && (
              <>
                <span className="font-medium">Her ay</span>
                <span className="block mt-1">
                  {schedule.startDate &&
                    `${new Date(schedule.startDate).toLocaleDateString()}'den`}
                  {schedule.endDate &&
                    ` ${new Date(
                      schedule.endDate,
                    ).toLocaleDateString()}'e kadar`}
                  {schedule.startTime && ` - ${schedule.startTime}`}
                  {schedule.endTime && ` - ${schedule.endTime}`}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeScheduler;
