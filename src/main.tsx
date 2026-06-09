import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

// ── Capture PWA install prompt BEFORE React mounts ────────────
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__pwaInstallEvent = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    (window as unknown as Record<string, unknown>).__pwaInstallEvent = e;
  });
}

// Register PWA Service Worker and handle updates
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Check for updates every 60 minutes to detect changes in sw.js or assets
        setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                // A new service worker is waiting. Notify the UI.
                window.dispatchEvent(
                  new CustomEvent("pwa-update-available", { detail: registration })
                );
              }
            };
          }
        };

        // Also check if there's already a waiting worker on load
        if (registration.waiting) {
          window.dispatchEvent(
            new CustomEvent("pwa-update-available", { detail: registration })
          );
        }
      })
      .catch((err) => console.warn("SW registration failed:", err));
  });

  // Handle reloads when the service worker takes control (after skipWaiting)
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  // Listen for custom messages from the Service Worker (e.g. from notification click)
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "UPDATE_REQUESTED") {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          window.dispatchEvent(
            new CustomEvent("pwa-update-available", { detail: reg })
          );
        }
      });
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
