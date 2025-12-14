import React, { useMemo } from 'react';
import { Task, TaskCategory } from '../types';
import { Clock, Check, Circle, Trash2, Edit2 } from 'lucide-react';

interface TimelineProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

// Minimalist category indicators
const getCategoryColor = (category: TaskCategory) => {
  switch (category) {
    case TaskCategory.WORK: return 'text-blue-500 dark:text-blue-400';
    case TaskCategory.PERSONAL: return 'text-purple-500 dark:text-purple-400';
    case TaskCategory.HEALTH: return 'text-emerald-500 dark:text-emerald-400';
    case TaskCategory.LEARNING: return 'text-amber-500 dark:text-amber-400';
    default: return 'text-paper-muted dark:text-grok-muted';
  }
};

const parseTime = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const Timeline: React.FC<TimelineProps> = ({ tasks, onToggleComplete, onEdit, onDelete }) => {
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
  }, [tasks]);

  if (sortedTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-paper-muted dark:text-grok-muted">
        <div className="w-20 h-20 bg-paper-card dark:bg-grok-card rounded-full flex items-center justify-center mb-6 shadow-sm border border-paper-border dark:border-grok-border">
            <Clock size={40} className="opacity-50" strokeWidth={1.5} />
        </div>
        <p className="text-xl font-medium text-paper-text dark:text-grok-text">No tasks scheduled</p>
        <p className="text-sm mt-2">Time to plan your next move.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-4 md:pl-8 py-4 space-y-8">
      {/* Continuous Line */}
      <div className="absolute left-[23px] md:left-[39px] top-6 bottom-6 w-px bg-paper-border dark:bg-grok-border" />

      {sortedTasks.map((task) => (
        <div key={task.id} className="relative group grid grid-cols-[50px_1fr] md:grid-cols-[70px_1fr] gap-4 md:gap-8 items-start">
            
          {/* Time Column */}
          <div className="text-right pt-1 relative">
             <span className="text-xs font-mono font-bold text-paper-muted dark:text-grok-muted">{task.startTime}</span>
             {/* Timeline Node */}
             <div className={`absolute -right-[25px] md:-right-[36px] top-1.5 w-3 h-3 rounded-full border-2 z-10 transition-colors duration-300 bg-paper-bg dark:bg-grok-bg
                ${task.isCompleted 
                    ? 'border-emerald-500 bg-emerald-500 dark:bg-emerald-500' 
                    : 'border-zinc-300 dark:border-zinc-600'}`} 
             />
          </div>

          {/* Task Card */}
          <div className={`
            relative p-5 rounded-lg border transition-all duration-200
            ${task.isCompleted 
                ? 'bg-paper-bg dark:bg-grok-bg border-paper-border dark:border-grok-border opacity-60' 
                : 'bg-paper-card dark:bg-grok-card border-paper-border dark:border-grok-border hover:border-zinc-300 dark:hover:border-zinc-600 shadow-sm'
            }
          `}>
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                 <div className="flex items-center gap-3 mb-1.5">
                    <h3 className={`font-medium text-base md:text-lg leading-tight ${task.isCompleted ? 'line-through text-paper-muted dark:text-grok-muted' : 'text-paper-text dark:text-grok-text'}`}>
                        {task.title}
                    </h3>
                    <span className={`text-[10px] font-mono uppercase tracking-wider ${getCategoryColor(task.category)}`}>
                        {task.category}
                    </span>
                 </div>

                 {task.description && (
                    <p className={`text-sm leading-relaxed mb-3 ${task.isCompleted ? 'text-paper-muted' : 'text-paper-muted dark:text-grok-muted'}`}>
                        {task.description}
                    </p>
                 )}
                 
                 <div className="flex items-center gap-2 text-xs text-paper-muted dark:text-grok-muted font-mono">
                    <Clock size={12} />
                    <span>{task.durationMinutes}m</span>
                 </div>
              </div>

              {/* Actions - Always visible on mobile, hover on desktop */}
              <div className="flex flex-col gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                 <button
                    onClick={() => onToggleComplete(task.id)}
                    className={`p-2 rounded-md transition-colors ${
                      task.isCompleted 
                        ? 'text-emerald-500 bg-emerald-500/10' 
                        : 'text-paper-muted dark:text-grok-muted hover:text-emerald-500 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10'
                    }`}
                  >
                    {task.isCompleted ? <Check size={16} /> : <Circle size={16} />}
                  </button>
                  <button
                    onClick={() => onEdit(task)}
                    className="p-2 text-paper-muted dark:text-grok-muted hover:text-blue-500 hover:bg-blue-500/10 dark:hover:bg-blue-500/10 rounded-md transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="p-2 text-paper-muted dark:text-grok-muted hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/10 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;