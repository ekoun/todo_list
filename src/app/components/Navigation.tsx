import { motion, AnimatePresence } from "motion/react";
import { Home, Calendar, Target, User, Download } from "lucide-react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { canInstall, isInstalled, triggerInstall } = useInstallPrompt();

  const tabs = [
    { id: "home",     label: "Accueil",    icon: Home     },
    { id: "calendar", label: "Calendrier", icon: Calendar },
    { id: "focus",    label: "Focus",      icon: Target   },
    { id: "profile",  label: "Profil",     icon: User     },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* ── PWA Install Banner (above tab bar) ── */}
      <AnimatePresence>
        {canInstall && !isInstalled && (
          <motion.button
            key="install-banner"
            onClick={triggerInstall}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold"
            style={{ backgroundColor: "var(--accent-lime)", color: "var(--bg-main)" }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            Installer l'application
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Tab Bar ── */}
      <div
        className="backdrop-blur-xl border-t safe-area-bottom"
        style={{
          backgroundColor: "var(--bg-blur)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex flex-col items-center gap-1.5 px-4 py-2 transition-all min-w-[64px]"
              >
                <motion.div
                  className="relative"
                  whileTap={{ scale: 0.85 }}
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon
                    className="w-6 h-6 transition-colors"
                    style={{
                      color: isActive ? "var(--accent-lime)" : "var(--text-secondary)",
                    }}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: "var(--accent-lime)" }}
                      layoutId="activeIndicator"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.div>
                <span
                  className="text-[10px] font-medium"
                  style={{
                    color: isActive ? "var(--accent-lime)" : "var(--text-secondary)",
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
