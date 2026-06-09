import { useState, useEffect } from "react";
import type { Task } from "../types";

const CATEGORY_EMOJIS: Record<string, string> = {
  Travail: "💼",
  Design: "🎨",
  Études: "📚",
  Personnel: "🏠",
  Sport: "🏃",
  Santé: "🍎",
  Courses: "🛒",
};

const PRIORITY_PREFIX: Record<string, string> = {
  Urgente: "🚨 IMPORTANT :",
  Haute: "🔥",
  Moyenne: "⚡",
  Faible: "🍃",
};

/**
 * Generates a dynamic notification message based on task properties.
 */
function getNotificationContent(task: Task): { title: string; body: string } {
  const emoji = CATEGORY_EMOJIS[task.category] || "⏰";
  const prefix = PRIORITY_PREFIX[task.priority] || "";
  
  const title = `${prefix} ${emoji} ${task.title}`.trim();
  
  let body = "";
  
  // Custom logic based on priority and category to make it more personal
  if (task.priority === "Urgente") {
    body = `C'est urgent ! ${task.description || "Ne perdez pas une seconde."}`;
  } else if (task.category === "Travail") {
    body = `Temps de se concentrer sur le boulot. ${task.description || ""}`;
  } else if (task.category === "Design") {
    body = `L'inspiration n'attend pas ! ${task.description || ""}`;
  } else if (task.category === "Santé" || task.category === "Sport") {
    body = `Prenez soin de vous ! ${task.description || ""}`;
  } else {
    body = task.description || `Il est l'heure de s'en occuper ! (${task.time})`;
  }

  return { title, body: body.trim() };
}

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

    let isMounted = true;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const scheduleNotifications = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (!isMounted) return;

        const now = new Date();
        
        tasks.forEach((task) => {
          if (task.completed || !task.time) return;

          const [hours, minutes] = task.time.split(":").map(Number);
          let targetDate: Date;

          if (task.deadline) {
            // Safe parsing for mobile browsers
            const [y, m, d] = task.deadline.split("-").map(Number);
            targetDate = new Date(y, m - 1, d, hours, minutes, 0, 0);
          } else {
            targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
          }

          const delay = targetDate.getTime() - now.getTime();

          if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
            const { title, body } = getNotificationContent(task);
            
            const timeout = setTimeout(() => {
              if (!isMounted) return;
              
              registration.showNotification(title, {
                body,
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
                // More intense vibration for urgent tasks
                vibrate: task.priority === "Urgente" ? [400, 100, 400, 100, 400] : [200, 100, 200],
                requireInteraction: true
              }).catch(err => console.warn("Failed to show notification:", err));
            }, delay);
            
            timeouts.push(timeout);
          }
        });
      } catch (err) {
        console.warn("Service worker error in notifications:", err);
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
