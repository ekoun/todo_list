import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Clock, Tag, Flag, Calendar, AlignLeft } from "lucide-react";
import type { Task } from "../types";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Omit<Task, "id" | "completed" | "createdAt">) => void;
  categories: string[];
}

export function AddTaskModal({ isOpen, onClose, onAdd, categories }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState<string>(categories[0] ?? "Personnel");
  const [priority, setPriority] = useState<Task["priority"]>("Moyenne");

  const priorities: { value: Task["priority"]; label: string; color: string }[] = [
    { value: "Urgente", label: "Urgente", color: "text-red-500"    },
    { value: "Haute",   label: "Haute",   color: "text-orange-500" },
    { value: "Moyenne", label: "Moyenne", color: "text-yellow-500" },
    { value: "Faible",  label: "Faible",  color: "text-blue-500"   },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd({
        title: title.trim(),
        description: description.trim() || undefined,
        time: time || undefined,
        deadline: deadline || undefined,
        category,
        priority,
        subtasks: [],
      });
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTime("");
    setDeadline("");
    setCategory(categories[0] ?? "Personnel");
    setPriority("Moyenne");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 max-w-lg mx-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 35, stiffness: 400 }}
          >
            <div
              className="rounded-t-3xl p-6 pb-8 backdrop-blur-xl border-t border-x"
              style={{
                backgroundColor: "var(--bg-blur)",
                borderColor: "var(--border-subtle)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="heading text-2xl" style={{ color: "var(--text-primary)" }}>
                  Nouvelle tâche
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl transition-all hover:bg-white/5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nom de la tâche"
                    autoFocus
                    className="w-full bg-transparent border-b-2 px-0 py-3 outline-none transition-colors text-lg"
                    style={{
                      borderColor: title ? "var(--accent-lime)" : "var(--border-subtle)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>

                {/* Description */}
                <div
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ backgroundColor: "var(--bg-card)" }}
                >
                  <AlignLeft
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description (optionnel)"
                    rows={2}
                    className="flex-1 bg-transparent outline-none resize-none text-sm"
                    style={{ color: "var(--text-primary)" }}
                  />
                </div>

                {/* Time & Deadline */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="flex items-center gap-2 p-3 rounded-xl"
                    style={{ backgroundColor: "var(--bg-card)" }}
                  >
                    <Clock className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-sm"
                      style={{ color: "var(--text-primary)" }}
                    />
                  </div>

                  <div
                    className="flex items-center gap-2 p-3 rounded-xl"
                    style={{ backgroundColor: "var(--bg-card)" }}
                  >
                    <Calendar className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-sm"
                      style={{ color: "var(--text-primary)" }}
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Catégorie
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className="flex-shrink-0 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                        style={{
                          backgroundColor:
                            category === cat ? "var(--accent-lime)" : "var(--bg-card)",
                          color:
                            category === cat ? "var(--bg-main)" : "var(--text-secondary)",
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Flag className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Priorité
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {priorities.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPriority(p.value)}
                        className="px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                        style={{
                          backgroundColor:
                            priority === p.value ? "var(--accent-lime)" : "var(--bg-card)",
                          color:
                            priority === p.value ? "var(--bg-main)" : "var(--text-secondary)",
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="w-full py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                  style={{
                    backgroundColor: "var(--accent-lime)",
                    color: "var(--bg-main)",
                  }}
                >
                  Ajouter la tâche
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
