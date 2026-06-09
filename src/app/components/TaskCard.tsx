import { motion } from "motion/react";
import { Clock, Flag, Trash2, ChevronRight, Tag } from "lucide-react";
import { useState } from "react";
import type { Task } from "../types";
import { getCategoryColors } from "../utils/categoryColors";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
}

const PRIORITY_STRIPE: Record<string, string> = {
  Urgente: "#ef4444",
  Haute:   "#f97316",
  Moyenne: "#eab308",
  Faible:  "#3b82f6",
};

const PRIORITY_LABEL_COLOR: Record<string, string> = {
  Urgente: "text-red-500",
  Haute:   "text-orange-500",
  Moyenne: "text-yellow-500",
  Faible:  "text-blue-500",
};

export function TaskCard({ task, onToggle, onDelete, onClick }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const stripeColor = PRIORITY_STRIPE[task.priority] ?? PRIORITY_STRIPE.Faible;
  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length ?? 0;
  const totalSubtasks = task.subtasks?.length ?? 0;
  const catColors = getCategoryColors(task.category);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -80, right: 0 }}
      dragElastic={0.08}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false);
        if (info.offset.x < -60) onDelete(task.id);
      }}
      className="relative mb-2.5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
    >
      {/* Swipe-to-delete hint */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-end pr-5 rounded-2xl"
        style={{ backgroundColor: "rgba(239,68,68,0.12)" }}
      >
        <Trash2 className="w-5 h-5 text-red-400" />
      </div>

      {/* Card */}
      <motion.div
        className={`relative flex rounded-2xl overflow-hidden border transition-all duration-200 ${
          task.completed ? "opacity-50" : "opacity-100"
        }`}
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
        whileTap={{ scale: isDragging ? 1 : 0.985 }}
      >
        {/* Left priority stripe */}
        <div
          className="w-1 flex-shrink-0"
          style={{ backgroundColor: stripeColor }}
        />

        {/* Content */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <motion.div
              className="flex-shrink-0 mt-0.5"
              whileTap={{ scale: 0.88 }}
              onClick={(e) => {
                e.stopPropagation();
                if (!isDragging) onToggle(task.id);
              }}
            >
              <div
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                  task.completed
                    ? "border-transparent"
                    : "border-[var(--text-secondary)] hover:border-[var(--accent-lime)]"
                }`}
                style={
                  task.completed
                    ? { backgroundColor: "var(--accent-lime)" }
                    : undefined
                }
              >
                {task.completed && (
                  <motion.svg
                    width="13"
                    height="10"
                    viewBox="0 0 13 10"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    <motion.path
                      d="M1 5L4.5 8.5L12 1"
                      stroke="var(--bg-main)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                )}
              </div>
            </motion.div>

            {/* Text content */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => !isDragging && onClick(task.id)}
            >
              {/* Title row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {task.priority === "Urgente" && (
                    <Flag
                      className="w-3.5 h-3.5 flex-shrink-0 text-red-500"
                    />
                  )}
                  <h3
                    className={`font-medium leading-snug truncate ${
                      task.completed ? "line-through" : ""
                    } ${task.priority === "Urgente" ? PRIORITY_LABEL_COLOR.Urgente : ""}`}
                    style={{ color: "var(--text-primary)" }}
                  >
                    {task.title}
                  </h3>
                </div>
                <ChevronRight
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: "var(--text-secondary)" }}
                />
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Category badge */}
                {task.category && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium border ${catColors.bg} ${catColors.text} ${catColors.border}`}
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {task.category}
                  </span>
                )}

                {/* Time */}
                {task.time && (
                  <span
                    className="inline-flex items-center gap-1 text-[10px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <Clock className="w-2.5 h-2.5" />
                    {task.time}
                  </span>
                )}

                {/* Subtasks */}
                {totalSubtasks > 0 && (
                  <span
                    className="inline-flex items-center text-[10px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    ✓ {completedSubtasks}/{totalSubtasks}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
