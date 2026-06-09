import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

// ── Capture PWA install prompt BEFORE React mounts ────────────
// The 'beforeinstallprompt' event often fires before any component
// is mounted. We store it globally so useInstallPrompt can read it.
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__pwaInstallEvent = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    (window as unknown as Record<string, unknown>).__pwaInstallEvent = e;
  });
}

// Register PWA Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.warn("SW registration failed:", err));
  });
}

createRoot(document.getElementById("root")!).render(<App />);
