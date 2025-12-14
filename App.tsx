import React, { useState, useEffect } from 'react';
import { Task } from './types';
import Timeline from './components/Timeline';
import { WeekView, MonthView } from './components/CalendarViews';
import TaskFormModal from './components/TaskFormModal';
import { Plus, CalendarDays, BarChart2, ChevronLeft, ChevronRight, Layout, Calendar as CalendarIcon, Grid, Moon, Sun, Menu, X } from 'lucide-react';

// Utility for generating unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Fix date formatting to local YYYY-MM-DD
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type ViewMode = 'day' | 'week' | 'month';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('daystream-theme');
    // Default to dark if no preference
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Load View Mode
  useEffect(() => {
    const savedView = localStorage.getItem('daystream-viewmode');
    if (savedView) {
        setViewMode(savedView as ViewMode);
    }
  }, []);

  // Save View Mode
  useEffect(() => {
    localStorage.setItem('daystream-viewmode', viewMode);
  }, [viewMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('daystream-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('daystream-theme', 'light');
      }
      return newMode;
    });
  };

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('daystream-tasks');
    if (saved) {
      try {
        const parsedTasks: Task[] = JSON.parse(saved);
        const migratedTasks = parsedTasks.map(t => ({
          ...t,
          date: t.date || formatDate(new Date())
        }));
        setTasks(migratedTasks);
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('daystream-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (taskData: (Omit<Task, 'id' | 'isCompleted'> & { id?: string }) | (Omit<Task, 'id' | 'isCompleted'>)[]) => {
    
    if (Array.isArray(taskData)) {
      // Handle Group/Series Creation
      const seriesId = generateId();
      const newTasks: Task[] = taskData.map(t => ({
        ...t,
        id: generateId(),
        isCompleted: false,
        seriesId: seriesId
      }));
      setTasks(prev => [...prev, ...newTasks]);
    } else {
      // Handle Single Task (Create or Edit)
      if (taskData.id) {
        // Edit mode
        setTasks(prev => prev.map(t => t.id === taskData.id ? { ...t, ...taskData } : t));
      } else {
        // Create mode
        const newTask: Task = {
          ...taskData,
          id: generateId(),
          isCompleted: false,
        };
        setTasks(prev => [...prev, newTask]);
      }
    }
    setEditingTask(null);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleToggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  // Date Navigation
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(currentDate.getDate() - 1);
    if (viewMode === 'week') newDate.setDate(currentDate.getDate() - 7);
    if (viewMode === 'month') newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(currentDate.getDate() + 1);
    if (viewMode === 'week') newDate.setDate(currentDate.getDate() + 7);
    if (viewMode === 'month') newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleDateSelectFromCalendar = (date: Date) => {
      setCurrentDate(date);
      setViewMode('day');
  };

  const currentTasks = tasks.filter(t => t.date === formatDate(currentDate));
  const completedCount = currentTasks.filter(t => t.isCompleted).length;
  const progress = currentTasks.length > 0 ? Math.round((completedCount / currentTasks.length) * 100) : 0;

  const getHeaderDateString = () => {
    if (viewMode === 'day') return currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
    if (viewMode === 'month') return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (viewMode === 'week') {
       const start = new Date(currentDate);
       const currentDay = start.getDay(); 
       const distanceToMonday = (currentDay + 6) % 7;
       start.setDate(start.getDate() - distanceToMonday);
       
       const end = new Date(start);
       end.setDate(start.getDate() + 6);
       return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return '';
  };

  // Sidebar Content Component
  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-10">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black shadow-xl shadow-zinc-200 dark:shadow-none transition-colors">
                <CalendarDays size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-paper-text dark:text-grok-text font-mono">DayStream</h1>
         </div>
         
         <div className="flex items-center gap-2">
             <button 
                onClick={toggleTheme}
                className="p-2 text-paper-muted dark:text-grok-muted hover:text-paper-text dark:hover:text-grok-text rounded-lg transition-colors"
             >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             {onClose && (
                <button 
                    onClick={onClose}
                    className="p-2 text-paper-muted dark:text-grok-muted hover:text-paper-text dark:hover:text-grok-text rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>
             )}
         </div>
      </div>
      
      <div className="space-y-6">
        <div className="bg-paper-bg dark:bg-grok-bg rounded-2xl p-5 border border-paper-border dark:border-grok-border">
            <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-paper-muted dark:text-grok-muted">Daily Progress</span>
                <span className="text-xs font-bold text-paper-text dark:text-grok-text font-mono">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                <div 
                    className="bg-zinc-900 dark:bg-white h-1.5 rounded-full transition-all duration-700 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-paper-muted dark:text-grok-muted font-mono">
                <BarChart2 size={14} />
                <span>{completedCount}/{currentTasks.length} tasks</span>
            </div>
        </div>

        <nav className="space-y-3">
           <button 
              onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black py-3.5 px-5 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
           >
              <Plus size={18} />
              <span>Add Task</span>
           </button>
        </nav>
      </div>
      
      <div className="mt-auto pt-6 border-t border-paper-border dark:border-grok-border">
          <div className="text-xs text-paper-muted dark:text-grok-muted font-medium font-mono text-center">
             &copy; 2024 DayStream
          </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper-bg dark:bg-grok-bg flex flex-col lg:flex-row text-paper-text dark:text-grok-text font-sans transition-colors duration-300">
      
      {/* Mobile/Tablet Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-paper-card/80 dark:bg-grok-card/80 backdrop-blur-md border-b border-paper-border dark:border-grok-border z-40 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black">
                <CalendarDays size={16} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg font-mono">DayStream</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-paper-muted dark:text-grok-muted">
              <Menu size={24} />
          </button>
      </div>

      {/* Navigation Drawer (Mobile & Tablet) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="absolute top-0 bottom-0 right-0 w-[80%] max-w-sm bg-paper-card dark:bg-grok-card shadow-2xl animate-slide-in-right border-l border-paper-border dark:border-grok-border">
                 <SidebarContent onClose={() => setIsMobileMenuOpen(false)} />
            </div>
        </div>
      )}

      {/* Desktop Sidebar - Visible only on Large screens */}
      <aside className="hidden lg:flex flex-col w-[280px] lg:w-[320px] bg-paper-card dark:bg-grok-card border border-paper-border dark:border-grok-border h-[calc(100vh-2rem)] sticky top-4 ml-4 rounded-3xl z-30 shadow-sm overflow-hidden transition-colors duration-300 shrink-0">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 transition-all duration-300 mt-16 lg:mt-0">
        <div className="max-w-6xl mx-auto min-h-screen px-4 md:px-8 py-8 md:py-12 pb-32">
            
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 animate-fade-in">
                 <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-paper-text dark:text-grok-text tracking-tight">{getHeaderDateString()}</h2>
                    <p className="text-paper-muted dark:text-grok-muted mt-1 font-medium">Your schedule at a glance</p>
                 </div>

                 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    {/* Date Nav */}
                    <div className="flex items-center justify-between gap-1 bg-paper-card dark:bg-grok-card rounded-xl p-1 border border-paper-border dark:border-grok-border shadow-sm">
                        <button onClick={handlePrev} className="p-2 hover:bg-paper-bg dark:hover:bg-grok-bg rounded-lg text-paper-muted dark:text-grok-muted hover:text-paper-text dark:hover:text-grok-text transition-all"><ChevronLeft size={18}/></button>
                        <button onClick={handleToday} className="text-xs font-bold text-paper-text dark:text-grok-text hover:text-zinc-900 dark:hover:text-white px-4 py-2 rounded-md transition-colors font-mono uppercase">Today</button>
                        <button onClick={handleNext} className="p-2 hover:bg-paper-bg dark:hover:bg-grok-bg rounded-lg text-paper-muted dark:text-grok-muted hover:text-paper-text dark:hover:text-grok-text transition-all"><ChevronRight size={18}/></button>
                    </div>
                    
                    {/* View Switcher */}
                    <div className="flex bg-gray-200 dark:bg-grok-bg rounded-xl p-1 border border-paper-border dark:border-grok-border">
                        {(['day', 'week', 'month'] as ViewMode[]).map((mode) => {
                            const icons = { day: Layout, week: CalendarIcon, month: Grid };
                            const Icon = icons[mode];
                            return (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        viewMode === mode 
                                        ? 'bg-paper-card dark:bg-grok-card text-paper-text dark:text-grok-text shadow-sm' 
                                        : 'text-paper-muted dark:text-grok-muted hover:text-paper-text dark:hover:text-grok-text'
                                    }`}
                                >
                                    <Icon size={16} />
                                    <span className="capitalize hidden sm:inline">{mode}</span>
                                </button>
                            )
                        })}
                    </div>
                 </div>
            </div>

            <div className="animate-fade-in">
                {viewMode === 'day' && (
                    <Timeline 
                        tasks={currentTasks} 
                        onToggleComplete={handleToggleComplete}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteTask}
                    />
                )}

                {viewMode === 'week' && (
                    <WeekView 
                        tasks={tasks}
                        currentDate={currentDate}
                        onDateSelect={handleDateSelectFromCalendar}
                        onToggleComplete={handleToggleComplete}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteTask}
                    />
                )}

                {viewMode === 'month' && (
                    <MonthView 
                        tasks={tasks}
                        currentDate={currentDate}
                        onDateSelect={handleDateSelectFromCalendar}
                        onToggleComplete={handleToggleComplete}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteTask}
                    />
                )}
            </div>
        </div>
      </main>

      {/* Modals */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleAddTask}
        initialData={editingTask}
        defaultDate={formatDate(currentDate)}
      />
    </div>
  );
};

export default App;