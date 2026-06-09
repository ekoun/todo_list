import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play, Pause, RotateCcw, Coffee, Target, CheckCircle2,
  Plus, Minus,
} from "lucide-react";

const SESSIONS_KEY = "focusSessions";
const SESSIONS_DATE_KEY = "focusSessionsDate";
const CUSTOM_DURATIONS_KEY = "focusCustomDurations";

type SessionType = "focus" | "break" | "longBreak";

const SESSION_LABELS: Record<SessionType, string> = {
  focus: "Focus",
  break: "Pause",
  longBreak: "Longue pause",
};

const DEFAULT_DURATIONS: Record<SessionType, number> = {
  focus:     25 * 60,
  break:      5 * 60,
  longBreak: 15 * 60,
};

// Min / max in minutes per session type
const BOUNDS: Record<SessionType, { min: number; max: number; step: number }> = {
  focus:     { min: 5,  max: 60, step: 5 },
  break:     { min: 1,  max: 15, step: 1 },
  longBreak: { min: 5,  max: 30, step: 5 },
};

/* ── Helpers ─────────────────────────────────────────────────── */
function playCompletionSound(isFocusEnd: boolean) {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const freqs = isFocusEnd ? [523, 659, 784] : [784, 659, 523];
    freqs.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.2;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  } catch { /* not supported */ }
}

function vibrateDevice(pattern: number[]) {
  if ("vibrate" in navigator) navigator.vibrate(pattern);
}

function sendNotification(title: string, body: string) {
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/icon.svg", badge: "/icon.svg" });
  }
}

function loadCustomDurations(): Record<SessionType, number> {
  try {
    const saved = localStorage.getItem(CUSTOM_DURATIONS_KEY);
    return saved ? JSON.parse(saved) : { ...DEFAULT_DURATIONS };
  } catch {
    return { ...DEFAULT_DURATIONS };
  }
}

/* ── Component ───────────────────────────────────────────────── */
export function FocusScreen() {
  const [customDurations, setCustomDurations] = useState<Record<SessionType, number>>(
    loadCustomDurations
  );
  const [sessionType, setSessionType] = useState<SessionType>("focus");
  const [timeLeft, setTimeLeft]       = useState(customDurations.focus);
  const [isRunning, setIsRunning]     = useState(false);
  const [showBanner, setShowBanner]   = useState<string | null>(null);

  const [sessionsCompleted, setSessionsCompleted] = useState<number>(() => {
    const today     = new Date().toISOString().split("T")[0];
    const savedDate = localStorage.getItem(SESSIONS_DATE_KEY);
    const count     = parseInt(localStorage.getItem(SESSIONS_KEY) || "0", 10);
    return savedDate === today ? count : 0;
  });

  // Persist sessions
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(SESSIONS_DATE_KEY, today);
    localStorage.setItem(SESSIONS_KEY, String(sessionsCompleted));
  }, [sessionsCompleted]);

  // Persist custom durations
  useEffect(() => {
    localStorage.setItem(CUSTOM_DURATIONS_KEY, JSON.stringify(customDurations));
  }, [customDurations]);

  // Trigger signals + banner
  const triggerSignals = useCallback(
    (isFocusEnd: boolean, title: string, body: string) => {
      playCompletionSound(isFocusEnd);
      vibrateDevice(isFocusEnd ? [200, 100, 200, 100, 400] : [300, 100, 300]);
      sendNotification(title, body);
      setShowBanner(title);
      setTimeout(() => setShowBanner(null), 3500);
    },
    []
  );

  // Session complete logic (stable ref to avoid stale closures)
  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    if (sessionType === "focus") {
      const next     = sessionsCompleted + 1;
      setSessionsCompleted(next);
      const nextType = next % 4 === 0 ? "longBreak" : "break";
      setSessionType(nextType);
      setTimeLeft(customDurations[nextType]);
      triggerSignals(
        true,
        "🎯 Session Focus terminée !",
        next % 4 === 0
          ? "4 sessions ! Profitez d'une longue pause de 15 min."
          : "Bravo ! Prenez une pause de 5 minutes."
      );
    } else {
      setSessionType("focus");
      setTimeLeft(customDurations.focus);
      triggerSignals(false, "☕ Pause terminée !", "C'est reparti ! Lancez votre prochain Focus.");
    }
  }, [sessionType, sessionsCompleted, customDurations, triggerSignals]);

  // Timer tick
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [isRunning, timeLeft]);

  // When timeLeft hits 0
  const completedRef = useRef(false);
  useEffect(() => {
    if (timeLeft === 0 && isRunning && !completedRef.current) {
      completedRef.current = true;
      handleSessionComplete();
      // Allow next completion after state settles
      requestAnimationFrame(() => { completedRef.current = false; });
    }
  }, [timeLeft, isRunning, handleSessionComplete]);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(customDurations[sessionType]);
  };

  const handleSessionTypeChange = (type: SessionType) => {
    setSessionType(type);
    setTimeLeft(customDurations[type]);
    setIsRunning(false);
  };

  // Adjust duration for the current session type (±step, clamped)
  const adjustDuration = (delta: number) => {
    const bounds = BOUNDS[sessionType];
    setCustomDurations((prev) => {
      const currentMins = prev[sessionType] / 60;
      const newMins     = Math.min(bounds.max, Math.max(bounds.min, currentMins + delta));
      const updated     = { ...prev, [sessionType]: newMins * 60 };
      setTimeLeft(updated[sessionType]); // sync display immediately
      return updated;
    });
  };

  const minutes  = Math.floor(timeLeft / 60);
  const seconds  = timeLeft % 60;
  const progress = ((customDurations[sessionType] - timeLeft) / customDurations[sessionType]) * 100;
  const durationMins = Math.round(customDurations[sessionType] / 60);
  const bounds = BOUNDS[sessionType];

  const R            = 96;
  const CIRCUMFERENCE = 2 * Math.PI * R;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg-main)" }}
    >
      <div className="flex-1 flex flex-col px-5 py-6 pb-8 max-w-lg mx-auto w-full">

        {/* ── Header ── */}
        <motion.div
          className="flex items-center gap-2 mb-6"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "var(--bg-surface)" }}
          >
            <Target className="w-5 h-5" style={{ color: "var(--accent-lime)" }} />
          </div>
          <div>
            <h1 className="heading text-xl leading-tight" style={{ color: "var(--text-primary)" }}>
              Mode Focus
            </h1>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Restez concentré et productif
            </p>
          </div>
        </motion.div>

        {/* ── Completion Banner ── */}
        <AnimatePresence>
          {showBanner && (
            <motion.div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
              style={{ backgroundColor: "var(--accent-lime)" }}
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{ opacity: 0,    y: -8,  scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "var(--bg-main)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--bg-main)" }}>
                {showBanner}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Session Type Selector ── */}
        <motion.div
          className="flex gap-2 p-1.5 rounded-2xl mb-4"
          style={{ backgroundColor: "var(--bg-surface)" }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1  }}
          transition={{ delay: 0.05 }}
        >
          {(["focus", "break", "longBreak"] as SessionType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleSessionTypeChange(type)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: sessionType === type ? "var(--accent-lime)" : "transparent",
                color:           sessionType === type ? "var(--bg-main)"    : "var(--text-secondary)",
              }}
            >
              {SESSION_LABELS[type]}
            </button>
          ))}
        </motion.div>

        {/* ── Duration Adjuster (only when stopped) ── */}
        <AnimatePresence>
          {!isRunning && (
            <motion.div
              className="flex items-center justify-center gap-4 mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0,    height: 0      }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                onClick={() => adjustDuration(-bounds.step)}
                disabled={durationMins <= bounds.min}
                className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-30"
                style={{ backgroundColor: "var(--bg-surface)" }}
                whileTap={{ scale: 0.9 }}
              >
                <Minus className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
              </motion.button>

              <div className="text-center min-w-[80px]">
                <span className="heading text-lg tabular-nums" style={{ color: "var(--text-primary)" }}>
                  {durationMins} min
                </span>
              </div>

              <motion.button
                onClick={() => adjustDuration(+bounds.step)}
                disabled={durationMins >= bounds.max}
                className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-30"
                style={{ backgroundColor: "var(--bg-surface)" }}
                whileTap={{ scale: 0.9 }}
              >
                <Plus className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Timer Card ── */}
        <motion.div
          className="rounded-3xl p-6 mb-6 flex flex-col items-center"
          style={{ backgroundColor: "var(--bg-surface)" }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1  }}
          transition={{ delay: 0.1, type: "spring" }}
        >
          {/* SVG Circle */}
          <div className="relative mb-5">
            <svg className="-rotate-90" width="224" height="224" viewBox="0 0 224 224">
              <circle cx="112" cy="112" r={R} fill="none" stroke="var(--bg-card)" strokeWidth="10" />
              <motion.circle
                cx="112" cy="112" r={R}
                fill="none"
                stroke="var(--accent-lime)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - progress / 100)}
                style={{ filter: "drop-shadow(0 0 10px rgba(126, 200, 80, 0.35))" }}
                transition={{ duration: 1 }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                className="heading text-5xl tabular-nums"
                style={{ color: "var(--text-primary)" }}
                key={`${minutes}-${seconds}`}
                initial={{ scale: 1.08 }}
                animate={{ scale: 1      }}
                transition={{ duration: 0.15 }}
              >
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </motion.div>
              <p
                className="text-xs uppercase tracking-wider mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                {SESSION_LABELS[sessionType]}
              </p>
            </div>
          </div>

          {/* Controls */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: 0.2 }}
          >
            <motion.button
              onClick={handleReset}
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "var(--bg-card)", color: "var(--text-secondary)" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              aria-label="Réinitialiser"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>

            <motion.button
              onClick={() => setIsRunning((r) => !r)}
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg border"
              style={{
                backgroundColor: "var(--accent-lime)",
                borderColor:     "rgba(255,255,255,0.15)",
              }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 32px rgba(126, 200, 80, 0.4)" }}
              whileTap={{ scale: 0.93 }}
              aria-label={isRunning ? "Pause" : "Démarrer"}
            >
              {isRunning ? (
                <Pause className="w-8 h-8" style={{ color: "var(--bg-main)" }} fill="var(--bg-main)" />
              ) : (
                <Play  className="w-8 h-8 ml-1" style={{ color: "var(--bg-main)" }} fill="var(--bg-main)" />
              )}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* ── Sessions Counter ── */}
        <motion.div
          className="rounded-2xl p-4 flex items-center gap-4"
          style={{ backgroundColor: "var(--bg-surface)" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.25 }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "var(--bg-card)" }}
          >
            <Coffee className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
          </div>
          <div className="flex-1">
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Sessions complétées aujourd'hui
            </p>
          </div>
          <motion.div
            className="heading text-3xl"
            style={{ color: "var(--accent-lime)" }}
            key={sessionsCompleted}
            initial={{ scale: 1.3, opacity: 0.6 }}
            animate={{ scale: 1,   opacity: 1   }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {sessionsCompleted}
          </motion.div>
        </motion.div>

        {/* ── Notification hint ── */}
        {typeof Notification !== "undefined" && Notification.permission === "default" && (
          <motion.div
            className="mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl border"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span className="text-base">🔔</span>
            <p className="text-xs flex-1" style={{ color: "var(--text-secondary)" }}>
              Activez les <span style={{ color: "var(--accent-lime)" }}>notifications</span> dans
              le Profil pour recevoir les alertes de fin de session.
            </p>
          </motion.div>
        )}

      </div>
    </div>
  );
}
