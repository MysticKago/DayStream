import React, { useState, useEffect } from 'react';
import { Task, TaskCategory } from '../types';
import { X, Clock, Calendar as CalendarIcon, Type, AlignLeft, Repeat, ChevronDown } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: (Omit<Task, 'id' | 'isCompleted'> & { id?: string }) | (Omit<Task, 'id' | 'isCompleted'>)[]) => void;
  initialData?: Task | null;
  defaultDate: string;
}

type RecurrenceType = 'daily' | 'weekly' | 'custom';

const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSave, initialData, defaultDate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [category, setCategory] = useState<TaskCategory>(TaskCategory.WORK);

  // Recurrence State
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('daily');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedDays, setSelectedDays] = useState<number[]>([]); // 0 = Sun, 1 = Mon...

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setDate(initialData.date || defaultDate);
      setStartTime(initialData.startTime);
      setDurationMinutes(initialData.durationMinutes);
      setCategory(initialData.category);
      // Reset recurrence when editing existing task for now
      setIsRecurring(false);
      setSelectedDays([]);
    } else {
      setTitle('');
      setDescription('');
      setDate(defaultDate);
      setStartTime('09:00');
      setDurationMinutes(60);
      setCategory(TaskCategory.WORK);
      setIsRecurring(false);
      
      // Default selected day to current day of week
      const d = new Date(defaultDate);
      setSelectedDays([d.getDay()]);
    }
  }, [initialData, isOpen, defaultDate]);

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex) 
        : [...prev, dayIndex]
    );
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const baseTask = {
      title,
      description,
      startTime,
      durationMinutes: Number(durationMinutes),
      category
    };

    if (isRecurring && !initialData) {
      // Logic for creating multiple tasks
      const tasksToCreate: Omit<Task, 'id' | 'isCompleted'>[] = [];
      const start = new Date(date + 'T00:00:00'); // Ensure local time parsing
      const end = new Date(recurrenceEndDate + 'T00:00:00');
      
      let current = new Date(start);

      // Sanity check to prevent infinite loops or massive creation
      const maxTasks = 365; 
      let count = 0;

      while (current <= end && count < maxTasks) {
        const currentDay = current.getDay();
        let shouldAdd = false;

        if (recurrenceType === 'daily') {
          shouldAdd = true;
        } else if (recurrenceType === 'weekly') {
          // Add if same day of week as start date
          if (currentDay === start.getDay()) shouldAdd = true;
        } else if (recurrenceType === 'custom') {
          if (selectedDays.includes(currentDay)) shouldAdd = true;
        }

        if (shouldAdd) {
            // Format YYYY-MM-DD manually to avoid UTC shifts
            const year = current.getFullYear();
            const month = String(current.getMonth() + 1).padStart(2, '0');
            const day = String(current.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            tasksToCreate.push({
                ...baseTask,
                date: dateStr
            });
            count++;
        }

        // Increment day
        current.setDate(current.getDate() + 1);
      }
      
      if (tasksToCreate.length > 0) {
        onSave(tasksToCreate);
      }
    } else {
      // Single task logic
      onSave({
        id: initialData?.id,
        date,
        ...baseTask
      });
    }
    
    onClose();
  };

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
      <div className="bg-paper-card dark:bg-grok-card rounded-2xl w-full max-w-md relative border border-paper-border dark:border-grok-border shadow-2xl my-auto">
        <div className="flex justify-between items-center p-6 border-b border-paper-border dark:border-grok-border">
          <h2 className="text-lg font-bold text-paper-text dark:text-grok-text font-mono uppercase tracking-tight">
            {initialData ? 'Edit Task' : 'New Task'}
          </h2>
          <button 
            onClick={onClose}
            className="text-paper-muted dark:text-grok-muted hover:text-paper-text dark:hover:text-grok-text p-2 rounded-lg hover:bg-paper-bg dark:hover:bg-grok-bg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-paper-muted dark:text-grok-muted uppercase tracking-wider mb-1.5 block">Title</label>
                <div className="relative">
                    <div className="absolute left-3 top-3 text-paper-muted dark:text-grok-muted">
                        <Type size={16} />
                    </div>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-paper-bg dark:bg-grok-bg border border-paper-border dark:border-grok-border rounded-lg focus:border-zinc-500 dark:focus:border-white outline-none transition-colors font-medium text-paper-text dark:text-grok-text placeholder:text-paper-muted dark:placeholder:text-grok-muted"
                        placeholder="What needs to be done?"
                    />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-paper-muted dark:text-grok-muted uppercase tracking-wider mb-1.5 block">Date</label>
                    <div className="relative">
                        <div className="absolute left-3 top-2.5 text-paper-muted dark:text-grok-muted">
                            <CalendarIcon size={16} />
                        </div>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 bg-paper-bg dark:bg-grok-bg border border-paper-border dark:border-grok-border rounded-lg focus:border-zinc-500 dark:focus:border-white outline-none text-sm text-paper-text dark:text-grok-text dark:[color-scheme:dark]"
                        />
                    </div>
                  </div>
                  <div>
                     <label className="text-xs font-bold text-paper-muted dark:text-grok-muted uppercase tracking-wider mb-1.5 block">Start Time</label>
                     <div className="relative">
                        <div className="absolute left-3 top-2.5 text-paper-muted dark:text-grok-muted">
                            <Clock size={16} />
                        </div>
                        <input
                            type="time"
                            required
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 bg-paper-bg dark:bg-grok-bg border border-paper-border dark:border-grok-border rounded-lg focus:border-zinc-500 dark:focus:border-white outline-none text-sm text-paper-text dark:text-grok-text dark:[color-scheme:dark]"
                        />
                     </div>
                  </div>
              </div>

              {/* Recurrence Options - Only for new tasks */}
              {!initialData && (
                <div className="p-4 bg-paper-bg dark:bg-grok-bg rounded-xl border border-paper-border dark:border-grok-border">
                    <div className="flex items-center justify-between mb-3">
                         <div className="flex items-center gap-2">
                            <Repeat size={16} className="text-paper-muted dark:text-grok-muted" />
                            <span className="text-sm font-bold text-paper-text dark:text-grok-text">Repeat Task</span>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="sr-only peer" />
                            <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900 dark:peer-checked:bg-white dark:peer-checked:after:bg-black"></div>
                        </label>
                    </div>

                    {isRecurring && (
                        <div className="space-y-4 animate-fade-in pt-2 border-t border-paper-border dark:border-zinc-700/50">
                            <div>
                                <label className="text-xs font-bold text-paper-muted dark:text-grok-muted uppercase tracking-wider mb-2 block">Frequency</label>
                                <div className="flex rounded-lg overflow-hidden border border-paper-border dark:border-grok-border">
                                    {(['daily', 'weekly', 'custom'] as RecurrenceType[]).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setRecurrenceType(type)}
                                            className={`flex-1 py-1.5 text-xs font-medium capitalize transition-colors ${recurrenceType === type ? 'bg-zinc-900 dark:bg-white text-white dark:text-black' : 'bg-transparent text-paper-muted dark:text-grok-muted hover:bg-black/5 dark:hover:bg-white/10'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {recurrenceType === 'custom' && (
                                <div>
                                    <label className="text-xs font-bold text-paper-muted dark:text-grok-muted uppercase tracking-wider mb-2 block">Repeat On</label>
                                    <div className="flex justify-between gap-1">
                                        {daysOfWeek.map((day, idx) => {
                                            const isSelected = selectedDays.includes(idx);
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => toggleDay(idx)}
                                                    className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all border ${
                                                        isSelected 
                                                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white' 
                                                        : 'text-paper-muted dark:text-grok-muted border-paper-border dark:border-grok-border hover:border-zinc-400 dark:hover:border-zinc-500'
                                                    }`}
                                                >
                                                    {day}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-paper-muted dark:text-grok-muted uppercase tracking-wider mb-1.5 block">Repeat Until</label>
                                <input
                                    type="date"
                                    required={isRecurring}
                                    value={recurrenceEndDate}
                                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                                    min={date}
                                    className="w-full px-3 py-2 bg-paper-card dark:bg-zinc-800/50 border border-paper-border dark:border-grok-border rounded-lg focus:border-zinc-500 dark:focus:border-white outline-none text-sm text-paper-text dark:text-grok-text dark:[color-scheme:dark]"
                                />
                            </div>
                        </div>
                    )}
                </div>
              )}

              {/* Duration Slider */}
              <div>
                <div className="flex justify-between mb-1.5">
                    <label className="text-xs font-bold text-paper-muted dark:text-grok-muted uppercase tracking-wider">Duration</label>
                    <span className="text-xs font-mono font-bold text-paper-text dark:text-grok-text">{durationMinutes} min</span>
                </div>
                <input
                    type="range"
                    min="15"
                    max="240"
                    step="15"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white"
                />
              </div>

            {/* Category */}
            <div>
                <label className="text-xs font-bold text-paper-muted dark:text-grok-muted uppercase tracking-wider mb-2 block">
                    Category
                </label>
                <div className="flex flex-wrap gap-2">
                {Object.values(TaskCategory).map((cat) => (
                    <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all border ${
                        category === cat
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white'
                        : 'bg-transparent text-paper-muted dark:text-grok-muted border-paper-border dark:border-grok-border hover:border-zinc-400 dark:hover:border-zinc-600'
                    }`}
                    >
                    {cat}
                    </button>
                ))}
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="text-xs font-bold text-paper-muted dark:text-grok-muted uppercase tracking-wider mb-1.5 block">Description</label>
                <div className="relative">
                    <div className="absolute left-3 top-3 text-paper-muted dark:text-grok-muted">
                        <AlignLeft size={16} />
                    </div>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full pl-10 pr-4 py-2 bg-paper-bg dark:bg-grok-bg border border-paper-border dark:border-grok-border rounded-lg focus:border-zinc-500 dark:focus:border-white outline-none resize-none text-sm text-paper-text dark:text-grok-text placeholder:text-paper-muted dark:placeholder:text-grok-muted"
                        placeholder="Details..."
                    />
                </div>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-paper-muted dark:text-grok-muted hover:bg-paper-bg dark:hover:bg-grok-bg rounded-lg transition-colors font-bold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 transition-all font-bold text-sm shadow-sm"
            >
              {initialData ? 'Update' : (isRecurring ? 'Create Series' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;