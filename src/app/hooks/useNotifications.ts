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
    // Only proceed if permissions are granted and we have a Service Worker
    if (permission !== "granted" || !("serviceWorker" in navigator)) return;

    let isMounted = true;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const scheduleNotifications = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (!isMounted) return;

        const now = new Date();
        
        tasks.forEach((task) => {
          // Skip completed tasks or tasks without a set time
          if (task.completed || !task.time) return;

          const [hours, minutes] = task.time.split(":").map(Number);
          let targetDate: Date;

          if (task.deadline) {
            // Safer parsing: year, month (0-indexed), day, hours, minutes
            // deadline format is assumed to be YYYY-MM-DD
            const [y, m, d] = task.deadline.split("-").map(Number);
            targetDate = new Date(y, m - 1, d, hours, minutes, 0, 0);
          } else {
            // If no date is set, assume today
            targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
          }

          const delay = targetDate.getTime() - now.getTime();

          // Only schedule if the time is in the future (within the next 24 hours)
          // Long delays in setTimeout can be unreliable due to browser throttling
          if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
            console.log(`[PWA Notification] Scheduled: "${task.title}" at ${task.time} (in ${Math.round(delay/1000/60)} min)`);
            
            const timeout = setTimeout(() => {
              if (!isMounted) return;
              
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
                requireInteraction: true // Keeps the notification until the user acts
              }).catch(err => console.warn("Failed to show notification:", err));
            }, delay);
            
            timeouts.push(timeout);
          }
        });
      } catch (err) {
        console.warn("Service worker notification scheduling error:", err);
      }
    };

    scheduleNotifications();

    return () => {
      isMounted = false;
      timeouts.forEach(clearTimeout);
    };
  }, [tasks, permission]);

  return { permission, requestPermission };
}
