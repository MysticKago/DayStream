import React, { useState, useEffect } from 'react';
import { Task, TaskCategory } from '../types';
import { X, Clock, Calendar as CalendarIcon, Type, AlignLeft } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'isCompleted'> & { id?: string }) => void;
  initialData?: Task | null;
  defaultDate: string;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSave, initialData, defaultDate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [category, setCategory] = useState<TaskCategory>(TaskCategory.WORK);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setDate(initialData.date || defaultDate);
      setStartTime(initialData.startTime);
      setDurationMinutes(initialData.durationMinutes);
      setCategory(initialData.category);
    } else {
      setTitle('');
      setDescription('');
      setDate(defaultDate);
      setStartTime('09:00');
      setDurationMinutes(60);
      setCategory(TaskCategory.WORK);
    }
  }, [initialData, isOpen, defaultDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id,
      title,
      description,
      date,
      startTime,
      durationMinutes: Number(durationMinutes),
      category
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-paper-card dark:bg-grok-card rounded-2xl w-full max-w-md overflow-hidden relative border border-paper-border dark:border-grok-border shadow-2xl">
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
              {initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;