import { useState, useEffect } from "react";
import type { Task } from "../types";

export function useNotifications(tasks: Task[]) {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );

  const requestPermission = async (): Promise<NotificationPermission | void> => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  useEffect(() => {
    if (permission !== "granted" || !("serviceWorker" in navigator)) return;

    const now = new Date();
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    // Use Service Worker registration for persistent notifications with actions
    const scheduleNotifications = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        tasks.forEach((task) => {
          // Skip completed tasks or tasks without a time
          if (task.completed || !task.time) return;

          const [hours, minutes] = task.time.split(":").map(Number);
          
          // Target date: use deadline if available, otherwise today
          const targetDate = task.deadline ? new Date(`${task.deadline}T00:00:00`) : new Date();
          targetDate.setHours(hours, minutes, 0, 0);

          const delay = targetDate.getTime() - now.getTime();

          // Schedule only within the next 24 hours to avoid overcrowding timeouts
          if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
            const timeout = setTimeout(() => {
              registration.showNotification(`⏰ ${task.title}`, {
                body: task.description || `Il est l'heure ! (${task.time})`,
                icon: "/icon.svg",
                badge: "/icon.svg",
                tag: `task-reminder-${task.id}`,
                renotify: true,
                data: { 
                  taskId: task.id,
                  type: "TASK_REMINDER"
                },
                actions: [
                  { action: "complete", title: "Terminer" },
                  { action: "snooze", title: "Reporter 15m" }
                ],
                vibrate: [200, 100, 200],
                requireInteraction: true // Keep notification until user interacts
              }).catch(err => console.warn("Failed to show notification:", err));
            }, delay);
            timeouts.push(timeout);
          }
        });
      } catch (err) {
        console.warn("Service worker not ready for notifications:", err);
      }
    };

    scheduleNotifications();

    return () => timeouts.forEach(clearTimeout);
  }, [tasks, permission]);

  return { permission, requestPermission };
}
