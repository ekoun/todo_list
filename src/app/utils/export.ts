import type { Task } from "../types";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportJSON(tasks: Task[]) {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], {
    type: "application/json",
  });
  triggerDownload(blob, `taches-${todayStr()}.json`);
}

export function exportCSV(tasks: Task[]) {
  const headers = [
    "Titre", "Description", "Catégorie", "Priorité",
    "Heure", "Deadline", "Complétée", "Créée le",
  ];

  const rows = tasks.map((t) => [
    t.title,
    t.description ?? "",
    t.category,
    t.priority,
    t.time ?? "",
    t.deadline ?? "",
    t.completed ? "Oui" : "Non",
    new Date(t.createdAt).toLocaleDateString("fr-FR"),
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  // BOM for Excel to detect UTF-8
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `taches-${todayStr()}.csv`);
}
