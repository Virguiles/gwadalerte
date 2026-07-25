'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Bienvenue sur GwadaSVG !',
    description: 'Suivez l\'état de la Guadeloupe en temps réel : météo, qualité de l\'air et tours d\'eau.',
    icon: '🌴'
  },
  {
    title: 'Explorez la carte interactive',
    description: 'Cliquez sur une commune pour voir ses détails. Sur mobile, maintenez appuyé pour voir le nom.',
    icon: '🗺️'
  },
  {
    title: 'Changez de catégorie',
    description: 'Utilisez les onglets Météo, Eau et Air pour voir différentes données sur la carte.',
    icon: '🔄'
  },
  {
    title: 'Restez informé',
    description: 'Les données sont mises à jour régulièrement. Consultez l\'indicateur de fraîcheur pour vérifier.',
    icon: '📊'
  }
];

const ONBOARDING_KEY = 'gwadaSvg_onboardingCompleted';

export const OnboardingTour: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompletedOnboarding) {
      // Show onboarding after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = React.useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsVisible(false);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleClose]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isVisible) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto transform transition-all"
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-title"
        >
          {/* Header */}
          <div className="relative p-6 pb-4">
            <button
              ref={closeButtonRef}
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Progress indicator */}
            <div className="flex gap-1.5 mb-6">
              {ONBOARDING_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full flex-1 transition-colors ${
                    index <= currentStep
                      ? 'bg-blue-600 dark:bg-blue-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>

            {/* Icon */}
            <div className="text-6xl text-center mb-4">
              {step.icon}
            </div>

            {/* Content */}
            <h2
              id="onboarding-title"
              className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3"
            >
              {step.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl flex items-center justify-between gap-3">
            {currentStep > 0 ? (
              <button
                onClick={handlePrevious}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
                Retour
              </button>
            ) : (
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
              >
                Passer
              </button>
            )}

            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {isLastStep ? 'Commencer' : 'Suivant'}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
