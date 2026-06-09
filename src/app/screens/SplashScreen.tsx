import { useEffect } from "react";
import { motion } from "motion/react";

interface SplashScreenProps {
  onDone: () => void;
}

// SVG dimensions for the animated logo
const SIZE = 110;
const CX = SIZE / 2;
const CY = SIZE / 2;
const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 263.9
// 75% of circumference
const ARC_75 = CIRCUMFERENCE * 0.75; // ≈ 197.9
const GAP_25 = CIRCUMFERENCE * 0.25; // ≈ 65.97

export function SplashScreen({ onDone }: SplashScreenProps) {
  useEffect(() => {
    const timeout = setTimeout(onDone, 2200);
    return () => clearTimeout(timeout);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ backgroundColor: "#090D0A" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
    >
      {/* ── Animated Logo ── */}
      <motion.div
        initial={{ scale: 0.65, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.05 }}
      >
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          width={SIZE}
          height={SIZE}
          xmlns="http://www.w3.org/2000/svg"
          overflow="visible"
        >
          {/* Outer subtle halo */}
          <motion.circle
            cx={CX} cy={CY} r={RADIUS + 14}
            fill="none"
            stroke="#7EC850"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          />

          {/* Track ring */}
          <circle
            cx={CX} cy={CY} r={RADIUS}
            fill="none"
            stroke="#1C2E1E"
            strokeWidth="6"
          />

          {/* Animated progress arc (0 → 75%) */}
          <motion.circle
            cx={CX} cy={CY} r={RADIUS}
            fill="none"
            stroke="#7EC850"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${ARC_75} ${GAP_25}`}
            style={{ rotate: -90, transformOrigin: `${CX}px ${CY}px` }}
            initial={{ strokeDashoffset: ARC_75 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.85, delay: 0.35, ease: "easeOut" }}
          />

          {/* Animated checkmark */}
          <motion.path
            d={`M${CX - 20} ${CY + 2} L${CX - 5} ${CY + 17} L${CX + 22} ${CY - 14}`}
            stroke="#7EC850"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            pathLength="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.75, ease: "easeOut" }}
          />
        </svg>
      </motion.div>

      {/* ── App name ── */}
      <motion.div
        className="text-center mt-7"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.4 }}
      >
        <h1
          className="text-2xl font-semibold tracking-wide"
          style={{ color: "#F5F7F6", letterSpacing: "0.04em" }}
        >
          Todo
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "#94A39B", letterSpacing: "0.02em" }}
        >
          Gestionnaire de tâches
        </p>
      </motion.div>

      {/* ── Animated loading dots ── */}
      <motion.div
        className="flex gap-2 mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "#7EC850" }}
            animate={{ opacity: [0.25, 1, 0.25], scale: [0.75, 1.1, 0.75] }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              delay: i * 0.22,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
