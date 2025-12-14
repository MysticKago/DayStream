import React from 'react';
import { Task, TaskCategory } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Grok-style markers
const getCategoryColor = (category: TaskCategory) => {
    switch (category) {
      case TaskCategory.WORK: return 'bg-blue-500';
      case TaskCategory.PERSONAL: return 'bg-purple-500';
      case TaskCategory.HEALTH: return 'bg-emerald-500';
      case TaskCategory.LEARNING: return 'bg-amber-500';
      default: return 'bg-zinc-500';
    }
  };

export const WeekView: React.FC<CalendarViewProps> = ({ tasks, currentDate, onDateSelect, onEdit }) => {
  const startOfWeek = new Date(currentDate);
  const currentDay = startOfWeek.getDay(); 
  const distanceToMonday = (currentDay + 6) % 7; 
  startOfWeek.setDate(startOfWeek.getDate() - distanceToMonday);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 pb-12">
      {weekDays.map((day) => {
        const dateStr = formatDate(day);
        const dayTasks = tasks.filter(t => t.date === dateStr);
        const isToday = formatDate(new Date()) === dateStr;

        return (
          <div key={dateStr} className="md:col-span-1 min-h-[160px] flex flex-col group">
             <div 
                onClick={() => onDateSelect(day)}
                className={`p-3 rounded-t-lg text-center cursor-pointer transition-colors border-x border-t border-paper-border dark:border-grok-border
                    ${isToday 
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-black' 
                        : 'bg-paper-card dark:bg-grok-card text-paper-muted dark:text-grok-muted hover:bg-paper-bg dark:hover:bg-grok-bg'}
                `}
             >
                 <div className="text-[10px] uppercase font-bold opacity-70 mb-0.5 tracking-wider">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                 <div className="text-lg font-bold font-mono">{day.getDate()}</div>
             </div>
             
             <div className="bg-paper-card dark:bg-grok-card border border-paper-border dark:border-grok-border rounded-b-lg flex-1 p-2 space-y-1.5">
                 {dayTasks.sort((a,b) => a.startTime.localeCompare(b.startTime)).map(task => (
                     <div key={task.id} 
                        onClick={() => onEdit(task)}
                        className={`text-[10px] p-2 rounded border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-all ${task.isCompleted ? 'opacity-40' : 'bg-paper-bg dark:bg-grok-bg text-paper-text dark:text-grok-text'}`}
                     >
                        <div className="font-mono font-bold opacity-70 mb-0.5">{task.startTime}</div>
                        <div className="truncate font-medium">{task.title}</div>
                     </div>
                 ))}
                 {dayTasks.length === 0 && (
                     <div className="h-full flex items-center justify-center opacity-20">
                         <div className="w-1 h-1 bg-zinc-400 rounded-full"></div>
                     </div>
                 )}
             </div>
          </div>
        );
      })}
    </div>
  );
};

export const MonthView: React.FC<CalendarViewProps> = ({ tasks, currentDate, onDateSelect }) => {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return days;
  };

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = getDaysInMonth(currentDate);
  const startingPadding = (firstDayOfMonth + 6) % 7;

  const renderCalendarDays = () => {
    const cells = [];

    // Padding
    for (let i = 0; i < startingPadding; i++) {
      cells.push(<div key={`pad-${i}`} className="h-24 md:h-32 bg-paper-bg/50 dark:bg-grok-bg/50 border-b border-r border-paper-border dark:border-grok-border"></div>);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
        const dateStr = formatDate(date);
        const dayTasks = tasks.filter(t => t.date === dateStr);
        const isToday = formatDate(new Date()) === dateStr;

        cells.push(
            <div 
                key={d} 
                onClick={() => onDateSelect(date)}
                className={`relative h-24 md:h-32 border-b border-r border-paper-border dark:border-grok-border p-1 md:p-2 cursor-pointer hover:bg-paper-bg dark:hover:bg-grok-bg transition-colors bg-paper-card dark:bg-grok-card overflow-hidden`}
            >
                <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs md:text-sm font-bold w-6 h-6 flex items-center justify-center rounded
                        ${isToday 
                            ? 'bg-zinc-900 dark:bg-white text-white dark:text-black' 
                            : 'text-paper-muted dark:text-grok-muted'}`}>
                        {d}
                    </span>
                    {dayTasks.length > 0 && (
                        <span className="md:hidden text-[9px] font-mono bg-paper-bg dark:bg-grok-bg text-paper-text dark:text-grok-text px-1.5 rounded">{dayTasks.length}</span>
                    )}
                </div>
                
                <div className="hidden md:block space-y-1 overflow-y-auto max-h-[calc(100%-28px)] custom-scrollbar">
                    {dayTasks.slice(0, 3).map(task => (
                        <div key={task.id} className="flex items-center gap-1.5 px-1 py-0.5 rounded bg-paper-bg dark:bg-grok-bg border border-paper-border dark:border-grok-border">
                             <div className={`w-1 h-1 rounded-full ${getCategoryColor(task.category)} shrink-0`} />
                             <span className={`text-[10px] font-medium text-paper-text dark:text-grok-text truncate ${task.isCompleted ? 'line-through opacity-50' : ''}`}>
                                {task.title}
                             </span>
                        </div>
                    ))}
                    {dayTasks.length > 3 && (
                        <div className="text-[9px] text-paper-muted dark:text-grok-muted pl-1 font-mono">+ {dayTasks.length - 3} more</div>
                    )}
                </div>
            </div>
        );
    }
    return cells;
  };

  return (
    <div className="bg-paper-card dark:bg-grok-card rounded-lg border border-paper-border dark:border-grok-border overflow-hidden shadow-sm">
      <div className="grid grid-cols-7 bg-paper-bg dark:bg-grok-bg border-b border-paper-border dark:border-grok-border">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => (
            <div key={d} className="py-2 text-center text-[10px] font-bold text-paper-muted dark:text-grok-muted uppercase tracking-wider">
                {d}
            </div>
        ))}
      </div>
      <div className="grid grid-cols-7 bg-gray-200 dark:bg-grok-border gap-px border-b border-paper-border dark:border-grok-border">
        {renderCalendarDays()}
      </div>
    </div>
  );
};