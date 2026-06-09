import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ListTodo } from "lucide-react";
import { TaskCard } from "../components/TaskCard";
import { ProgressBar } from "../components/ProgressBar";
import { EmptyState } from "../components/EmptyState";
import { formatTodayFr } from "../utils/stats";
import type { Task } from "../types";

type StatusFilter = "all" | "active" | "done";

interface HomeScreenProps {
  tasks: Task[];
  categories: string[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onTaskClick: (id: string) => void;
  onAddTask: () => void;
}

export function HomeScreen({
  tasks,
  onToggleTask,
  onDeleteTask,
  onTaskClick,
  onAddTask,
}: HomeScreenProps) {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Bonjour" : currentHour < 18 ? "Bon après-midi" : "Bonsoir";

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Global counts (always reflect ALL tasks)
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  // Filtered list (by status only, sorted by priority by default)
  const processedTasks = useMemo(() => {
    const priorityOrder: Record<string, number> = {
      Urgente: 0, Haute: 1, Moyenne: 2, Faible: 3,
    };
    return [...tasks]
      .filter((t) => {
        if (statusFilter === "active") return !t.completed;
        if (statusFilter === "done")   return t.completed;
        return true;
      })
      .sort((a, b) => (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4));
  }, [tasks, statusFilter]);

  const activeTasks    = processedTasks.filter((t) => !t.completed);
  const completedTasks = processedTasks.filter((t) => t.completed);

  const showActive    = statusFilter === "all" || statusFilter === "active";
  const showCompleted = statusFilter === "all" || statusFilter === "done";

  const isEmpty = processedTasks.length === 0;

  return (
    <div className="max-w-lg mx-auto px-5 py-5 pb-24">
      {/* Header */}
      <motion.div
        className="mb-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="heading text-4xl mb-1" style={{ color: "var(--text-primary)" }}>
          {greeting}
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {formatTodayFr()}
        </p>
      </motion.div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ProgressBar completed={completedCount} total={totalCount} />
        </motion.div>
      )}

      {/* ── Filter Bar (status only) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mb-5 flex items-center gap-2 flex-wrap"
      >
        {(["all", "active", "done"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{
              backgroundColor:
                statusFilter === s ? "var(--accent-lime)" : "var(--bg-surface)",
              color:
                statusFilter === s ? "var(--bg-main)" : "var(--text-secondary)",
            }}
          >
            {s === "all" ? "Toutes" : s === "active" ? "À faire" : "Terminées"}
          </button>
        ))}
      </motion.div>

      {/* ── Task List ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Active tasks */}
        {showActive && activeTasks.length > 0 && (
          <div className="mb-8">
            <AnimatePresence mode="popLayout">
              {activeTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onClick={onTaskClick}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Completed tasks */}
        {showCompleted && completedTasks.length > 0 && (
          <div>
            {statusFilter === "all" && (
              <h3
                className="heading text-sm mb-4 flex items-center gap-2 opacity-60"
                style={{ color: "var(--text-secondary)" }}
              >
                <CheckCircle2 className="w-4 h-4" />
                Terminées
              </h3>
            )}
            <AnimatePresence mode="popLayout">
              {completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggleTask}
                  onDelete={onDeleteTask}
                  onClick={onTaskClick}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <EmptyState
            icon={ListTodo}
            title={totalCount === 0 ? "Aucune tâche" : "Aucun résultat"}
            description={
              totalCount === 0
                ? "Commencez votre journée en ajoutant votre première tâche"
                : "Aucune tâche ne correspond à vos filtres"
            }
            action={
              totalCount === 0
                ? { label: "Ajouter une tâche", onClick: onAddTask }
                : undefined
            }
          />
        )}
      </motion.div>
    </div>
  );
}
