import { useState, useEffect } from "react";

export const DEFAULT_CATEGORIES = ["Travail", "Design", "Études", "Personnel"];

export function useCategories() {
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem("customCategories");
    return saved ? (JSON.parse(saved) as string[]) : [];
  });

  useEffect(() => {
    localStorage.setItem("customCategories", JSON.stringify(customCategories));
  }, [customCategories]);

  const categories = [...DEFAULT_CATEGORIES, ...customCategories];

  const addCategory = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCustomCategories((prev) => [...prev, trimmed]);
    }
  };

  const removeCategory = (name: string) => {
    if (!DEFAULT_CATEGORIES.includes(name)) {
      setCustomCategories((prev) => prev.filter((c) => c !== name));
    }
  };

  return { categories, customCategories, addCategory, removeCategory };
}
