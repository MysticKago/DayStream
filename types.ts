export interface Task {
  id: string;
  seriesId?: string; // Identifies tasks created as part of a recurring series
  title: string;
  description?: string;
  startTime: string; // HH:MM 24h format
  date: string; // YYYY-MM-DD ISO format
  durationMinutes: number;
  isCompleted: boolean;
  category: TaskCategory;
}

export enum TaskCategory {
  WORK = 'Work',
  PERSONAL = 'Personal',
  HEALTH = 'Health',
  LEARNING = 'Learning',
  OTHER = 'Other'
}

export interface AIResponseTask {
  title: string;
  description: string;
  startTime: string;
  durationMinutes: number;
  category: TaskCategory;
}