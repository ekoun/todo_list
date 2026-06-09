import { motion } from "motion/react";

interface ProgressBarProps {
  completed: number;
  total: number;
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
          Progression
        </span>
        <span className="heading text-sm" style={{ color: "var(--text-primary)" }}>
          {completed} / {total}
        </span>
      </div>

      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: "var(--bg-surface)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: "var(--accent-lime)" }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
