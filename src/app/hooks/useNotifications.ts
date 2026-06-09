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
    if (permission !== "granted") return;

    const now = new Date();
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    tasks.forEach((task) => {
      if (task.completed || !task.time) return;

      const [hours, minutes] = task.time.split(":").map(Number);

      // Schedule on the deadline date or today if no deadline
      const targetDate = task.deadline ? new Date(`${task.deadline}T00:00:00`) : new Date();
      targetDate.setHours(hours, minutes, 0, 0);

      const delay = targetDate.getTime() - now.getTime();

      // Only schedule within the next 24 hours
      if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
        const timeout = setTimeout(() => {
          new Notification(`⏰ ${task.title}`, {
            body: task.description ?? `Heure prévue : ${task.time}`,
            icon: "/icon.svg",
          });
        }, delay);
        timeouts.push(timeout);
      }
    });

    return () => timeouts.forEach(clearTimeout);
  }, [tasks, permission]);

  return { permission, requestPermission };
}
