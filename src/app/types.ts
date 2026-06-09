export interface Task {
  id: string;
  title: string;
  description?: string;
  time?: string;
  deadline?: string;
  /** Built-in: "Travail" | "Design" | "Études" | "Personnel" — or any custom string */
  category: string;
  priority: "Faible" | "Moyenne" | "Haute" | "Urgente";
  completed: boolean;
  /** ISO timestamp set when the task is marked as completed; cleared when unchecked */
  completedAt?: string;
  subtasks?: Subtask[];
  createdAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface DailyStats {
  date: string;
  completed: number;
  total: number;
  focusTime: number;
}
