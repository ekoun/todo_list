import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HomeScreen } from "./screens/HomeScreen";
import { TaskDetailScreen } from "./screens/TaskDetailScreen";
import { FocusScreen } from "./screens/FocusScreen";
import { CalendarScreen } from "./screens/CalendarScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { SplashScreen } from "./screens/SplashScreen";
import { AddTaskButton } from "./components/AddTaskButton";
import { Navigation } from "./components/Navigation";
import { AddTaskModal } from "./components/AddTaskModal";
import { UpdateNotification } from "./components/UpdateNotification";
import { useTheme } from "./hooks/useTheme";
import { useCategories } from "./hooks/useCategories";
import { useNotifications } from "./hooks/useNotifications";
import type { Task } from "./types";

type Screen = "onboarding" | "home" | "calendar" | "focus" | "profile" | "taskDetail";

export default function App() {
  // Show splash on every cold start (mimics native PWA behaviour)
  const [showSplash, setShowSplash] = useState(true);

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem("hasCompletedOnboarding") === "true";
  });

  const [currentScreen, setCurrentScreen] = useState<Screen>(
    hasCompletedOnboarding ? "home" : "onboarding"
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  // ── Hooks ──────────────────────────────────────────────────
  const { isDark, toggleTheme } = useTheme();
  const { categories, customCategories, addCategory, removeCategory } = useCategories();
  const { permission, requestPermission } = useNotifications(tasks);

  // ── Persist tasks ──────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // ── Handlers ───────────────────────────────────────────────
  const handleCompleteOnboarding = () => {
    setHasCompletedOnboarding(true);
    localStorage.setItem("hasCompletedOnboarding", "true");
    setCurrentScreen("home");
  };

  const handleToggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : undefined,
            }
          : task
      )
    );
  }, []);

  const handleSnoozeTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id || !task.time) return task;
        const [h, m] = task.time.split(":").map(Number);
        const date = new Date();
        date.setHours(h, m + 15, 0, 0);
        const newTime = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
        return { ...task, time: newTime };
      })
    );
  }, []);

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    if (currentScreen === "taskDetail" && selectedTaskId === id) {
      setCurrentScreen("home");
      setSelectedTaskId(null);
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const handleAddTask = (newTask: Omit<Task, "id" | "completed" | "createdAt">) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, task]);
  };

  const handleTaskClick = useCallback((id: string) => {
    setSelectedTaskId(id);
    setCurrentScreen("taskDetail");
  }, []);

  const handleBackFromDetail = () => {
    setCurrentScreen("home");
    setSelectedTaskId(null);
  };

  const handleTabChange = (tab: string) => {
    setCurrentScreen(tab as Screen);
    if (tab !== "taskDetail") setSelectedTaskId(null);
  };

  // ── PWA Action Handling (Interactive Notifications) ──
  useEffect(() => {
    const handleIncomingAction = (action: string | null, taskId: string | null) => {
      if (!taskId) return;

      if (action === "complete") {
        handleToggleTask(taskId);
      } else if (action === "snooze") {
        handleSnoozeTask(taskId);
      }
      
      handleTaskClick(taskId);
      // Clean up URL without refreshing
      window.history.replaceState({}, document.title, "/");
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "TASK_ACTION") {
        handleIncomingAction(event.data.action, event.data.taskId);
      } else if (event.data?.type === "OPEN_TASK") {
        handleTaskClick(event.data.taskId);
      }
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleMessage);
    }

    // Check URL params for actions from closed app notifications
    const params = new URLSearchParams(window.location.search);
    const urlAction = params.get("action");
    const urlTaskId = params.get("taskId");
    
    if (urlTaskId) {
      // Delay slightly to ensure splash screen or onboarding doesn't interfere
      const timer = setTimeout(() => handleIncomingAction(urlAction, urlTaskId), 800);
      return () => clearTimeout(timer);
    }

    return () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleMessage);
      }
    };
  }, [handleToggleTask, handleSnoozeTask, handleTaskClick]);

  const selectedTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId)
    : null;

  if (currentScreen === "onboarding") {
    return <OnboardingScreen onComplete={handleCompleteOnboarding} />;
  }

  const isTabScreen = !["taskDetail", "onboarding"].includes(currentScreen);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-main)" }}>

      {/* ── PWA Update Notification ── */}
      <UpdateNotification />

      {/* ── Splash screen: shown on every cold start ── */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onDone={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {/* ── FocusScreen: always mounted so the timer survives navigation ── */}
      <div
        style={{
          display: currentScreen === "focus" ? "flex" : "none",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <FocusScreen />
      </div>

      {/* ── All other screens (conditionally rendered) ── */}
      <AnimatePresence mode="wait">
        {currentScreen === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <HomeScreen
              tasks={tasks}
              categories={categories}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onTaskClick={handleTaskClick}
              onAddTask={() => setIsAddModalOpen(true)}
            />
          </motion.div>
        )}

        {currentScreen === "calendar" && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <CalendarScreen tasks={tasks} />
          </motion.div>
        )}

        {currentScreen === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <ProfileScreen
              tasks={tasks}
              categories={categories}
              customCategories={customCategories}
              isDark={isDark}
              permission={permission}
              onToggleTheme={toggleTheme}
              onAddCategory={addCategory}
              onRemoveCategory={removeCategory}
              onRequestPermission={requestPermission}
            />
          </motion.div>
        )}

        {currentScreen === "taskDetail" && selectedTask && (
          <motion.div
            key="taskDetail"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.2 }}
          >
            <TaskDetailScreen
              task={selectedTask}
              onBack={handleBackFromDetail}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB: hide on focus and taskDetail ── */}
      {isTabScreen && currentScreen !== "focus" && (
        <AddTaskButton onClick={() => setIsAddModalOpen(true)} />
      )}

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTask}
        categories={categories}
      />

      {/* ── Navigation: hide on taskDetail ── */}
      {currentScreen !== "taskDetail" && (
        <Navigation activeTab={currentScreen} onTabChange={handleTabChange} />
      )}
    </div>
  );
}
