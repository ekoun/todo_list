import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";

export function UpdateNotification() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ServiceWorkerRegistration>;
      if (customEvent.detail) {
        setRegistration(customEvent.detail);
      } else {
        // Fallback for events without detail (e.g. from system notification click)
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.getRegistration().then(reg => {
            if (reg?.waiting) setRegistration(reg);
          });
        }
      }
    };

    window.addEventListener("pwa-update-available", handleUpdate);
    
    // Check if there's already a waiting worker on mount
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg?.waiting) setRegistration(reg);
      });
    }

    return () => window.removeEventListener("pwa-update-available", handleUpdate);
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  };

  return (
    <AnimatePresence>
      {registration && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-32px)] max-w-[360px]"
        >
          <div 
            className="flex items-center justify-between p-3.5 pl-4 rounded-2xl border shadow-2xl backdrop-blur-2xl"
            style={{ 
              backgroundColor: "rgba(18, 23, 21, 0.82)", 
              borderColor: "rgba(255, 255, 255, 0.08)",
              boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.5)"
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(126, 200, 80, 0.15)" }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: "var(--accent-lime)" }} />
                </div>
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "var(--accent-lime)" }}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "var(--accent-lime)" }}></span>
                </span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                  Mise à jour disponible !
                </span>
                <span className="text-[10px] opacity-60 leading-tight" style={{ color: "var(--text-secondary)" }}>
                  Nouvelle version prête à être installée
                </span>
              </div>
            </div>

            <motion.button
              onClick={handleUpdate}
              className="px-4 py-2 rounded-xl text-[11px] font-black tracking-[0.05em] transition-all shadow-lg"
              style={{ 
                backgroundColor: "var(--accent-lime)", 
                color: "var(--bg-main)" 
              }}
              whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              RECHARGER
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
