import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    // Pick up early-captured event from main.tsx
    return (
      ((window as unknown as Record<string, unknown>).__pwaInstallEvent as BeforeInstallPromptEvent | null) ?? null
    );
  });

  const [isInstalled, setIsInstalled] = useState(() =>
    window.matchMedia("(display-mode: standalone)").matches
  );

  useEffect(() => {
    if (isInstalled) return;

    const handleBeforeInstall = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      (window as unknown as Record<string, unknown>).__pwaInstallEvent = e;
      setDeferredPrompt(e);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      (window as unknown as Record<string, unknown>).__pwaInstallEvent = null;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, [isInstalled]);

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
    (window as unknown as Record<string, unknown>).__pwaInstallEvent = null;
  };

  return {
    canInstall: !!deferredPrompt && !isInstalled,
    isInstalled,
    triggerInstall,
  };
}
