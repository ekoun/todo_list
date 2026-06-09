import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Clock, Calendar, Flag, Tag, Plus, Trash2, Check } from "lucide-react";
import type { Task, Subtask } from "../types";
import { getCategoryColors } from "../utils/categoryColors";

interface TaskDetailScreenProps {
  task: Task;
  onBack: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskDetailScreen({ task, onBack, onUpdate, onDelete }: TaskDetailScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [newSubtask, setNewSubtask] = useState("");

  const catColors = getCategoryColors(task.category);

  const priorityConfig = {
    Urgente: { color: "text-red-500", bgColor: "bg-red-500/10" },
    Haute: { color: "text-orange-500", bgColor: "bg-orange-500/10" },
    Moyenne: { color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
    Faible: { color: "text-blue-500", bgColor: "bg-blue-500/10" }
  };

  const handleSave = () => {
    onUpdate({
      ...task,
      title,
      description: description || undefined
    });
    setIsEditing(false);
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks?.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdate({ ...task, subtasks: updatedSubtasks });
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      const subtask: Subtask = {
        id: Date.now().toString(),
        title: newSubtask.trim(),
        completed: false
      };
      onUpdate({
        ...task,
        subtasks: [...(task.subtasks || []), subtask]
      });
      setNewSubtask("");
    }
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks?.filter((st) => st.id !== subtaskId);
    onUpdate({ ...task, subtasks: updatedSubtasks });
  };

  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-main)" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 backdrop-blur-xl border-b"
        style={{
          backgroundColor: "var(--bg-blur)",
          borderColor: "var(--border-subtle)"
        }}
      >
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" style={{ color: "var(--text-primary)" }} />
          </button>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl font-medium transition-all"
                style={{
                  backgroundColor: "var(--accent-lime)",
                  color: "var(--bg-main)"
                }}
              >
                Enregistrer
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-xl font-medium transition-all"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  color: "var(--text-primary)"
                }}
              >
                Modifier
              </button>
            )}

            <button
              onClick={() => onDelete(task.id)}
              className="p-2 rounded-xl hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Task Title */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-b-2 px-0 py-3 outline-none text-2xl heading"
              style={{
                borderColor: "var(--accent-lime)",
                color: "var(--text-primary)"
              }}
            />
          ) : (
            <h1 className="heading text-3xl" style={{ color: "var(--text-primary)" }}>
              {task.title}
            </h1>
          )}
        </motion.div>

        {/* Metadata */}
        <motion.div
          className="flex flex-wrap gap-2 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <span className={`px-3 py-1.5 rounded-xl text-sm border ${catColors.bg} ${catColors.text} ${catColors.border}`}>
            <Tag className="w-3.5 h-3.5 inline mr-1.5" />
            {task.category}
          </span>

          <span className={`px-3 py-1.5 rounded-xl text-sm ${priorityConfig[task.priority].bgColor} ${priorityConfig[task.priority].color}`}>
            <Flag className="w-3.5 h-3.5 inline mr-1.5" />
            {task.priority}
          </span>

          {task.time && (
            <span
              className="px-3 py-1.5 rounded-xl text-sm"
              style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-secondary)" }}
            >
              <Clock className="w-3.5 h-3.5 inline mr-1.5" />
              {task.time}
            </span>
          )}

          {task.deadline && (
            <span
              className="px-3 py-1.5 rounded-xl text-sm"
              style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-secondary)" }}
            >
              <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
              {new Date(task.deadline).toLocaleDateString("fr-FR")}
            </span>
          )}
        </motion.div>

        {/* Description */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isEditing ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajouter une description..."
              rows={4}
              className="w-full p-4 rounded-2xl outline-none border resize-none"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)"
              }}
            />
          ) : (
            task.description && (
              <div
                className="p-4 rounded-2xl border"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-subtle)"
                }}
              >
                <p style={{ color: "var(--text-secondary)" }}>{task.description}</p>
              </div>
            )
          )}
        </motion.div>

        {/* Subtasks */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading text-xl" style={{ color: "var(--text-primary)" }}>
              Sous-tâches
            </h2>
            {totalSubtasks > 0 && (
              <span
                className="text-sm px-3 py-1 rounded-full"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  color: "var(--text-secondary)"
                }}
              >
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}
          </div>

          {/* Add Subtask */}
          <div className="mb-4">
            <div
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-subtle)"
              }}
            >
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddSubtask()}
                placeholder="Ajouter une sous-tâche..."
                className="flex-1 bg-transparent outline-none"
                style={{ color: "var(--text-primary)" }}
              />
              <button
                onClick={handleAddSubtask}
                disabled={!newSubtask.trim()}
                className="p-2 rounded-lg disabled:opacity-30 transition-all"
                style={{ backgroundColor: "var(--accent-lime)" }}
              >
                <Plus className="w-4 h-4" style={{ color: "var(--bg-main)" }} />
              </button>
            </div>
          </div>

          {/* Subtasks List */}
          <AnimatePresence mode="popLayout">
            {task.subtasks?.map((subtask) => (
              <motion.div
                key={subtask.id}
                className="flex items-center gap-3 p-3 rounded-xl border mb-2"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-subtle)"
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <button
                  onClick={() => handleToggleSubtask(subtask.id)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    subtask.completed
                      ? "bg-[var(--accent-lime)] border-transparent"
                      : "border-[var(--text-secondary)]"
                  }`}
                >
                  {subtask.completed && (
                    <Check className="w-3 h-3" style={{ color: "var(--bg-main)" }} />
                  )}
                </button>

                <span
                  className={`flex-1 ${subtask.completed ? "line-through" : ""}`}
                  style={{ color: subtask.completed ? "var(--text-secondary)" : "var(--text-primary)" }}
                >
                  {subtask.title}
                </span>

                <button
                  onClick={() => handleDeleteSubtask(subtask.id)}
                  className="p-1 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
