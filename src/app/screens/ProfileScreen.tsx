import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Sun, Moon, Bell, BellOff, Download, Tag, Lock, X, Plus,
  ChevronRight, Smartphone,
} from "lucide-react";
import type { Task } from "../types";
import { getWeeklyStats, computeStreak } from "../utils/stats";
import { exportJSON, exportCSV } from "../utils/export";
import { getCategoryColors } from "../utils/categoryColors";
import { DEFAULT_CATEGORIES } from "../hooks/useCategories";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

interface ProfileScreenProps {
  tasks: Task[];
  categories: string[];
  customCategories: string[];
  isDark: boolean;
  permission: NotificationPermission;
  onToggleTheme: () => void;
  onAddCategory: (name: string) => void;
  onRemoveCategory: (name: string) => void;
  onRequestPermission: () => Promise<NotificationPermission | void>;
}

export function ProfileScreen({
  tasks,
  categories,
  customCategories,
  isDark,
  permission,
  onToggleTheme,
  onAddCategory,
  onRemoveCategory,
  onRequestPermission,
}: ProfileScreenProps) {
  const [newCategory, setNewCategory] = useState("");
  const { canInstall, isInstalled, triggerInstall } = useInstallPrompt();

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const weeklyData = useMemo(
    () => getWeeklyStats(tasks).map((d, i) => ({ ...d, id: `day-${i}` })),
    [tasks]
  );

  const totalWeekCompleted = weeklyData.reduce((s, d) => s + d.completed, 0);
  const currentStreak = useMemo(() => computeStreak(tasks), [tasks]);
  const maxValue = Math.max(...weeklyData.map((d) => d.completed), 1);

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed) {
      onAddCategory(trimmed);
      setNewCategory("");
    }
  };

  return (
    <div className="max-w-lg mx-auto px-5 py-5 pb-24">

      {/* ── Header ── */}
      <motion.div
        className="flex items-center justify-between mb-5"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="heading text-3xl" style={{ color: "var(--text-primary)" }}>
          Profil
        </h1>

        <div className="flex items-center gap-2">
          {/* Install icon button (compact) */}
          {canInstall && (
            <motion.button
              onClick={triggerInstall}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              style={{ backgroundColor: "var(--accent-lime)" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              title="Installer l'application"
            >
              <Smartphone className="w-5 h-5" style={{ color: "var(--bg-main)" }} />
            </motion.button>
          )}

          {/* Theme toggle */}
          <motion.button
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ backgroundColor: "var(--bg-surface)" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
          >
            {isDark ? (
              <Sun className="w-5 h-5" style={{ color: "var(--accent-lime)" }} />
            ) : (
              <Moon className="w-5 h-5" style={{ color: "var(--accent-lime)" }} />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <motion.div
        className="grid grid-cols-2 gap-3 mb-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        {/* Tâches terminées */}
        <div
          className="rounded-2xl p-4 border"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="heading text-3xl mb-0.5" style={{ color: "var(--text-primary)" }}>
            {completedTasks}
          </div>
          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
            tâches terminées
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--text-disabled)" }}>
            sur {totalTasks} au total
          </div>
        </div>

        {/* Série */}
        <div
          className="rounded-2xl p-4 border"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="heading text-3xl mb-0.5" style={{ color: "var(--accent-lime)" }}>
            {currentStreak}
          </div>
          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
            🔥 jours de série
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--text-disabled)" }}>
            consécutifs
          </div>
        </div>

        {/* Cette semaine */}
        <div
          className="rounded-2xl p-4 border"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="heading text-3xl mb-0.5" style={{ color: "var(--text-primary)" }}>
            {totalWeekCompleted}
          </div>
          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
            cette semaine
          </div>
        </div>

        {/* Taux de réussite */}
        <div
          className="rounded-2xl p-4 border"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="heading text-3xl mb-0.5" style={{ color: "var(--text-primary)" }}>
            {completionRate}%
          </div>
          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
            taux de réussite
          </div>
        </div>
      </motion.div>

      {/* ── Weekly Chart ── */}
      <motion.div
        className="rounded-2xl p-4 border mb-5"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h2
          className="heading text-xs uppercase tracking-wider mb-4"
          style={{ color: "var(--text-secondary)" }}
        >
          Activité de la semaine
        </h2>

        <div className="flex items-end justify-between gap-2 h-20">
          {weeklyData.map((day, i) => {
            const heightPct = (day.completed / maxValue) * 100;
            return (
              <div key={day.id} className="flex-1 flex flex-col items-center gap-1.5">
                <motion.div
                  className="w-full rounded-t-lg"
                  style={{
                    height: `${heightPct}%`,
                    minHeight: day.completed > 0 ? "4px" : "0",
                    backgroundColor: day.isToday
                      ? "var(--accent-lime)"
                      : "var(--bg-card)",
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.45, delay: 0.2 + i * 0.05 }}
                />
                <span
                  className="text-[10px]"
                  style={{
                    color: day.isToday
                      ? "var(--accent-lime)"
                      : "var(--text-secondary)",
                  }}
                >
                  {day.name}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Install CTA (prominent, Android-first) ── */}
      {canInstall && (
        <motion.button
          onClick={triggerInstall}
          className="w-full mb-4 p-4 rounded-2xl flex items-center gap-3 transition-all text-left"
          style={{
            backgroundColor: "var(--accent-lime)",
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "rgba(0,0,0,0.12)" }}
          >
            <Smartphone className="w-5 h-5" style={{ color: "var(--bg-main)" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: "var(--bg-main)" }}>
              Installer l'application
            </p>
            <p className="text-xs opacity-75" style={{ color: "var(--bg-main)" }}>
              Accès rapide depuis l'écran d'accueil Android
            </p>
          </div>
          <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: "var(--bg-main)" }} />
        </motion.button>
      )}

      {/* Installed indicator */}
      {isInstalled && (
        <div
          className="w-full mb-4 p-3 rounded-2xl flex items-center gap-3"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <Smartphone className="w-4 h-4" style={{ color: "var(--accent-lime)" }} />
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Application installée sur cet appareil
          </p>
        </div>
      )}

      {/* ── Notifications ── */}
      <motion.div
        className="mb-3 p-4 rounded-2xl border"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--bg-surface)",
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--bg-card)" }}
            >
              {permission === "granted" ? (
                <Bell className="w-4 h-4" style={{ color: "var(--accent-lime)" }} />
              ) : (
                <BellOff className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
              )}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Notifications
              </p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {permission === "granted"
                  ? "Rappels activés"
                  : permission === "denied"
                  ? "Bloquées dans le navigateur"
                  : "Rappels pour vos tâches"}
              </p>
            </div>
          </div>

          {permission === "granted" && (
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ backgroundColor: "var(--accent-lime)", color: "var(--bg-main)" }}
            >
              Activées
            </span>
          )}
          {permission === "denied" && (
            <span className="text-xs" style={{ color: "var(--text-disabled)" }}>
              Bloquées
            </span>
          )}
          {permission === "default" && (
            <button
              onClick={onRequestPermission}
              className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all"
              style={{ backgroundColor: "var(--accent-lime)", color: "var(--bg-main)" }}
            >
              Activer
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Catégories ── */}
      <motion.div
        className="mb-3 p-4 rounded-2xl border"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--bg-surface)",
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
          <h2
            className="heading text-xs uppercase tracking-wider"
            style={{ color: "var(--text-secondary)" }}
          >
            Catégories
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map((cat) => {
            const colors = getCategoryColors(cat);
            const isDefault = DEFAULT_CATEGORIES.includes(cat);
            return (
              <div
                key={cat}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border ${colors.bg} ${colors.text} ${colors.border}`}
              >
                {cat}
                {isDefault ? (
                  <Lock className="w-3 h-3 opacity-40" />
                ) : (
                  <button
                    onClick={() => onRemoveCategory(cat)}
                    className="opacity-60 hover:opacity-100 transition-opacity"
                    title={`Supprimer "${cat}"`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add category */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            placeholder="Nouvelle catégorie…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--text-primary)" }}
          />
          <button
            onClick={handleAddCategory}
            disabled={!newCategory.trim()}
            className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all"
            style={{ backgroundColor: "var(--accent-lime)" }}
          >
            <Plus className="w-4 h-4" style={{ color: "var(--bg-main)" }} />
          </button>
        </div>

        {customCategories.length > 0 && (
          <p className="text-xs mt-2" style={{ color: "var(--text-disabled)" }}>
            Les catégories personnalisées peuvent être supprimées.
          </p>
        )}
      </motion.div>

      {/* ── Export ── */}
      <motion.div
        className="p-4 rounded-2xl border"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--bg-surface)",
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Download className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
          <h2
            className="heading text-xs uppercase tracking-wider"
            style={{ color: "var(--text-secondary)" }}
          >
            Exporter les données
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => exportJSON(tasks)}
            disabled={tasks.length === 0}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all disabled:opacity-40"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-primary)",
            }}
          >
            <Download className="w-4 h-4" />
            JSON
          </button>
          <button
            onClick={() => exportCSV(tasks)}
            disabled={tasks.length === 0}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all disabled:opacity-40"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-primary)",
            }}
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
        {tasks.length === 0 && (
          <p className="text-xs mt-2" style={{ color: "var(--text-disabled)" }}>
            Ajoutez des tâches pour pouvoir les exporter.
          </p>
        )}
      </motion.div>
    </div>
  );
}
