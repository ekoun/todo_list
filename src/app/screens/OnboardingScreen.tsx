import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Target, TrendingUp, ArrowRight } from "lucide-react";

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: CheckCircle2,
      title: "Organisez vos tâches",
      description: "Créez, organisez et suivez toutes vos tâches en un seul endroit. Restez productif et concentré."
    },
    {
      icon: Target,
      title: "Mode Focus",
      description: "Utilisez le timer Pomodoro pour rester concentré et maximiser votre productivité."
    },
    {
      icon: TrendingUp,
      title: "Suivez vos progrès",
      description: "Visualisez vos statistiques et célébrez vos succès. Améliorez-vous chaque jour."
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg-main)" }}>
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        {/* Step Indicator */}
        <div className="flex gap-2 mb-12">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              className="h-1 rounded-full"
              style={{
                width: index === currentStep ? "32px" : "8px",
                backgroundColor: index === currentStep ? "var(--accent-lime)" : "var(--bg-surface)"
              }}
              initial={false}
              animate={{
                width: index === currentStep ? "32px" : "8px"
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className="text-center max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Icon */}
            <motion.div
              className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center relative"
              style={{ backgroundColor: "var(--bg-surface)" }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            >
              <Icon className="w-12 h-12" style={{ color: "var(--accent-lime)" }} strokeWidth={1.5} />
              <motion.div
                className="absolute inset-0 rounded-3xl opacity-20"
                style={{ boxShadow: "0 0 60px var(--accent-lime)" }}
                animate={{
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* Title */}
            <motion.h1
              className="heading text-3xl mb-4"
              style={{ color: "var(--text-primary)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {currentStepData.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-lg leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {currentStepData.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Button */}
      <div className="px-8 pb-12">
        <motion.button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-2xl"
          style={{
            backgroundColor: "var(--accent-lime)",
            color: "var(--bg-main)"
          }}
          whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(198, 255, 59, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {currentStep < steps.length - 1 ? "Suivant" : "Commencer"}
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        {currentStep < steps.length - 1 && (
          <motion.button
            onClick={onComplete}
            className="w-full py-3 mt-3 rounded-2xl font-medium"
            style={{ color: "var(--text-secondary)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Passer
          </motion.button>
        )}
      </div>
    </div>
  );
}
