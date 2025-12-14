import React, { useState } from 'react';
import { generateScheduleFromInput } from '../services/geminiService';
import { AIResponseTask } from '../types';
import { Wand2, Loader2, X, Sparkles } from 'lucide-react';

interface SmartPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleGenerated: (tasks: AIResponseTask[]) => void;
}

const SmartPlannerModal: React.FC<SmartPlannerModalProps> = ({ isOpen, onClose, onScheduleGenerated }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      const generatedTasks = await generateScheduleFromInput(input, today);
      onScheduleGenerated(generatedTasks);
      onClose();
      setInput('');
    } catch (err) {
      setError("Something went wrong with the AI planner. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-paper-card dark:bg-grok-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative border border-paper-border dark:border-grok-border">
        
        {/* Subtle glow effect for "AI" feel */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
            <div className="p-6 border-b border-paper-border dark:border-grok-border flex justify-between items-center bg-paper-bg/50 dark:bg-grok-bg/30">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg">
                        <Sparkles size={18} />
                    </div>
                    <h2 className="text-lg font-bold tracking-tight text-paper-text dark:text-grok-text font-mono">Smart Planner</h2>
                 </div>
                 <button 
                    onClick={onClose}
                    className="text-paper-muted dark:text-grok-muted hover:text-paper-text dark:hover:text-grok-text transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="p-6">
            <label className="block text-xs font-bold text-paper-muted dark:text-grok-muted uppercase tracking-wider mb-3">
                Describe your day
            </label>
            
            <textarea
                className="w-full p-4 border border-paper-border dark:border-grok-border rounded-xl focus:border-zinc-500 dark:focus:border-white outline-none resize-none bg-paper-bg dark:bg-grok-bg text-paper-text dark:text-grok-text transition-all placeholder:text-paper-muted dark:placeholder:text-grok-muted text-sm font-medium"
                rows={6}
                placeholder="e.g., I need to study for 2 hours in the morning, have a meeting at 2pm, and go to the gym at 5:30pm."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
            />
            
            {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium">
                    {error}
                </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
                <button
                onClick={onClose}
                disabled={isLoading}
                className="px-5 py-2.5 text-paper-muted dark:text-grok-muted hover:text-paper-text dark:hover:text-grok-text transition-colors font-bold text-sm"
                >
                Close
                </button>
                <button
                onClick={handleGenerate}
                disabled={isLoading || !input.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm"
                >
                {isLoading ? (
                    <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                    </>
                ) : (
                    <>
                    <Wand2 size={16} />
                    Generate Plan
                    </>
                )}
                </button>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SmartPlannerModal;