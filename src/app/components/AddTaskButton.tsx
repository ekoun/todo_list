import { motion } from "motion/react";
import { Plus } from "lucide-react";

interface AddTaskButtonProps {
  onClick: () => void;
}

export function AddTaskButton({ onClick }: AddTaskButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-24 right-6 w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl z-50 backdrop-blur-xl border"
      style={{
        backgroundColor: "var(--accent-lime)",
        borderColor: "rgba(255, 255, 255, 0.1)"
      }}
      whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(126, 200, 80, 0.3)" }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <Plus className="w-7 h-7 text-[var(--bg-main)]" strokeWidth={2.5} />
    </motion.button>
  );
}
