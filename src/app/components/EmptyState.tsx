import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-20 h-20 rounded-3xl mb-6 flex items-center justify-center relative"
        style={{ backgroundColor: "var(--bg-surface)" }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <Icon className="w-10 h-10" style={{ color: "var(--accent-lime)" }} strokeWidth={1.5} />
        <div
          className="absolute inset-0 rounded-3xl opacity-20"
          style={{ boxShadow: "0 0 40px var(--accent-lime)" }}
        />
      </motion.div>

      <motion.h3
        className="heading text-xl mb-2"
        style={{ color: "var(--text-primary)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {title}
      </motion.h3>

      <motion.p
        className="text-sm max-w-xs mb-6"
        style={{ color: "var(--text-secondary)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {description}
      </motion.p>

      {action && (
        <motion.button
          onClick={action.onClick}
          className="px-6 py-3 rounded-xl font-medium transition-all"
          style={{
            backgroundColor: "var(--accent-lime)",
            color: "var(--bg-main)"
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
