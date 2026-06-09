import type { Task } from "../types";

/** Format a Date to YYYY-MM-DD */
export function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

/** Return the 7 days of the current week (Mon→Sun) */
export function getWeekDays(): { name: string; dateStr: string; isToday: boolean }[] {
  const today = new Date();
  const todayStr = toDateString(today);
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const names = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return names.map((name, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    const dateStr = toDateString(d);
    return { name, dateStr, isToday: dateStr === todayStr };
  });
}

/** Count tasks completed each day of the current week */
export function getWeeklyStats(
  tasks: Task[]
): { name: string; completed: number; isToday: boolean }[] {
  const weekDays = getWeekDays();
  return weekDays.map(({ name, dateStr, isToday }) => {
    const completed = tasks.filter(
      (t) => t.completedAt && t.completedAt.startsWith(dateStr)
    ).length;
    return { name, completed, isToday };
  });
}

/**
 * Compute the current streak: consecutive days (ending today or yesterday)
 * where at least one task was completed.
 */
export function computeStreak(tasks: Task[]): number {
  const completedDates = new Set(
    tasks
      .filter((t) => t.completedAt)
      .map((t) => t.completedAt!.split("T")[0])
  );

  const today = new Date();
  const todayStr = toDateString(today);

  // If nothing completed today, start from yesterday
  const startOffset = completedDates.has(todayStr) ? 0 : 1;

  let streak = 0;
  for (let i = startOffset; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (completedDates.has(toDateString(d))) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/** Format today's date in French: "Lundi 11 Mai" */
export function formatTodayFr(): string {
  const today = new Date();
  const dayNames = [
    "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi",
  ];
  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ];
  return `${dayNames[today.getDay()]} ${today.getDate()} ${monthNames[today.getMonth()]}`;
}
