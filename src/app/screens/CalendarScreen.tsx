import { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import type { Task } from "../types";
import { EmptyState } from "../components/EmptyState";

interface CalendarScreenProps {
  tasks: Task[];
}

export function CalendarScreen({ tasks }: CalendarScreenProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getTasksForDay = (day: number) => {
    return tasks.filter((task) => {
      if (task.deadline) {
        const taskDate = new Date(task.deadline);
        return (
          taskDate.getDate() === day &&
          taskDate.getMonth() === currentDate.getMonth() &&
          taskDate.getFullYear() === currentDate.getFullYear()
        );
      }
      return false;
    });
  };

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

  return (
    <div className="max-w-lg mx-auto px-6 py-8">
      {/* Header */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="heading text-4xl mb-2" style={{ color: "var(--text-primary)" }}>
          Calendrier
        </h1>
      </motion.div>

      {/* Month Navigation */}
      <motion.div
        className="flex items-center justify-between mb-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <button
          onClick={prevMonth}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" style={{ color: "var(--text-primary)" }} />
        </button>

        <h2 className="heading text-lg" style={{ color: "var(--text-primary)" }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>

        <button
          onClick={nextMonth}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors"
        >
          <ChevronRight className="w-5 h-5" style={{ color: "var(--text-primary)" }} />
        </button>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
            <div
              key={i}
              className="text-center text-xs font-medium py-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: adjustedFirstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayTasks = getTasksForDay(day);
            const hasUrgent = dayTasks.some((t) => t.priority === "Urgente");
            const hasHigh = dayTasks.some((t) => t.priority === "Haute");

            return (
              <motion.div
                key={day}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all cursor-pointer ${
                  isToday(day) ? "ring-2" : ""
                }`}
                style={{
                  backgroundColor: isToday(day) ? "var(--accent-lime)" : "var(--bg-surface)",
                  color: isToday(day) ? "var(--bg-main)" : "var(--text-primary)",
                  ringColor: "var(--accent-lime)"
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + (i * 0.01) }}
              >
                <span className={`text-sm font-medium mb-1 ${isToday(day) ? "font-bold" : ""}`}>
                  {day}
                </span>

                {dayTasks.length > 0 && (
                  <div className="flex gap-0.5">
                    {hasUrgent && (
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                    )}
                    {hasHigh && !hasUrgent && (
                      <div className="w-1 h-1 rounded-full bg-orange-500" />
                    )}
                    {!hasUrgent && !hasHigh && (
                      <div
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: isToday(day) ? "var(--bg-main)" : "var(--accent-lime)" }}
                      />
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Tasks with Deadlines */}
      {tasks.filter((t) => t.deadline && !t.completed).length > 0 && (
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="heading text-xs uppercase tracking-wider mb-4" style={{ color: "var(--text-secondary)" }}>
            À venir
          </h3>

          <div className="space-y-4">
            {tasks
              .filter((t) => t.deadline && !t.completed)
              .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
              .slice(0, 5)
              .map((task) => (
                <div key={task.id} className="border-b pb-4" style={{ borderColor: "var(--border-subtle)" }}>
                  <h4 className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                    {task.title}
                  </h4>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {new Date(task.deadline!).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long"
                    })}
                  </p>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
